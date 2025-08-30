// import React, { createContext, useContext, useEffect, useState } from "react"
// import { authService, User } from "../services/auth"
// import { tokenStorage } from "../utils/token"

// interface AuthContextType {
//   user: User | null
//   isAuthenticated: boolean
//   isLoading: boolean
//   login: (email: string, password: string) => Promise<void>
//   register: (
//     name: string,
//     walletId: string,
//     email: string,
//     password: string,
//     role: "producer" | "buyer"
//   ) => Promise<boolean>
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const initializeAuth = async () => {
//       const token = tokenStorage.get()
//       if (token && authService.isAuthenticated()) {
//         try {
//           const currentUser = await authService.getCurrentUser()
//           setUser(currentUser)
//           setIsAuthenticated(true)
//         } catch (error) {
//           console.error("Failed to get current user:", error)
//           tokenStorage.clear()
//         }
//       }
//       setIsLoading(false)
//     }

//     initializeAuth()
//   }, [])

//   const login = async (email: string, password: string) => {
//     try {
//       const { user } = await authService.login({ email, password })
//       setUser(user)
//       setIsAuthenticated(true)
//     } catch (error) {
//       console.error("Login failed:", error)
//       throw error
//     }
//   }

//   const register = async (
//     name: string,
//     walletId: string,
//     email: string,
//     password: string,
//     role: "producer" | "buyer"
//   ): Promise<boolean> => {
//     try {
//       await authService.register({ name, walletId, email, password, role })
//       setIsAuthenticated(true)
//       return true
//     } catch (error) {
//       console.error("Registration failed:", error)
//       return false
//     }
//   }

//   const logout = () => {
//     authService.logout()
//     setUser(null)
//     setIsAuthenticated(false)
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         isLoading,
//         login,
//         register,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react"
import { authService, User, LoginCredentials, RegisterCredentials } from "../services/auth"
import { tokenStorage } from "../utils/token"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load user from localStorage at startup
  useEffect(() => {
    const storedUser = tokenStorage.getUser()
    const token = tokenStorage.get()
    if (token && storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const { token, role, email } = await authService.login(credentials)

    // Build minimal user object (adapted to your backend response)
    const user: User = {
      user_id: 0, // backend doesn’t return id in login → set default
      name: email.split("@")[0],
      email,
      role,
      wallet_address: "",
    }

    tokenStorage.set(token, user)
    setUser(user)
    setIsAuthenticated(true)
  }

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials)
    return true
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

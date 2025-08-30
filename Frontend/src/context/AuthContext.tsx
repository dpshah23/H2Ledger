// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, User } from '../services/auth'
import { tokenStorage } from '../utils/token'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: 'producer' | 'consumer', wallet_address: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.get()
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setIsAuthenticated(true)
        } catch (error) {
          tokenStorage.clear()
        }
      }
      setIsLoading(false)
    }
    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { user } = await authService.login({ email, password })
    setUser(user)
    setIsAuthenticated(true)
  }

  const register = async (email: string, password: string, name: string, role: 'producer' | 'consumer', wallet_address: string) => {
    const { user } = await authService.register({ email, password, name, role, wallet_address })
    setUser(user)
    setIsAuthenticated(true)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

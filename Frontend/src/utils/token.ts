// src/utils/token.ts
export const tokenStorage = {
  get: () => localStorage.getItem("accessToken"),
  set: (token: string) => localStorage.setItem("accessToken", token),
  remove: () => localStorage.removeItem("accessToken"),

  // User handling
  getUser: () => {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },
  setUser: (user: any) => {
    localStorage.setItem("user", JSON.stringify(user))
  },
  removeUser: () => localStorage.removeItem("user"),

  // Clear all
  clear: () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
  },
}

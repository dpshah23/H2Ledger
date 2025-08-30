import { apiService } from "./api"

export interface User {
  user_id: number
  name: string
  email: string
  role: "buyer" | "producer"
  wallet_address: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  wallet_address: string
  email: string
  password: string
  role: "buyer" | "producer"
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiService.post("/auth/login/", credentials)
    return response.data
  },

  async register(credentials: RegisterCredentials) {
    const response = await apiService.post("/auth/signup/", credentials)
    return response.data
  },

  async logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}

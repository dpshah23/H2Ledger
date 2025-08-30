// src/services/auth.ts
import { apiService } from './api'
import { tokenStorage } from '../utils/token'
import { API_ENDPOINTS } from '../utils/constants'

// ---------- Type Definitions ----------

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Registration credentials
export interface RegisterCredentials {
  email: string
  password: string
  name: string                   // full name
  role: 'producer' | 'consumer'  // only two roles
  wallet_address: string
}

// User returned from backend
export interface User {
  user_id: string
  email: string
  name: string
  role: 'producer' | 'consumer'
  wallet_address: string
}

// ---------- Auth Service ----------

export const authService = {

  // LOGIN
  async login(credentials: LoginCredentials) {
    const response = await apiService.post(API_ENDPOINTS.auth.login, credentials)
    const { token, user } = response.data   // single token from backend

    tokenStorage.set(token)   // store token only
    return { user, token }
  },

  // REGISTER
  async register(credentials: RegisterCredentials) {
    const response = await apiService.post(API_ENDPOINTS.auth.register, credentials)
    const { token, user } = response.data   // single token

    tokenStorage.set(token)
    return { user, token }
  },

  // LOGOUT
  async logout() {
    tokenStorage.clear()      // clear token locally
  },

  // GET CURRENT USER
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get('/auth1/user/')
    return response.data
  },

  // CHECK AUTHENTICATION
  isAuthenticated(): boolean {
    const token = tokenStorage.get()
    return !!token   // token exists → authenticated
  }
}

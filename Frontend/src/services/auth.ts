import { apiService } from './api'
import { tokenStorage , isTokenExpired } from '../utils/token'
import { API_ENDPOINTS } from '../utils/constants'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'producer' | 'buyer' | 'regulator'
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiService.post(API_ENDPOINTS.auth.login, credentials)
    const { access, refresh, user } = response.data
    
    tokenStorage.set(access)
    tokenStorage.setRefresh(refresh)
    
    return { user, token: access }
  },

  async register(credentials: RegisterCredentials) {
    const response = await apiService.post(API_ENDPOINTS.auth.register, credentials)
    const { access, refresh, user } = response.data
    
    tokenStorage.set(access)
    tokenStorage.setRefresh(refresh)
    
    return { user, token: access }
  },

  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.auth.logout)
    } finally {
      tokenStorage.clear()
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get('/auth/user/')
    return response.data
  },

  isAuthenticated(): boolean {
    const token = tokenStorage.get()
    return token ? !isTokenExpired(token) : false
  }
}
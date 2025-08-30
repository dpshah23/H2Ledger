<<<<<<< HEAD
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
=======
// src/services/ApiService.ts?
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from "axios"
>>>>>>> 7e5893a87840be1b38c7c94893d8611725d74dd0
import { tokenStorage } from "../utils/token"

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
      headers: {
        "Content-Type": "application/json",
      },
    })

<<<<<<< HEAD
    // ---------- Request Interceptor ----------
    this.api.interceptors.request.use((config: AxiosRequestConfig) => {
      const token = tokenStorage.get()
      if (token) {
        // Fix TypeScript error by casting headers to 'any'
        if (!config.headers) config.headers = {} as any
        (config.headers as any).Authorization = `Bearer ${token}`
=======
    // Request interceptor → attach token
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken()
      if (token) {
        // Axios v1+ uses AxiosHeaders, which has a set() method
        if (config.headers.set) {
          config.headers.set("Authorization", `Bearer ${token}`)
        } else {
          // fallback for possible legacy types
          config.headers["Authorization"] = `Bearer ${token}`
        }
>>>>>>> 7e5893a87840be1b38c7c94893d8611725d74dd0
      }
      return config
    })
  }

  // ---------- HTTP Methods ----------
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config)
  }
}

export const apiService = new ApiService()

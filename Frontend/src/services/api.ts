// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
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

    // ---------- Request Interceptor ----------
    this.api.interceptors.request.use((config: AxiosRequestConfig) => {
      const token = tokenStorage.get()
      if (token) {
        // Fix TypeScript error by casting headers to 'any'
        if (!config.headers) config.headers = {} as any
        (config.headers as any).Authorization = `Bearer ${token}`
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

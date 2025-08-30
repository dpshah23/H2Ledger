// src/services/ApiService.ts?
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from "axios"
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
      }
      return config
    })
  }

  // Example GET request
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

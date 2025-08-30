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

    // Request interceptor: attach token
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken()
      if (token && config.headers) {
        const authHeader = `Bearer ${token}`
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", authHeader)
        } else {
          config.headers["Authorization"] = authHeader
        }
      }
      return config
    })

    // Response interceptor for global error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          tokenStorage.removeAccessToken()
          // Redirect to login or show error message
        }
        return Promise.reject(error)
      }
    )
  }

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


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
      if (token) {
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${token}`)
        } else if (config.headers) {
          (config.headers as any)["Authorization"] = `Bearer ${token}`
        }
      }
      return config
    })

    // Response interceptor: handle errors globally (optional, can be expanded)
    this.api.interceptors.response.use(
      response => response,
      error => {
        // Example: handle 401 errors globally
        // if (error.response && error.response.status === 401) {
        //   // Optionally trigger logout or redirect
        // }
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

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { tokenStorage } from "../utils/token";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor: attach token
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        const authHeader = `Bearer ${token}`;
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", authHeader);
        } else {
          (config.headers as any)["Authorization"] = authHeader;
        }
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          tokenStorage.removeAccessToken();
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }

  // ---------------- Dashboard APIs ----------------
  getDashboardAnalytics() {
    return this.get("/api/dashboard/analytics/");
  }

  getDashboardTransactions(limit = 10) {
    return this.get(`/api/dashboard/transactions/?limit=${limit}`);
  }

  // ---------------- Market Data ----------------
  getMarketData() {
    return this.get("/api/market/data/");
  }

  // ---------------- Trading ----------------
  getTradingOrders() {
    return this.get("/api/trading/orders/");
  }

  createTradingOrder(orderData: {
    order_type: "buy" | "sell";
    credit_batch?: number;
    quantity: number;
    price_per_credit: number;
    expires_at?: string;
  }) {
    return this.post("/api/trading/orders/", orderData);
  }

  burnCredits(creditIds: number[]) {
    return this.post("/api/trading/burn/", { credit_ids: creditIds });
  }

  // ---------------- Credits ----------------
  getCredits(page = 1, limit = 10) {
    return this.get(`/api/credits/?page=${page}&limit=${limit}`);
  }

  getCreditDetail(creditId: number) {
    return this.get(`/api/credits/${creditId}/`);
  }

  // ---------------- Chatbot ----------------
  sendChatMessage(question: string) {
    return this.post<{ answer: string }>("/kb/chatbot/", { question });
  }
}

export const apiService = new ApiService();

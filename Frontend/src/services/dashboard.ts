import { apiService } from './api'
import { API_ENDPOINTS } from '../utils/constants'

export interface DashboardAnalytics {
  totalCreditsOwned: number
  creditsTraded: {
    today: number
    thisWeek: number
  }
  marketPrice: {
    current: number
    change24h: number
    trend: Array<{ date: string; price: number }>
  }
  emissionsOffset: {
    total: number
    thisMonth: number
    target: number
  }
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'transfer' | 'mint' | 'burn'
  creditId: string
  quantity: number
  price: number
  counterparty: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

export interface Credit {
  id: number
  batchId: number
  amount: number
  status: 'active' | 'transferred' | 'burned'
  txHash: string
  createdAt: string
  batch: {
    producer: string
    productionDate: string
    quantityKg: number
  }
}

export interface CreditDetail extends Credit {
  batch: {
    id: number
    producer: string
    producerEmail: string
    quantityKg: number
    productionDate: string
    certification: string
    isApproved: boolean
    createdAt: string
  }
  transactions: Array<{
    id: number
    type: string
    amount: number
    fromUser: string | null
    toUser: string | null
    fiatValue: number | null
    txHash: string
    timestamp: string
  }>
}

export const dashboardService = {
  async getAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await apiService.get(API_ENDPOINTS.dashboard.analytics)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error)
      // Return default data if API fails
      return {
        totalCreditsOwned: 0,
        creditsTraded: { today: 0, thisWeek: 0 },
        marketPrice: { current: 50.0, change24h: 0, trend: [] },
        emissionsOffset: { total: 0, thisMonth: 0, target: 1000 }
      }
    }
  },

  async getTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.dashboard.transactions}?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  },

  async getCredits(page: number = 1, limit: number = 20, status: string = 'active'): Promise<{
    credits: Credit[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.credits.list}?page=${page}&limit=${limit}&status=${status}`)
      return response.data
    } catch (error) {
      console.error('Error fetching credits:', error)
      return {
        credits: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      }
    }
  },

  async getCreditDetail(creditId: number): Promise<CreditDetail | null> {
    try {
      const response = await apiService.get(API_ENDPOINTS.credits.detail(creditId.toString()))
      return response.data
    } catch (error) {
      console.error('Error fetching credit detail:', error)
      return null
    }
  },

  async transferCredit(creditId: number, toAddress: string, amount: number): Promise<boolean> {
    try {
      const response = await apiService.post(API_ENDPOINTS.api.transfer, {
        credit_id: creditId,
        to_address: toAddress,
        amount: amount
      })
      return response.status === 200
    } catch (error) {
      console.error('Error transferring credit:', error)
      return false
    }
  },

  async burnCredit(creditId: number, amount: number): Promise<boolean> {
    try {
      const response = await apiService.post(API_ENDPOINTS.api.use, {
        credit_id: creditId,
        amount: amount
      })
      return response.status === 200
    } catch (error) {
      console.error('Error burning credit:', error)
      return false
    }
  }
}
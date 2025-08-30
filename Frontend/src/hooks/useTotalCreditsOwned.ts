import { apiService } from '../services/api.ts'
import { API_ENDPOINTS } from '../utils/constants'
import { useEffect, useState } from "react";
import { useWallet } from "../utils/wallet";
import { getContract } from "../utils/contract";

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
  type: 'buy' | 'sell' | 'transfer'
  creditId: string
  quantity: number
  price: number
  counterparty: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

export const dashboardService = {
  async getAnalytics(): Promise<DashboardAnalytics> {
    const response = await apiService.get(API_ENDPOINTS.dashboard.analytics)
    return response.data
  },

  async getTransactions(limit: number = 10): Promise<Transaction[]> {
    const response = await apiService.get(`${API_ENDPOINTS.dashboard.transactions}?limit=${limit}`)
    return response.data
  }
}

export function useTotalCreditsOwned() {
  const { account, provider } = useWallet();
  const [totalCreditsOwned, setTotalCreditsOwned] = useState<number>(0);

  useEffect(() => {
    if (!account || !provider) return;
    const contract = getContract(provider);

    async function fetchTotalCredits() {
      try {
        // Call the contract function
        const result = await contract.totalCreditsOwned(account);
        setTotalCreditsOwned(Number(result));
      } catch (err) {
        setTotalCreditsOwned(0);
      }
    }

    fetchTotalCredits();
  }, [account, provider]);

  return totalCreditsOwned;
}
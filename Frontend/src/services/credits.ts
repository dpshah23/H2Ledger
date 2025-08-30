import { apiService } from './api'
import { API_ENDPOINTS } from '../utils/constants'

export interface CreditToken {
  id: string
  tokenId: string
  batchId: string
  quantity: number
  origin: string
  productionDate: string
  verified: boolean
  owner: string
  metadata: {
    facilityName: string
    location: string
    certificationBody: string
    co2Offset: number
  }
  pricePerCredit: number
  totalValue: number
}

export interface TransferRequest {
  creditId: string
  toAddress: string
  quantity: number
}

export const creditsService = {
  async getCredits(): Promise<CreditToken[]> {
    const response = await apiService.get(API_ENDPOINTS.credits.list)
    return response.data
  },

  async getCreditDetail(id: string): Promise<CreditToken> {
    const response = await apiService.get(API_ENDPOINTS.credits.detail(id))
    return response.data
  },

  async transferCredit(transferData: TransferRequest) {
    const response = await apiService.post(API_ENDPOINTS.credits.transfer, transferData)
    return response.data
  }
}
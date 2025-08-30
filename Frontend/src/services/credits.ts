import { BrowserProvider, Signer, TransactionResponse } from 'ethers'
import { apiService } from './api'
import { API_ENDPOINTS } from '../utils/constants'
import { getContract } from '../utils/contract.ts'

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
  // ----- API BACKEND METHODS -----
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
  },

  // ----- BLOCKCHAIN METHODS -----
  async getAllCredits(provider: BrowserProvider | Signer): Promise<any[]> {
    const contract = getContract(provider)
    const credits = await contract.getAllCredits()
    return credits
  },

  async getCreditById(tokenId: number, provider: BrowserProvider | Signer): Promise<any> {
    const contract = getContract(provider)
    const credit = await contract.getCredit(tokenId)
    return credit
  },

  async transferCreditOnChain(
    tokenId: number,
    toAddress: string,
    signer: Signer
  ): Promise<TransactionResponse> {
    const contract = getContract(signer)
    const tx = await contract.transferCredit(tokenId, toAddress)
    await tx.wait() // wait for confirmation
    return tx
  }
}

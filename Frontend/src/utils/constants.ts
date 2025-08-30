export const BRAND = {
  name: 'H2Ledger',
  shortName: 'H2',
  description: 'Green Hydrogen Credits Platform'
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
  },
  credits: {
    list: '/api/credits/',
    detail: (id: string) => `/api/credits/${id}/`,
    transfer: '/api/credits/transfer/',
  },
  dashboard: {
    analytics: '/api/dashboard/analytics/',
    transactions: '/api/dashboard/transactions/',
  },
  audit: {
    transactions: '/api/audit/transactions/',
    verification: '/api/audit/verification/',
  }
} as const

export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const
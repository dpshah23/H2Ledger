export const BRAND = {
  name: 'H2Ledger',
  shortName: 'H2',
  description: 'Green Hydrogen Credits Platform'
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth1/login/',
    register: '/auth1/register/',
    logout: '/auth1/logout/',
    refresh: '/auth1/refresh/',
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
  api: {
    transfer: '/api/transfer/',
    mint: '/api/mint/',
    use: '/api/use/',
    health: '/api/health/',
  },
  batch: {
    create: '/api/batch/create/',
    list: '/api/batch/list/',
    verify: '/api/batch/',
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
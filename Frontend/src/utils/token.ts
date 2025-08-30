const TOKEN_KEY = 'h2ledger_access_token'
const REFRESH_TOKEN_KEY = 'h2ledger_refresh_token'

export const tokenStorage = {
  // Access token methods
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),

  // Refresh token methods
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefresh: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefresh: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  // Clear all tokens
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  // Aliases to match ApiService expectations
  getAccessToken() {
    return this.get()
  },
  setAccessToken(token: string) {
    this.set(token)
  },
  removeAccessToken() {
    this.remove()
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

// src/utils/token.ts

// Key for storing access token in localStorage
const TOKEN_KEY = 'h2ledger_access_token'

export const tokenStorage = {
  // ---------- Access token methods ----------
  
  // Get token
  get: () => localStorage.getItem(TOKEN_KEY),

  // Set token
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  // Remove token
  remove: () => localStorage.removeItem(TOKEN_KEY),

  // Clear all tokens (here only access token)
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  // ---------- Aliases for ApiService / AuthService ----------
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

// ---------- Optional: check if token expired ----------
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    // If parsing fails, assume expired
    return true
  }
}

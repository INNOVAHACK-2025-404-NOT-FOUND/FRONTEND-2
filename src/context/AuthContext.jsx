import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { request } from '../lib/api'

const AuthContext = createContext(null)

const storageKey = 'totalpec_auth'

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { token: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuthState] = useState(getStoredAuth)
  const persist = useCallback((nextToken, nextUser) => {
    const payload = { token: nextToken, user: nextUser }
    setAuthState(payload)
    if (typeof window !== 'undefined') {
      if (nextToken && nextUser) {
        localStorage.setItem(storageKey, JSON.stringify(payload))
      } else {
        localStorage.removeItem(storageKey)
      }
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    persist(response.token, response.user)
    return response.user
  }, [persist])

  const logout = useCallback(() => {
    persist(null, null)
  }, [persist])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [token, user, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }
  return context
}

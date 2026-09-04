import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Restore session on mount
  useEffect(() => {
    const token  = localStorage.getItem('sahara_token')
    const stored = localStorage.getItem('sahara_user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch {
        localStorage.removeItem('sahara_user')
        localStorage.removeItem('sahara_token')
      }
    }
    setLoading(false)
  }, [])

  // Handle global 401 events from axios interceptor
  useEffect(() => {
    const handler = () => { setUser(null) }
    window.addEventListener('sahara:unauthorized', handler)
    return () => window.removeEventListener('sahara:unauthorized', handler)
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const res = await authApi.login(email, password)
      // Backend returns { success, data: { token, refreshToken, user } }
      const { token, refreshToken, user: userData } = res.data || res
      localStorage.setItem('sahara_token',        token)
      localStorage.setItem('sahara_refresh_token', refreshToken)
      localStorage.setItem('sahara_user',          JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    try {
      const res = await authApi.register(payload)
      const { token, refreshToken, user: userData } = res.data || res
      localStorage.setItem('sahara_token',        token)
      localStorage.setItem('sahara_refresh_token', refreshToken)
      localStorage.setItem('sahara_user',          JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('sahara_refresh_token')
    try { await authApi.logout(refreshToken) } catch {}
    localStorage.removeItem('sahara_token')
    localStorage.removeItem('sahara_refresh_token')
    localStorage.removeItem('sahara_user')
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

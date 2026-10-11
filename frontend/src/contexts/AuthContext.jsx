import { useCallback, useEffect, useMemo, useState } from 'react'
import { UNAUTHORIZED_EVENT, tokenStore } from '../services/api'
import { authService } from '../services/authService'
import { AuthContext } from './authState'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  // Khôi phục phiên đăng nhập từ token đã lưu.
  useEffect(() => {
    if (!tokenStore.get()) return undefined
    let alive = true
    authService.profile()
      .then(response => { if (alive) setUser(response.data) })
      .catch(() => tokenStore.clear())
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const start = useCallback(response => {
    tokenStore.set(response.data.token)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const login = useCallback(async (email, password) => start(await authService.login(email, password)), [start])
  const register = useCallback(async body => start(await authService.register(body)), [start])
  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* token có thể đã hết hạn */ }
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, setUser }), [user, loading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

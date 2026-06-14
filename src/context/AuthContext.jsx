import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    const authToken = data.token || data.accessToken || data.jwt
    if (!authToken) throw new Error('No token received from server')
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(data))
    setToken(authToken)
    setUser(data)
    return data
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = () => !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

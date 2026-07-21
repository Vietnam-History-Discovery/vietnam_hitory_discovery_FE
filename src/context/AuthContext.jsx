import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import * as authService from '../services/authService'
import { getMe } from '../services/userService'
import { AuthContext } from './authContextInstance'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
        try {
          const profile = await getMe()
          setRole(profile.role)
        } catch {
          setRole(null)
        }
      } else {
        setUser(null)
        setToken(null)
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    return await authService.login(email, password)
  }

  const logout = async () => {
    await authService.logout()
  }

  const isAuthenticated = () => !!user
  const isAdmin = role === 'ADMIN'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 animate-message-in">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-surface2 border-t-primary animate-spin" />
            <span className="text-primary text-2xl">✦</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-primary font-bold tracking-[0.2em] text-sm uppercase">Vietnam Chronicles</p>
            <p className="text-gray-600 text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, role, isAdmin, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

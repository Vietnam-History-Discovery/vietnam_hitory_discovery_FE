import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
      } else {
        setUser(null)
        setToken(null)
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

  if (loading) return <div>Loading...</div>

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

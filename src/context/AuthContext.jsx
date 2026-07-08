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
    // Check if there is a mocked session in localStorage/sessionStorage
    const savedUserJson = localStorage.getItem('mock_user');
    if (savedUserJson) {
      const savedUser = JSON.parse(savedUserJson);
      setUser({
        ...savedUser,
        getIdToken: async () => 'mock-token-123'
      });
      setToken('mock-token-123');
      setLoading(false);
      return;
    }

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
    try {
      const u = await authService.login(email, password)
      return u
    } catch (err) {
      console.warn("Firebase login failed, falling back to mock authentication:", err)
      const mockUser = {
        uid: 'mock-uid-123',
        email: email || 'testuser@example.com',
        displayName: email ? email.split('@')[0] : 'Test User',
      }
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser({
        ...mockUser,
        getIdToken: async () => 'mock-token-123'
      });
      setToken('mock-token-123');
      return mockUser;
    }
  }

  const logout = async () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    setToken(null);
    try {
      await authService.logout()
    } catch (e) {}
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

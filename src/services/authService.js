import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}

export const register = async (username, email, password) => {
  const response = await api.post('/api/auth/register', { username, email, password })
  return response.data
}

export const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export const getToken = () => localStorage.getItem('auth_token')

export const isAuthenticated = () => !!getToken()

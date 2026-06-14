import api from './api'

// dynastyService.js
export const getDynasties = async () => {
  const res = await api.get('/api/dynasties')
  return res.data.dynasties  
}

export const getDynastyByName = async (name) => {
  const response = await api.get(`/api/dynasties/${encodeURIComponent(name)}`)
  return response.data
}

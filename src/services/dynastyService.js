import api from './api'

export const getDynasties = async () => {
  const res = await api.get('/api/dynasties')
  return res.data.dynasties
}

export const getDynastyByName = async (name) => {
  const response = await api.get(`/api/dynasties/${encodeURIComponent(name)}`)
  return response.data
}

export const getDynastyFromList = (dynasties, name) => {
  if (!dynasties || !name) return null
  const lower = name.toLowerCase()
  return dynasties.find((d) => d.name.toLowerCase() === lower) ?? null
}

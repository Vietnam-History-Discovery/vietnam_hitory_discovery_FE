import api from './api'

export const createSession = async (title) => {
  const response = await api.post('/api/chat/sessions', { title })
  return response.data
}

export const askQuestion = async (sessionId, question, context) => {
  const response = await api.post(`/api/chat/sessions/${sessionId}/ask`, {
    question,
    ...(context ? { context } : {}),
  })
  return response.data
}

export const getSessionMessages = async (sessionId) => {
  const response = await api.get(`/api/chat/sessions/${sessionId}/messages`)
  // Normalise: API may return array or { messages: [...] }
  const raw = response.data
  return Array.isArray(raw) ? raw : (raw.messages ?? [])
}

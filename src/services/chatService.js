import api from './api'
import { streamRequest } from './sseClient'

export const chatService = {
  createSession: async (title = null, type = 'CHAT') => {
    const res = await api.post('/api/chat/sessions', { title, type })
    return res.data
  },

  getSessions: async (type = null) => {
    const params = type ? { type } : {}
    const res = await api.get('/api/chat/sessions', { params })
    return res.data
  },

  getSession: async (sessionId) => {
    const res = await api.get(`/api/chat/sessions/${sessionId}`)
    return res.data
  },

  sendMessage: async (sessionId, message, context = null) => {
    const res = await api.post(`/api/chat/sessions/${sessionId}/ask`, {
      question: message,
      context: context
    })
    return res.data
  },

  streamMessage: (sessionId, message, handlers, context = null) =>
    streamRequest(`/api/chat/sessions/${sessionId}/ask/stream`, { question: message, context }, handlers),

  streamTimelineMessage: (sessionId, message, handlers, context = null) =>
    streamRequest(`/api/chat/sessions/${sessionId}/timeline/stream`, { question: message, context }, handlers),

  getMessages: async (sessionId) => {
    const res = await api.get(`/api/chat/sessions/${sessionId}/messages`)
    return res.data
  },

  deleteSession: async (sessionId) => {
    await api.delete(`/api/chat/sessions/${sessionId}`)
  },
}

export const createSession = chatService.createSession
export const getSessions = chatService.getSessions
export const getSessionMessages = chatService.getMessages
export const askQuestion = (sessionId, question, context = null) =>
  chatService.sendMessage(sessionId, question, context)

export default chatService

import api from './api'
import { streamRequest } from './sseClient'

const mockSessions = {}

export const chatService = {
  createSession: async (title = null, type = 'CHAT') => {
    try {
      const res = await api.post('/api/chat/sessions', { title, type })
      return res.data
    } catch (e) {
      console.warn("API createSession failed, using mock fallback:", e)
      const mockId = 'mock-session-' + Date.now()
      mockSessions[mockId] = []
      return { id: mockId, title, type, createdAt: new Date().toISOString() }
    }
  },

  getSessions: async (type = null) => {
    try {
      const params = type ? { type } : {}
      const res = await api.get('/api/chat/sessions', { params })
      return res.data
    } catch (e) {
      console.warn("API getSessions failed, returning mock fallback:", e)
      return Object.keys(mockSessions).map(id => ({
        id,
        title: 'Chronicle Session',
        type: type || 'CHAT',
        createdAt: new Date().toISOString()
      }))
    }
  },

  getSession: async (sessionId) => {
    try {
      const res = await api.get(`/api/chat/sessions/${sessionId}`)
      return res.data
    } catch (e) {
      console.warn(`API getSession for ${sessionId} failed, returning mock fallback:`, e)
      return { id: sessionId, title: 'Chronicle Session', messages: mockSessions[sessionId] || [] }
    }
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
    try {
      const res = await api.get(`/api/chat/sessions/${sessionId}/messages`)
      return res.data
    } catch (e) {
      console.warn(`API getMessages for ${sessionId} failed, returning mock messages:`, e)
      return mockSessions[sessionId] || []
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await api.delete(`/api/chat/sessions/${sessionId}`)
    } catch (e) {
      console.warn(`API deleteSession failed for ${sessionId}:`, e)
      delete mockSessions[sessionId]
    }
  },
}

export const createSession = chatService.createSession
export const getSessions = chatService.getSessions
export const getSessionMessages = chatService.getMessages
export const askQuestion = (sessionId, question, context = null) =>
  chatService.sendMessage(sessionId, question, context)
export const streamMessage = chatService.streamMessage

export default chatService


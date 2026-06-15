import api from './api'

export const chatService = {
  createSession: async (title = null) => {
    const res = await api.post('/api/chat/sessions', { title })
    return res.data // { id, title, createdAt, updatedAt }
  },

  getSessions: async () => {
    const res = await api.get('/api/chat/sessions')
    return res.data // [{ id, title, lastMessage, createdAt, updatedAt }]
  },

  getSession: async (sessionId) => {
    const res = await api.get(`/api/chat/sessions/${sessionId}`)
    return res.data // { id, title, messages: [{role, content, timestamp}] }
  },

  sendMessage: async (sessionId, message, context = null) => {
    const res = await api.post(`/api/chat/sessions/${sessionId}/ask`, {
      question: message,  
      context: context   
    })
    return res.data
  },

  getMessages: async (sessionId) => {
    const res = await api.get(`/api/chat/sessions/${sessionId}/messages`)
    return res.data // [{ id, role, content, createdAt }]
  },

  deleteSession: async (sessionId) => {
    await api.delete(`/api/chat/sessions/${sessionId}`)
  },
}

// Named re-exports for all existing consumers
export const createSession = chatService.createSession
export const getSessions = chatService.getSessions
export const getSessionMessages = chatService.getMessages
export const askQuestion = (sessionId, question, context = null) =>
  chatService.sendMessage(sessionId, question, context)

export default chatService

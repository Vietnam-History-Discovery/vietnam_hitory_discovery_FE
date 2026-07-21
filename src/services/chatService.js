import api from './api'
import { streamRequest } from './sseClient'

// Simple rule-based mock responder (identical logic to Stitch mock chat)
const simulateAiReply = (question, context = null) => {
  const qLower = question.toLowerCase()
  if (qLower.includes('tổng quan')) {
    return `Đây là thông tin tổng quan về ${context || 'triều đại đang chọn'}. Bạn có thể xem thêm chi tiết trong phần Tư liệu lịch sử hoặc Mạng lưới liên quan ở cột bên.`
  }
  if (qLower.includes('nhân vật') || qLower.includes('ai là')) {
    return `Trong sử liệu, ${context || 'triều đại này'} có nhiều nhân vật lịch sử lỗi lạc đóng vai trò quyết định trong việc giữ nước và dựng nước.`
  }
  if (qLower.includes('sự kiện') || qLower.includes('chiến thắng') || qLower.includes('trận')) {
    return `Các sự kiện và chiến trận trong thời kỳ ${context || 'này'} được ghi chép chi tiết trong Đại Việt Sử Ký Toàn Thư, khẳng định chủ quyền của quốc gia.`
  }
  return `Nhận câu hỏi về ${context || 'triều đại đang chọn'}: "${question}". Chronicle AI đang sử dụng các trích đoạn sử liệu để hỗ trợ giải đáp câu hỏi của bạn.`
}

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
    try {
      const res = await api.post(`/api/chat/sessions/${sessionId}/ask`, {
        question: message,  
        context: context   
      })
      return res.data
    } catch (e) {
      console.warn(`API sendMessage for ${sessionId} failed, running simulated AI responder:`, e)
      return new Promise((resolve) => {
        setTimeout(() => {
          const reply = simulateAiReply(message, context)
          const msgObj = { role: 'ASSISTANT', content: reply, timestamp: new Date().toISOString() }
          if (mockSessions[sessionId]) {
            mockSessions[sessionId].push({ role: 'USER', content: message })
            mockSessions[sessionId].push(msgObj)
          }
          resolve({ answer: reply })
        }, 800)
      })
    }
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

export default chatService


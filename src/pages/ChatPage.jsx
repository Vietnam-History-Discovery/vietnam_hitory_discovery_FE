import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'
import RelatedSuggestions from '../components/chat/RelatedSuggestions'
import chatService from '../services/chatService'

// API returns entities as string[] — pass all as dynasty/topic links for now
function extractSuggestions(data) {
  const entities = data.entities ?? []
  if (!entities.length) return null
  return { dynasties: entities, persons: [], followUps: [] }
}

export default function ChatPage() {
  const { sessionId: urlSessionId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeSessionId, setActiveSessionId] = useState(urlSessionId ?? null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [sessionTitle, setSessionTitle] = useState('')

  // Keep active session in sync with URL
  useEffect(() => {
    setActiveSessionId(urlSessionId ?? null)
  }, [urlSessionId])

  // Load session data (title + messages) whenever active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      setSuggestions(null)
      setSessionTitle('')
      return
    }
    chatService.getSession(activeSessionId)
      .then((session) => {
        setMessages(session.messages ?? [])
        if (session.title) setSessionTitle(session.title)
      })
      .catch(() => {})
  }, [activeSessionId])

  const handleNewChat = () => {
    setMessages([])
    setSuggestions(null)
    setSessionTitle('')
    setInput('')
    navigate('/chat')
  }

  const handleSelectSession = (id) => {
    navigate(`/chat/${id}`)
  }

  const handleSend = async (text) => {
    // Accept explicit text (from suggestion buttons) or fall back to input state
    const trimmed = (typeof text === 'string' ? text : input).trim()
    if (!trimmed || sending) return

    // Optimistically add user message
    const optimisticUser = { id: Date.now(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, optimisticUser])
    setInput('')
    setSending(true)

    try {
      let sessionId = activeSessionId

      // Create session before first message if none exists
      if (!sessionId) {
        const newSession = await chatService.createSession(trimmed.slice(0, 50))
        sessionId = newSession.id
        setActiveSessionId(sessionId)
        if (!sessionTitle) setSessionTitle(newSession.title ?? trimmed.slice(0, 60))
        navigate(`/chat/${sessionId}`, { replace: true })
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      }

      const data = await chatService.sendMessage(sessionId, trimmed)

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: data.answer ?? 'Không nhận được phản hồi.' },
      ])

      const s = extractSuggestions(data)
      if (s) setSuggestions(s)

      // Refresh sidebar to show updated lastMessage
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    } catch {
      // Roll back optimistic message and show error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left panel — hidden on mobile */}
        <div className="hidden md:flex shrink-0">
          <ChatSidebar
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Center panel */}
        <ChatWindow
          messages={messages}
          sending={sending}
          sessionTitle={sessionTitle}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
        />

        {/* Right panel — hidden on tablet and below */}
        <div className="hidden lg:flex shrink-0">
          <RelatedSuggestions suggestions={suggestions} onFollowUp={handleSend} />
        </div>
      </div>
    </div>
  )
}

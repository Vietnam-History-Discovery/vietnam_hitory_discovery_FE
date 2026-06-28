import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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

function messageTimestamp(message) {
  const value = message.createdAt ?? message.clientCreatedAt
  const time = value ? Date.parse(value) : Number.NaN
  return Number.isNaN(time) ? 0 : time
}

function isUserMessage(message) {
  return message.role === 'USER' || message.role === 'user'
}

function hasSequence(message) {
  return Number.isFinite(Number(message.sequence))
}

function compareMessages(a, b) {
  if (hasSequence(a) && hasSequence(b)) {
    const sequenceDiff = Number(a.sequence) - Number(b.sequence)
    if (sequenceDiff !== 0) return sequenceDiff
  }

  if (hasSequence(a)) return -1
  if (hasSequence(b)) return 1

  const timeDiff = messageTimestamp(a) - messageTimestamp(b)
  if (timeDiff !== 0) return timeDiff

  if (isUserMessage(a) !== isUserMessage(b)) {
    return isUserMessage(a) ? -1 : 1
  }

  return String(a.id ?? '').localeCompare(String(b.id ?? ''))
}

function sortLegacyMessages(messages) {
  const users = messages.filter(isUserMessage).sort(compareMessages)
  const assistants = messages.filter((message) => !isUserMessage(message)).sort(compareMessages)
  const sorted = []
  const maxLength = Math.max(users.length, assistants.length)

  for (let i = 0; i < maxLength; i += 1) {
    if (users[i]) sorted.push(users[i])
    if (assistants[i]) sorted.push(assistants[i])
  }

  return sorted
}

function sortMessages(messages = []) {
  const sequenced = messages.filter(hasSequence).sort(compareMessages)
  const legacy = messages.filter((message) => !hasSequence(message))
  return [...sequenced, ...sortLegacyMessages(legacy)]
}

function messageKey(message) {
  return [
    String(message.role ?? '').toLowerCase(),
    String(message.content ?? '').trim(),
    message.createdAt ?? '',
  ].join('|')
}

function mergeMessages(currentMessages, loadedMessages, sessionId) {
  const merged = [...loadedMessages]
  const loadedKeys = new Set(loadedMessages.map(messageKey))

  currentMessages.forEach((message) => {
    if (!String(message.id ?? '').startsWith('local-')) return
    if (message.sessionId !== sessionId) return
    if (loadedKeys.has(messageKey(message))) return
    merged.push(message)
  })

  return sortMessages(merged)
}

export default function ChatPage() {
  const { sessionId: urlSessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const loadRequestRef = useRef(0)
  const sendingRef = useRef(false)
  const initialQuestionRef = useRef(null)
  const activeSessionIdRef = useRef(null)

  const activeSessionId = urlSessionId ?? null
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [sessionTitle, setSessionTitle] = useState('')

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  const handleSend = useCallback(async (text) => {
    // Accept explicit text (from suggestion buttons) or fall back to input state
    const trimmed = (typeof text === 'string' ? text : input).trim()
    if (!trimmed || sendingRef.current) return
    setInput('')
    setSending(true)
    sendingRef.current = true
    let optimisticUser = null
    let sessionId = activeSessionId

    try {
      // Create session before first message if none exists
      if (!sessionId) {
        const newSession = await chatService.createSession(trimmed.slice(0, 50))
        sessionId = newSession.id
        if (!sessionTitle) setSessionTitle(newSession.title ?? trimmed.slice(0, 60))
        navigate(`/chat/${sessionId}`, { replace: true })
        activeSessionIdRef.current = sessionId
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      }

      optimisticUser = {
        id: `local-user-${Date.now()}`,
        sessionId,
        role: 'user',
        content: trimmed,
        clientCreatedAt: new Date().toISOString(),
      }

      if (activeSessionIdRef.current === sessionId) {
        setMessages((prev) => [...prev, optimisticUser])
      }

      const data = await chatService.sendMessage(sessionId, trimmed)

      if (activeSessionIdRef.current === sessionId) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-assistant-${Date.now()}`,
            sessionId,
            role: 'assistant',
            content: data.answer ?? 'Không nhận được phản hồi.',
            clientCreatedAt: new Date().toISOString(),
          },
        ])
      }

      const s = extractSuggestions(data)
      if (s && activeSessionIdRef.current === sessionId) setSuggestions(s)

      // Refresh sidebar to show updated lastMessage
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    } catch {
      // Roll back optimistic message and show error
      if (activeSessionIdRef.current === sessionId) {
        if (optimisticUser) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `local-error-${Date.now()}`,
            sessionId,
            role: 'assistant',
            content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
            clientCreatedAt: new Date().toISOString(),
          },
        ])
      }
    } finally {
      setSending(false)
      sendingRef.current = false
    }
  }, [activeSessionId, input, navigate, queryClient, sessionTitle])

  useEffect(() => {
    sendingRef.current = sending
  }, [sending])

  useEffect(() => {
    if (activeSessionId) return undefined

    let ignore = false
    queueMicrotask(() => {
      if (ignore) return
      setMessages([])
      setSuggestions(null)
      setSessionTitle('')
    })

    return () => {
      ignore = true
    }
  }, [activeSessionId])

  // Load session data (title + messages) whenever active session changes
  useEffect(() => {
    const requestId = ++loadRequestRef.current

    if (!activeSessionId) {
      return
    }

    setMessages([])
    setSuggestions(null)
    setSessionTitle('')

    chatService.getSession(activeSessionId)
      .then((data) => {
        if (requestId !== loadRequestRef.current) return

        setMessages((current) => mergeMessages(current, data.messages ?? [], activeSessionId))
        const title = data.session?.title ?? data.title
        if (title) setSessionTitle(title)
      })
      .catch(() => {})
  }, [activeSessionId])

  useEffect(() => {
    const initialQuestion = location.state?.initialQuestion
    if (!activeSessionId || !initialQuestion) return

    initialQuestionRef.current = initialQuestion
    navigate(location.pathname, { replace: true, state: null })
  }, [activeSessionId, location.pathname, location.state, navigate])

  useEffect(() => {
    if (!activeSessionId || !initialQuestionRef.current || sendingRef.current) return

    const initialQuestion = initialQuestionRef.current
    initialQuestionRef.current = null
    handleSend(initialQuestion)
  }, [activeSessionId, handleSend])

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

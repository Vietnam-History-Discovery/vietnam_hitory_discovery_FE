import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import TimelineChatSidebar from '../components/timeline/TimelineChatSidebar'
import TimelineVisualization from '../components/timeline/TimelineVisualization'
import TimelineChatPanel from '../components/timeline/TimelineChatPanel'
import chatService from '../services/chatService'

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
  if (isUserMessage(a) !== isUserMessage(b)) return isUserMessage(a) ? -1 : 1
  return String(a.id ?? '').localeCompare(String(b.id ?? ''))
}

function sortLegacyMessages(messages) {
  const users = messages.filter(isUserMessage).sort(compareMessages)
  const assistants = messages.filter((m) => !isUserMessage(m)).sort(compareMessages)
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
  const legacy = messages.filter((m) => !hasSequence(m))
  return [...sequenced, ...sortLegacyMessages(legacy)]
}

function mergeMessages(currentMessages, loadedMessages, sessionId) {
  const merged = [...loadedMessages]
  const loadedKeys = new Set(loadedMessages.map((m) => [String(m.role ?? '').toLowerCase(), String(m.content ?? '').trim(), m.createdAt ?? ''].join('|')))
  currentMessages.forEach((m) => {
    if (!String(m.id ?? '').startsWith('local-')) return
    if (m.sessionId !== sessionId) return
    if (loadedKeys.has([String(m.role ?? '').toLowerCase(), String(m.content ?? '').trim(), m.createdAt ?? ''].join('|'))) return
    merged.push(m)
  })
  return sortMessages(merged)
}

export default function TimelinePage() {
  const { sessionId: urlSessionId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loadRequestRef = useRef(0)
  const sendingRef = useRef(false)
  const activeSessionIdRef = useRef(null)

  const activeSessionId = urlSessionId ?? null
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [selectedSnapshot, setSelectedSnapshot] = useState(null)
  const [sessionTitle, setSessionTitle] = useState('')

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  useEffect(() => {
    sendingRef.current = sending
  }, [sending])

  useEffect(() => {
    if (!activeSessionId) return undefined

    const requestId = ++loadRequestRef.current

    chatService.getSession(activeSessionId)
      .then((data) => {
        if (requestId !== loadRequestRef.current) return
        const merged = mergeMessages([], data.messages ?? [], activeSessionId)
        setMessages(merged)
        const title = data.session?.title ?? data.title
        if (title) setSessionTitle(title)

        const lastTimelineMsg = [...merged].reverse().find(
          (m) => !isUserMessage(m) && m.timeline
        )
        if (lastTimelineMsg) {
          setSelectedSnapshot(lastTimelineMsg.timeline)
        }
      })
      .catch(() => {})
  }, [activeSessionId])

  const handleSend = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sendingRef.current) return
    setSending(true)
    sendingRef.current = true

    let sessionId = activeSessionId

    try {
      if (!sessionId) {
        const newSession = await chatService.createSession(trimmed.slice(0, 50), 'TIMELINE')
        sessionId = newSession.id
        if (!sessionTitle) setSessionTitle(newSession.title ?? trimmed.slice(0, 60))
        navigate(`/timeline/${sessionId}`, { replace: true })
        activeSessionIdRef.current = sessionId
        queryClient.invalidateQueries({ queryKey: ['timeline-sessions'] })
      }

      const optimisticUser = {
        id: `local-user-${Date.now()}`,
        sessionId,
        role: 'user',
        content: trimmed,
        clientCreatedAt: new Date().toISOString(),
      }

      if (activeSessionIdRef.current === sessionId) {
        setMessages((prev) => [...prev, optimisticUser])
      }

      const data = await chatService.sendTimelineMessage(sessionId, trimmed)

      if (activeSessionIdRef.current === sessionId) {
        const assistantMsg = {
          id: `local-assistant-${Date.now()}`,
          sessionId,
          role: 'assistant',
          content: data.answer ?? 'Không nhận được phản hồi.',
          timeline: data.timeline ?? null,
          clientCreatedAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        if (data.timeline) {
          setSelectedSnapshot(data.timeline)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['timeline-sessions'] })
    } catch {
      if (activeSessionIdRef.current === sessionId) {
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
  }, [activeSessionId, navigate, queryClient, sessionTitle])

  const handleSelectSnapshot = useCallback((snapshot) => {
    if (snapshot) {
      setSelectedSnapshot(snapshot)
    }
  }, [])

  const handleNewTimeline = useCallback(() => {
    setMessages([])
    setSelectedSnapshot(null)
    setSessionTitle('')
    navigate('/timeline')
  }, [navigate])

  const handleSelectSession = useCallback((id) => {
    navigate(`/timeline/${id}`)
  }, [navigate])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Timeline session sidebar */}
        <div className="hidden md:flex shrink-0">
          <TimelineChatSidebar
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewTimeline={handleNewTimeline}
          />
        </div>

        {/* Center: Timeline visualization */}
        <TimelineVisualization
          snapshot={selectedSnapshot}
          loading={sending && !selectedSnapshot}
        />

        {/* Right: Timeline chat panel */}
        <TimelineChatPanel
          messages={messages}
          sending={sending}
          onSend={handleSend}
          onSelectSnapshot={handleSelectSnapshot}
        />
      </div>
    </div>
  )
}

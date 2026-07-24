import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
  const [selectedSources, setSelectedSources] = useState([])
  const [sessionTitle, setSessionTitle] = useState('')
  const [streamingMessageId, setStreamingMessageId] = useState(null)

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  useEffect(() => {
    sendingRef.current = sending
  }, [sending])

  useEffect(() => {
    if (activeSessionId) return undefined

    let ignore = false
    queueMicrotask(() => {
      if (ignore) return
      setMessages([])
      setSelectedSnapshot(null)
      setSelectedSources([])
      setSessionTitle('')
    })

    return () => {
      ignore = true
    }
  }, [activeSessionId])

  useEffect(() => {
    if (!activeSessionId) return undefined

    const requestId = ++loadRequestRef.current

    chatService.getSession(activeSessionId)
      .then((data) => {
        if (requestId !== loadRequestRef.current) return
        setMessages((prev) => {
          const merged = mergeMessages(prev, data.messages ?? [], activeSessionId)
          const lastTimelineMsg = [...merged].reverse().find(
            (m) => !isUserMessage(m) && m.timeline
          )
          if (lastTimelineMsg) {
            setSelectedSnapshot(lastTimelineMsg.timeline)
            setSelectedSources(lastTimelineMsg.sources ?? [])
          }
          return merged
        })
        const title = data.session?.title ?? data.title
        if (title) setSessionTitle(title)
      })
      .catch(() => { })
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
      const assistantId = `local-assistant-${Date.now()}`

      if (activeSessionIdRef.current === sessionId) {
        setMessages((prev) => [
          ...prev,
          optimisticUser,
          { id: assistantId, sessionId, role: 'assistant', content: '', timeline: null, clientCreatedAt: new Date().toISOString() },
        ])
        setStreamingMessageId(assistantId)
      }

      const clearStreaming = () => {
        setStreamingMessageId((current) => (current === assistantId ? null : current))
      }

      let responseSources = []
      await chatService.streamTimelineMessage(sessionId, trimmed, {
        onMeta: (meta) => {
          if (activeSessionIdRef.current !== sessionId) return
          responseSources = meta.sources ?? []
          setMessages((prev) => prev.map((m) => (
            m.id === assistantId ? { ...m, sources: responseSources } : m
          )))
        },
        onEvent: (name, data) => {
          if (name !== 'timeline' || activeSessionIdRef.current !== sessionId) return
          setMessages((prev) => prev.map((m) => (
            m.id === assistantId ? { ...m, timeline: data } : m
          )))
          setSelectedSnapshot(data)
          setSelectedSources(responseSources)
        },
        onDelta: (deltaText) => {
          if (activeSessionIdRef.current !== sessionId) return
          setMessages((prev) => prev.map((m) => (
            m.id === assistantId ? { ...m, content: m.content + deltaText } : m
          )))
        },
        onDone: () => {
          if (activeSessionIdRef.current === sessionId) clearStreaming()
          queryClient.invalidateQueries({ queryKey: ['timeline-sessions'] })
        },
        onError: () => {
          if (activeSessionIdRef.current !== sessionId) return
          clearStreaming()
          setMessages((prev) => prev.map((m) => (
            m.id === assistantId && !m.content
              ? { ...m, content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', sources: [] }
              : m
          )))
        },
      })
    } catch {
      // onError already updated the UI; this just prevents an unhandled rejection
      // from fetchEventSource's onerror re-throw.
    } finally {
      setSending(false)
      sendingRef.current = false
    }
  }, [activeSessionId, navigate, queryClient, sessionTitle])

  const handleSelectSnapshot = useCallback((snapshot, sources = []) => {
    if (snapshot) {
      setSelectedSnapshot(snapshot)
      setSelectedSources(sources)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 overflow-hidden">
      {/* Center: Timeline visualization */}
      <TimelineVisualization
        snapshot={selectedSnapshot}
        sources={selectedSources}
        loading={sending && !selectedSnapshot}
        onSend={handleSend}
      />

      {/* Right: Timeline chat panel */}
      <TimelineChatPanel
        messages={messages}
        sending={sending}
        streamingMessageId={streamingMessageId}
        onSend={handleSend}
        onSelectSnapshot={handleSelectSnapshot}
      />
    </div>
  )
}

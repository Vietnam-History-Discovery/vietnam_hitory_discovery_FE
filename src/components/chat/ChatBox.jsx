import { useState, useEffect, useRef } from 'react'
import { streamMessage, getSessionMessages } from '../../services/chatService'
import { Sparkles, MessageSquare } from 'lucide-react'

function getSuggestions(dynastyName) {
  return [
    `Ai là nhân vật quan trọng nhất của ${dynastyName}?`,
    `Vì sao kinh đô lại được đặt ở đó?`,
    `Sự kiện nào đánh dấu bước ngoặt của ${dynastyName}?`,
  ]
}

function MessageBubble({ role, content, isStreaming }) {
  if (!content || !content.trim()) return null

  const isUser = role === 'USER' || role === 'user'
  const isError = role === 'error'

  if (isError) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-lg px-3 py-2 text-xs leading-relaxed bg-vermilion/15 border border-vermilion text-[#e0a394] font-sans">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] rounded-lg px-3 py-2 text-xs leading-relaxed font-sans ${
          isUser
            ? 'bg-primary text-[#1a1309] font-medium'
            : 'bg-surface2 text-ink border border-gold-border'
        }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3 bg-primary/70 ml-0.5 align-middle animate-pulse" />
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface2 border border-gold-border rounded-lg px-3 py-2 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatBox({ sessionId, ensureSession, dynastyName, chatContext, sessionLoading, pendingQuestion, suggestions: suggestionsProp }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)
  const suggestions = suggestionsProp ?? getSuggestions(dynastyName)

  const queueRef = useRef([])

  // Tracks the latest sessionId prop so async stream callbacks can detect
  // whether the user has since navigated to a different dynasty/article
  // (a new ChatBox instance with a different sessionId) and drop stale updates.
  const sessionIdRef = useRef(sessionId)
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  // Load message history when session is ready
  useEffect(() => {
    if (!sessionId) return
    getSessionMessages(sessionId)
      .then((msgs) => {
        if (msgs.length > 0) {
          // Normalize messages from service format
          const formatted = msgs.map(m => ({
            id: m.id,
            role: m.role?.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT',
            content: m.content
          }))
          setMessages(formatted)
        }
      })
      .catch(() => {})
  }, [sessionId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const assistantMsgId = `local-assistant-${Date.now()}`
    let errorHandled = false

    setMessages((prev) => [
      ...prev,
      { id: `local-user-${Date.now()}`, role: 'USER', content: trimmed },
      { id: assistantMsgId, role: 'ASSISTANT', content: '' },
    ])
    setInput('')
    setSending(true)
    setStreamingMessageId(assistantMsgId)

    const finishStreaming = () => {
      setStreamingMessageId((current) => (current === assistantMsgId ? null : current))
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }

    // targetSessionId is undefined until ensureSession() resolves below; showError
    // treats that as "always show" (nothing to compare staleness against yet).
    const showError = (targetSessionId) => {
      if (errorHandled) return
      if (targetSessionId != null && sessionIdRef.current !== targetSessionId) return
      errorHandled = true
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantMsgId || m.content),
        {
          id: `${assistantMsgId}-error`,
          role: 'error',
          content: 'Không nhận được phản hồi từ Chronicle AI. Vui lòng thử lại.',
        },
      ])
      finishStreaming()
    }

    try {
      const targetSessionId = await ensureSession()
      if (!targetSessionId) {
        showError()
        return
      }
      // ensureSession's setSessionId(...) triggers a parent re-render that syncs
      // sessionIdRef via prop — but that hasn't necessarily landed yet by the time
      // this await resumes. Set it directly so the staleness checks below are
      // correct for this first message, not just for messages sent afterward.
      sessionIdRef.current = targetSessionId

      await streamMessage(
        targetSessionId,
        trimmed,
        {
          onDelta: (deltaText) => {
            if (sessionIdRef.current !== targetSessionId) return
            setMessages((prev) => prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + deltaText } : m
            ))
          },
          onDone: () => {
            if (sessionIdRef.current === targetSessionId) finishStreaming()
          },
          onError: () => showError(targetSessionId),
        },
        chatContext || dynastyName
      )
    } catch {
      showError()
    }
  }

  // Handle incoming graph queries (queue buffer while the mount-time existing-session
  // lookup is still running — send() lazily creates a session itself otherwise, so
  // it no longer needs to wait for sessionId to already be set).
  useEffect(() => {
    if (!pendingQuestion?.text) return

    const triggerAsk = () => {
      send(pendingQuestion.text)

      // Apply Stitch flash highlight visual cue
      if (chatContainerRef.current) {
        try {
          chatContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } catch {
          // ignore scroll errors
        }
        chatContainerRef.current.classList.add('flash-highlight')
        const timer = setTimeout(() => {
          chatContainerRef.current?.classList.remove('flash-highlight')
        }, 1200)
        return () => clearTimeout(timer)
      }
    }

    if (sessionLoading) {
      queueRef.current.push(triggerAsk)
    } else {
      triggerAsk()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, sessionLoading])

  // Dispatch queued queries once the mount-time session lookup finishes
  useEffect(() => {
    if (!sessionLoading && queueRef.current.length > 0) {
      const actions = [...queueRef.current]
      queueRef.current = []
      actions.forEach((act) => act())
    }
  }, [sessionLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  // Demo Error simulation for testing empty/error visual state
  const handleSimulateError = () => {
    const text = input.trim() || 'Câu hỏi thử nghiệm'
    setMessages((prev) => [...prev, { id: `local-user-${Date.now()}`, role: 'USER', content: text }])
    setInput('')
    setSending(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `local-error-${Date.now()}`, role: 'error', content: 'Không nhận được phản hồi từ Chronicle AI. Vui lòng thử lại.' }
      ])
      setSending(false)
    }, 800)
  }

  const isEmpty = messages.length === 0 && !sending

  return (
    <div
      ref={chatContainerRef}
      className="h-full flex flex-col bg-surface border border-gold-border rounded-[6px] overflow-hidden transition-all duration-150"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gold-border shrink-0">
        <div className="w-[26px] h-[26px] border-[1.5px] border-primary rounded-[6px_2px_6px_2px] flex items-center justify-center text-primary select-none">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13.5px] font-bold text-ink leading-tight">
            Chronicle AI
          </span>
          <div className="text-[10px] text-ink-muted flex items-center gap-1.5 leading-none mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${sessionLoading ? 'bg-ink-muted animate-pulse' : 'bg-green-400'}`} />
            {sessionLoading ? 'Đang khởi tạo phiên…' : `Phiên trò chuyện: ${dynastyName}`}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-background/20">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="w-9 h-9 border-[1.5px] border-primary rounded-[6px_2px_6px_2px] flex items-center justify-center text-primary select-none">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              Hỏi bất kỳ điều gì về <span className="text-primary font-semibold">{dynastyName}</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id ?? i}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.id === streamingMessageId}
          />
        ))}

        {sending && (!streamingMessageId || !messages.find((m) => m.id === streamingMessageId)?.content) && (
          <ThinkingBubble />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {isEmpty && !sessionLoading && (
        <div className="px-4 pb-3 shrink-0 space-y-1.5">
          <p className="text-[10px] text-ink-muted uppercase tracking-widest px-1 font-sans font-semibold">
            Gợi ý câu hỏi
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={sessionLoading || sending}
              className="w-full text-left text-[12.5px] text-ink bg-transparent hover:border-primary hover:text-primary-bright border border-gold-border rounded-[6px] px-3 py-2 transition-colors disabled:opacity-40 leading-snug cursor-pointer focus:outline-none"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error Demo Trigger (only shown in development) */}
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={handleSimulateError}
          className="text-[10.5px] text-ink-muted hover:text-primary-bright underline bg-none border-none cursor-pointer self-start px-4 py-1 focus:outline-none font-sans"
        >
          Xem trạng thái lỗi (demo)
        </button>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-gold-border shrink-0"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          disabled={sessionLoading || sending}
          placeholder={
            sessionLoading
              ? 'Đang khởi tạo phiên…'
              : `Hỏi về ${dynastyName}…`
          }
          className="flex-1 bg-background border border-gold-border focus:border-primary focus:ring-0 rounded-[6px] px-3 py-2 text-[13px] text-ink placeholder-ink-muted focus:outline-none transition-colors disabled:opacity-50 resize-none h-[38px] max-h-[80px] font-sans"
          rows={1}
        />
        <button
          type="submit"
          disabled={sessionLoading || sending || !input.trim()}
          className="shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary-bright disabled:bg-surface2 disabled:text-ink-muted disabled:opacity-40 disabled:cursor-not-allowed text-[#1a1309] transition-all cursor-pointer font-bold"
          aria-label="Gửi câu hỏi"
        >
          ➤
        </button>
      </form>
    </div>
  )
}


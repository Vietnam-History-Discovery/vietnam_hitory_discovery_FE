import { useState, useEffect, useRef } from 'react'
import { askQuestion, getSessionMessages } from '../../services/chatService'

function getSuggestions(dynastyName) {
  return [
    `Triều đại ${dynastyName} được thành lập như thế nào?`,
    `Các nhân vật nổi bật của ${dynastyName}?`,
    `${dynastyName} đã kết thúc như thế nào?`,
  ]
}

// Normalise whatever shape the API returns for the assistant's answer
function extractAnswer(data) {
  return (
    data?.answer ??
    data?.content ??
    data?.response ??
    data?.message ??
    data?.text ??
    'No response received.'
  )
}

function MessageBubble({ role, content }) {
  const isUser = role === 'USER' || role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-gray-900 rounded-br-sm font-medium'
            : 'bg-surface2 text-gray-200 rounded-bl-sm border border-surface2'
        }`}
      >
        {content}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface2 border border-surface2 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatBox({ sessionId, dynastyName, sessionLoading }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const suggestions = getSuggestions(dynastyName)

  // Load message history when session is ready
  useEffect(() => {
    if (!sessionId) return
    getSessionMessages(sessionId)
      .then((msgs) => {
        if (msgs.length > 0) setMessages(msgs)
      })
      .catch(() => {})
  }, [sessionId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || !sessionId || sending) return

    setMessages((prev) => [...prev, { role: 'USER', content: trimmed }])
    setInput('')
    setSending(true)

    try {
      const data = await askQuestion(sessionId, trimmed, dynastyName)
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', content: extractAnswer(data) },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          content: 'Unable to get a response. Please try again.',
        },
      ])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  const isEmpty = messages.length === 0 && !sending

  return (
    <div className="h-full flex flex-col bg-surface border border-surface2 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-semibold text-primary tracking-wide">
          Chronicle AI
        </span>
        {sessionLoading && (
          <span className="ml-auto text-xs text-gray-600 animate-pulse">
            Connecting…
          </span>
        )}
        {!sessionLoading && sessionId && (
          <span className="ml-auto text-xs text-gray-700">Ready</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg">
              ✦
            </div>
            <p className="text-sm text-gray-500">
              Ask anything about{' '}
              <span className="text-gray-300">{dynastyName}</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {sending && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only when empty) */}
      {isEmpty && !sessionLoading && (
        <div className="px-4 pb-3 shrink-0 space-y-1.5">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest px-1">
            Suggested
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={!sessionId || sending}
              className="w-full text-left text-xs text-gray-400 bg-surface2 hover:border-primary/30 hover:text-gray-200 border border-surface2 rounded-lg px-3 py-2 transition-colors disabled:opacity-40 leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-surface2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!sessionId || sending}
          placeholder={
            sessionLoading
              ? 'Connecting…'
              : !sessionId
              ? 'Unavailable'
              : 'Ask a question…'
          }
          className="flex-1 bg-surface2 border border-surface2 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!sessionId || sending || !input.trim()}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 transition-all"
          aria-label="Send"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.903 6.463H13.5a.75.75 0 0 1 0 1.5H4.182l-1.903 6.463a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.848-8.683.75.75 0 0 0 0-1.052A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        </button>
      </form>
    </div>
  )
}

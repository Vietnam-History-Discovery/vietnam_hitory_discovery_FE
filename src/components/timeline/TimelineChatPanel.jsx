import { useState, useRef, useEffect } from 'react'
import TimelineSnapshotCard from './TimelineSnapshotCard'

function TimelineMessage({ role, content, timeline, createdAt, onSelectSnapshot, isStreaming = false }) {
  const isUser = role === 'USER' || role === 'user'
  const rootRef = useRef(null)

  useEffect(() => {
    if (isStreaming) {
      rootRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [content, isStreaming])

  return (
    <div ref={rootRef} className={`flex gap-3 animate-message-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0 mt-0.5">
          ◈
        </div>
      )}
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-primary text-gray-900 rounded-br-sm font-medium'
              : 'bg-surface2 text-gray-200 rounded-bl-sm border border-surface2/80'
          }`}
        >
          {!isUser && isStreaming && !content ? (
            <span className="flex items-center gap-1.5 py-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          ) : !isUser && isStreaming ? (
            <span>
              {content}
              <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 align-middle animate-pulse" />
            </span>
          ) : (
            content
          )}
        </div>
        {!isUser && timeline && (
          <div className="mt-1 w-full max-w-xs animate-message-in">
            <TimelineSnapshotCard
              snapshot={timeline}
              createdAt={createdAt}
              isActive={false}
              onClick={() => onSelectSnapshot?.(timeline)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimelineChatPanel({
  messages,
  sending,
  streamingMessageId,
  onSend,
  onSelectSnapshot,
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setInput('')
    onSend(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-[400px] bg-surface border-l border-surface2 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface2 shrink-0">
        <h2 className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
          Hội thoại Timeline
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg mb-3">
              ◈
            </div>
            <p className="text-xs text-gray-600">
              Đặt câu hỏi để tạo dòng thời gian lịch sử
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <TimelineMessage
            key={msg.id || i}
            role={msg.role}
            content={msg.content}
            timeline={msg.timeline}
            createdAt={msg.createdAt}
            onSelectSnapshot={onSelectSnapshot}
            isStreaming={msg.id === streamingMessageId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-surface2 bg-surface shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về lịch sử..."
          rows={1}
          className="flex-1 resize-none overflow-hidden bg-surface2 border border-surface2 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none transition-colors leading-snug"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 transition-all"
          aria-label="Gửi"
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
      </div>
    </div>
  )
}

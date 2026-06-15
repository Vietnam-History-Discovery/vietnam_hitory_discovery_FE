import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

const SUGGESTED_QUESTIONS = [
  'Hùng Vương là ai?',
  'Tại sao nhà Trần thắng quân Nguyên?',
  'Lý Thường Kiệt là ai?',
  'Nhà Lý được thành lập như thế nào?',
]

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0 mt-0.5">
        ✦
      </div>
      <div className="bg-surface2 border border-surface2/80 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
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

export default function ChatWindow({
  messages,
  sending,
  sessionTitle,
  input,
  onInputChange,
  onSend,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const isEmpty = messages.length === 0 && !sending

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-surface2 shrink-0">
        <h1 className="text-sm font-medium text-gray-300 truncate">
          {sessionTitle || 'Cuộc trò chuyện mới'}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl mx-auto mb-3">
                ✦
              </div>
              <p className="text-primary font-bold tracking-[0.2em] text-sm uppercase">
                Vietnam Chronicles
              </p>
              <p className="text-gray-600 text-xs mt-1">Khám phá lịch sử Việt Nam</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="text-left text-xs text-gray-400 hover:text-gray-200 bg-surface hover:bg-surface2 border border-surface2 hover:border-primary/30 rounded-xl px-4 py-3 transition-all leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {sending && <ThinkingBubble />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={() => onSend(input)}
        disabled={sending}
      />
    </div>
  )
}

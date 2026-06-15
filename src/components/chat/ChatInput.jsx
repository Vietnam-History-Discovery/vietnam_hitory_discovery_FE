import { useRef, useEffect } from 'react'

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    // cap at ~4 rows (line-height ~22px + padding 24px)
    ta.style.height = `${Math.min(ta.scrollHeight, 4 * 22 + 24)}px`
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-surface2 bg-background shrink-0">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Hỏi về lịch sử Việt Nam..."
        rows={1}
        className="flex-1 resize-none overflow-hidden bg-surface2 border border-surface2 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50 leading-snug"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
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
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../../services/chatService'

const SUGGESTIONS = [
  'Trận Bạch Đằng',
  'Hai Bà Trưng',
  'Nhà Lý',
]

export default function HeroSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startChat = async (question) => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    try {
      const title = question.length > 60 ? question.slice(0, 57) + '…' : question
      const session = await createSession(title)
      navigate(`/chat/${session.id}`, { state: { initialQuestion: question } })
    } catch {
      setError('Could not start session. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    startChat(query)
  }

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center overflow-hidden">
      {/* Radial glow behind heading */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[600px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Eyebrow */}
      <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase mb-5">
        <span className="w-6 h-px bg-primary/60" />
        AI-Powered Historical Research
        <span className="w-6 h-px bg-primary/60" />
      </span>

      {/* Heading */}
      <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 leading-tight max-w-3xl mb-5">
        Vietnam History
        <br />
        <span className="text-primary">Explorer</span>
      </h1>

      {/* Subtitle */}
      <p className="relative text-gray-400 text-base sm:text-lg max-w-xl mb-10">
        Ask questions about Vietnamese dynasties, battles, and cultural events.
        Powered by a curated knowledge base and AI.
      </p>

      {/* Search bar */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about Vietnamese history…"
          className="w-full bg-surface border border-surface2 rounded-xl pl-5 pr-32 py-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold text-sm rounded-lg px-5 py-2 transition-all"
        >
          {loading ? 'Starting…' : 'Explore →'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        <span className="text-xs text-gray-600">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => startChat(s)}
            disabled={loading}
            className="text-xs bg-surface border border-surface2 hover:border-primary/50 hover:text-primary text-gray-400 rounded-full px-3 py-1 transition-colors disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  )
}

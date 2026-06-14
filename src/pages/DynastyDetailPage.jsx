import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import DynastyHero from '../components/dynasty/DynastyHero'
import Overview from '../components/dynasty/Overview'
import KeyFigures from '../components/dynasty/KeyFigures'
import HistoricalDocuments from '../components/dynasty/HistoricalDocuments'
import ChatBox from '../components/chat/ChatBox'
import { getDynastyByName } from '../services/dynastyService'
import { createSession } from '../services/chatService'

function ContentSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-32 bg-surface2 rounded-xl" />
      <div className="space-y-3">
        <div className="h-4 bg-surface2 rounded w-1/3" />
        <div className="h-24 bg-surface2 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-surface2 rounded w-1/4" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface2 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DynastyDetailPage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(name ?? '')

  const [sessionId, setSessionId] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  // Fetch dynasty data
  const {
    data: dynasty,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dynasty', decodedName],
    queryFn: () => getDynastyByName(decodedName),
    enabled: !!decodedName,
  })

  // Create chat session once dynasty name is available
  useEffect(() => {
    if (!decodedName) return
    setSessionLoading(true)
    createSession(`${decodedName} – Chronicle Session`)
      .then((session) => {
        const id = session.id ?? session.sessionId ?? session.session_id
        setSessionId(id)
      })
      .catch(console.error)
      .finally(() => setSessionLoading(false))
  }, [decodedName])

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-gray-400">Could not load dynasty data.</p>
          <button
            onClick={() => navigate('/dynasties')}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Dynasties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Full-width hero (only after data loads) */}
      {!isLoading && dynasty && (
        <DynastyHero name={dynasty.name ?? decodedName} mentions={dynasty.mentions} />
      )}

      {/* 2-column layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">
          {/* Left: content */}
          <div className="min-w-0 space-y-8">
            {isLoading ? (
              <ContentSkeleton />
            ) : dynasty ? (
              <>
                <Overview chunks={dynasty.sample_chunks} />
                <KeyFigures persons={dynasty.persons} />
                <HistoricalDocuments chunks={dynasty.sample_chunks} />
              </>
            ) : null}
          </div>

          {/* Right: ChatBox — always rendered, handles its own loading state */}
          <div className="hidden lg:block mt-0">
            <ChatBox
              sessionId={sessionId}
              dynastyName={dynasty?.name ?? decodedName}
              sessionLoading={sessionLoading}
            />
          </div>
        </div>

        {/* Mobile: ChatBox below content */}
        <div className="lg:hidden mt-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-primary" />
            Ask Chronicle AI
          </h2>
          <div className="h-[520px] flex flex-col">
            <ChatBox
              sessionId={sessionId}
              dynastyName={dynasty?.name ?? decodedName}
              sessionLoading={sessionLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

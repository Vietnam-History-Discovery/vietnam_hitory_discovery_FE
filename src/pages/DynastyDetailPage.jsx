import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import DynastyHero from '../components/dynasty/DynastyHero'
import Overview from '../components/dynasty/Overview'
import DynastyGraphPanel from '../components/dynasty/DynastyGraphPanel'
import HistoricalDocuments from '../components/dynasty/HistoricalDocuments'
import ChatBox from '../components/chat/ChatBox'
import { getDynasties, getDynastyByName, getDynastyFromList, getDynastyChatContext } from '../services/dynastyService'
import { createSession, getSessions } from '../services/chatService'

function ContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-surface2 rounded w-1/4" />
        <div className="bg-surface border border-gold-border rounded-[3px] p-[18px_18px_16px] space-y-4">
          <div className="flex gap-2">
            <div className="h-10 bg-surface2 rounded w-24" />
            <div className="h-10 bg-surface2 rounded w-24" />
          </div>
          <div className="h-4 bg-surface2 rounded w-full" />
          <div className="h-4 bg-surface2 rounded w-5/6" />
        </div>
      </div>
      {/* Graph skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-surface2 rounded w-1/4 animate-pulse" />
        <div className="h-[300px] bg-surface border border-gold-border rounded-[3px] animate-pulse" />
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
  const [pendingQuestion, setPendingQuestion] = useState(null)
  const [isLargeScreen, setIsLargeScreen] = useState(true)

  const initialisedRef = useRef(false)
  const lastQuestionRef = useRef(null)

  // Track window resizing to ensure only one ChatBox is mounted at a time
  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  // Fetch dynasty detail data
  const {
    data: dynasty,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dynasty', decodedName],
    queryFn: () => getDynastyByName(decodedName),
    enabled: !!decodedName,
  })

  // Pull rich metadata from the cached dynasties list
  const { data: dynastiesList } = useQuery({
    queryKey: ['dynasties'],
    queryFn: getDynasties,
  })
  const listDynasty = getDynastyFromList(dynastiesList, decodedName)

  // Fetch structured chat context from backend AI service
  const { data: chatContextData } = useQuery({
    queryKey: ['dynastyChatContext', decodedName],
    queryFn: () => getDynastyChatContext(decodedName),
    enabled: !!decodedName,
    retry: false,
  })

  // Create or reuse chat session once dynasty name is available
  useEffect(() => {
    if (!decodedName || initialisedRef.current) return
    initialisedRef.current = true
    setSessionLoading(true)

    getSessions()
      .then((sessions) => {
        const titleToFind = `${decodedName} – Chronicle Session`
        const existing = sessions?.find(s => s.title === titleToFind)
        if (existing) {
          const id = existing.id ?? existing.sessionId ?? existing.session_id
          if (id) {
            setSessionId(id)
            setSessionLoading(false)
            return
          }
        }
        
        // Otherwise, create a new session
        return createSession(titleToFind).then((session) => {
          const id = session.id ?? session.sessionId ?? session.session_id
          if (!id) {
            console.error("Could not resolve sessionId from response:", session)
          }
          setSessionId(id)
        })
      })
      .catch((err) => {
        console.error("Failed to reuse session, falling back to direct create:", err)
        return createSession(`${decodedName} – Chronicle Session`).then((session) => {
          const id = session.id ?? session.sessionId ?? session.session_id
          if (!id) {
            console.error("Could not resolve sessionId from response:", session)
          }
          setSessionId(id)
        })
      })
      .catch(console.error)
      .finally(() => setSessionLoading(false))
  }, [decodedName])

  // Click-to-ask trigger callback from graph nodes or fallback chips (with double-click protection)
  const handleAskGraph = (text) => {
    const now = Date.now()
    if (
      lastQuestionRef.current &&
      lastQuestionRef.current.text === text &&
      now - lastQuestionRef.current.timestamp < 500
    ) {
      return // Ignore rapid double-click
    }
    lastQuestionRef.current = { text, timestamp: now }
    setPendingQuestion({ text, timestamp: now })
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="w-[38px] h-[38px] border-[1.5px] border-vermilion rounded-[6px_2px_6px_2px] flex items-center justify-center text-[#e0a394] font-bold">
            !
          </div>
          <h4 className="text-ink font-semibold">Không tải được dữ liệu triều đại</h4>
          <p className="text-xs text-ink-muted max-w-sm">Đã xảy ra lỗi khi truy vấn dữ liệu cho "{decodedName}". Vui lòng thử lại hoặc quay về danh sách.</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-[#1a1309] font-bold text-xs px-4 py-2 rounded-[4px] cursor-pointer hover:bg-primary-bright focus:outline-none"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Full-width hero */}
      {!isLoading && dynasty && (
        <DynastyHero name={dynasty.name ?? decodedName} mentions={dynasty.mentions} />
      )}

      {/* 2-column layout (Stitch widths: content column & 340px sticky chat column, gap 28px) */}
      <div className="flex-1 max-w-[1180px] mx-auto w-full px-6 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-[28px] lg:items-start">
          {/* Left: content */}
          <div className="min-w-0 space-y-8">
            {isLoading ? (
              <ContentSkeleton />
            ) : dynasty ? (
              <>
                <Overview chunks={dynasty.sample_chunks} listDynasty={listDynasty} />
                
                {/* Stitch Knowledge Graph panel replacing KeyFigures */}
                <DynastyGraphPanel
                  persons={dynasty.persons || []}
                  events={dynasty.events || []}
                  dynastyName={dynasty.name ?? decodedName}
                  onAsk={handleAskGraph}
                  sessionReady={!!sessionId && !sessionLoading}
                />

                <HistoricalDocuments chunks={dynasty.sample_chunks} />
              </>
            ) : null}
          </div>

          {/* Right: ChatBox — sticky sidebar (only mounted on desktop) */}
          <div className="hidden lg:block sticky top-20 h-[520px] overflow-hidden">
            {isLargeScreen && (
              <ChatBox
                sessionId={sessionId}
                dynastyName={dynasty?.name ?? decodedName}
                chatContext={chatContextData?.context}
                sessionLoading={sessionLoading}
                pendingQuestion={pendingQuestion}
              />
            )}
          </div>
        </div>

        {/* Mobile: ChatBox below content (only mounted on mobile) */}
        <div className="lg:hidden mt-8 space-y-3">
          <div className="flex items-center gap-2.5 pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <h3 className="text-xs font-bold text-primary-bright uppercase tracking-[0.1em] leading-none">
              Chronicle AI
            </h3>
          </div>
          <div className="h-[460px] flex flex-col">
            {!isLargeScreen && (
              <ChatBox
                sessionId={sessionId}
                dynastyName={dynasty?.name ?? decodedName}
                chatContext={chatContextData?.context}
                sessionLoading={sessionLoading}
                pendingQuestion={pendingQuestion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



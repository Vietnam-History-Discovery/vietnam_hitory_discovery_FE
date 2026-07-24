import { useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { getAllArticles } from '../../services/articleService'
import { findMatchingArticle } from '../../utils/articleMatcher'
import TimelineEmptyStateIllustration from './TimelineEmptyStateIllustration'

const EMPTY_STATE_SUGGESTIONS = ['Nhà Trần', 'Khởi nghĩa Tây Sơn', 'Thời kỳ Bắc thuộc']

function EventCard({ event, index, articles, onNavigate }) {
  const side = index % 2 === 0 ? 'left' : 'right'
  const match = findMatchingArticle(event, articles)

  const handleClick = () => {
    if (match) {
      onNavigate(`/articles/${match.slug}`)
    }
  }

  return (
    <div className={`relative flex items-start gap-6 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 ${side === 'right' ? 'text-left' : 'text-right'}`}>
        <div
          className={`inline-block max-w-md bg-surface border rounded-xl p-4 transition-all ${
            match
              ? 'border-primary/40 hover:border-primary hover:bg-surface2/60 cursor-pointer'
              : 'border-surface2 cursor-default'
          } ${side === 'right' ? 'ml-auto' : 'mr-auto'}`}
          onClick={match ? handleClick : undefined}
        >
          {event.dateLabel && (
            <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5 bg-primary/10 px-2 py-0.5 rounded-full">
              {event.dateLabel}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-100 mb-1">{event.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{event.description}</p>
          {event.related_entities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.related_entities.map((entity) => (
                <span
                  key={entity}
                  className="text-[10px] text-gray-500 bg-surface2 px-1.5 py-0.5 rounded"
                >
                  {entity}
                </span>
              ))}
            </div>
          )}
          {match && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface2">
              <BookOpen className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary">Xem bài viết liên quan</span>
              {match.confidence === 'low' && (
                <span className="text-[10px] text-gray-600 ml-1">(theo thời đại)</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SpineDot({ isLast }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-primary border-2 border-surface z-10" />
      {!isLast && <div className="w-0.5 h-full bg-primary/20 absolute top-3" />}
    </div>
  )
}

export default function TimelineVisualization({ snapshot, loading, onSend }) {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const { data: articles = [] } = useQuery({
    queryKey: ['articles-all-summary'],
    queryFn: getAllArticles,
    staleTime: Infinity, // articles don't change often
  })

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [snapshot])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-gray-600">Đang tạo dòng thời gian...</p>
        </div>
      </div>
    )
  }

  if (!snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm animate-empty-state-in">
          <TimelineEmptyStateIllustration className="w-56 sm:w-72 h-auto mx-auto mb-6" />
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-gray-100 mb-2">
            Khám phá dòng thời gian lịch sử
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Đặt câu hỏi về một triều đại, nhân vật hay sự kiện — AI sẽ dựng dòng thời gian chi
            tiết kèm bối cảnh và nguồn tham khảo.
          </p>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-600">Thử:</span>
            {EMPTY_STATE_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSend?.(s)}
                className="text-xs bg-surface border border-surface2 hover:border-primary/50 hover:text-primary text-gray-400 rounded-full px-3 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const events = snapshot.events ?? []

  return (
    <div key={snapshot.id} ref={containerRef} className="flex-1 overflow-y-auto bg-background py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10 animate-message-in">
        <h2 className="text-lg font-bold text-gray-100">{snapshot.title}</h2>
        <p className="text-xs text-gray-600 mt-1">{events.length} sự kiện lịch sử</p>
      </div>

      {/* Timeline */}
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

        <div className="relative space-y-12">
          {events.map((event, index) => {
            const side = index % 2 === 0 ? 'left' : 'right'
            return (
              <div
                key={event.id || index}
                className="relative animate-timeline-event-in"
                style={{
                  animationDelay: `${index * 70}ms`,
                  '--tl-slide': side === 'left' ? '-16px' : '16px',
                }}
              >
                <SpineDot isLast={index === events.length - 1} />
                <div className={side === 'left' ? 'pr-[calc(50%+2rem)]' : 'pl-[calc(50%+2rem)]'}>
                  <EventCard
                    event={event}
                    index={index}
                    articles={articles}
                    onNavigate={navigate}
                    isLast={index === events.length - 1}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

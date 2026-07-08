import { useRef, useEffect } from 'react'

function EventCard({ event, index }) {
  const side = index % 2 === 0 ? 'left' : 'right'

  return (
    <div className={`relative flex items-start gap-6 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 ${side === 'right' ? 'text-left' : 'text-right'}`}>
        <div
          className={`inline-block max-w-md bg-surface border border-surface2 rounded-xl p-4 ${
            side === 'right' ? 'ml-auto' : 'mr-auto'
          }`}
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

export default function TimelineVisualization({ snapshot, loading }) {
  const containerRef = useRef(null)

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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl mx-auto mb-3">
            ◈
          </div>
          <p className="text-sm text-gray-500">
            Đặt câu hỏi về lịch sử để tạo dòng thời gian
          </p>
        </div>
      </div>
    )
  }

  const events = snapshot.events ?? []

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-background py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-lg font-bold text-gray-100">{snapshot.title}</h2>
        <p className="text-xs text-gray-600 mt-1">{events.length} sự kiện lịch sử</p>
      </div>

      {/* Timeline */}
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

        <div className="relative space-y-12">
          {events.map((event, index) => (
            <div key={event.id || index} className="relative">
              <SpineDot isLast={index === events.length - 1} />
              <div className={index % 2 === 0 ? 'pr-[calc(50%+2rem)]' : 'pl-[calc(50%+2rem)]'}>
                <EventCard event={event} index={index} isLast={index === events.length - 1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

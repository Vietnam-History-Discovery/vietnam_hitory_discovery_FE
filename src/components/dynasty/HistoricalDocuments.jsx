import { useState } from 'react'

const PREVIEW_LENGTH = 220

function DocumentCard({ chunk, index }) {
  const [expanded, setExpanded] = useState(false)

  const rawText = typeof chunk === 'string' ? chunk : (chunk.text ?? '')
  const title =
    typeof chunk === 'object' && chunk.title
      ? chunk.title
      : `Historical Record ${index + 1}`
  const source =
    typeof chunk === 'object' && chunk.source ? chunk.source : 'DVSKTT'

  const isLong = rawText.length > PREVIEW_LENGTH
  const displayText =
    isLong && !expanded ? rawText.slice(0, PREVIEW_LENGTH) + '…' : rawText

  return (
    <div className="bg-surface rounded-xl border border-surface2 hover:border-primary/20 p-5 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-gray-200 leading-snug">{title}</h3>
        <span className="shrink-0 text-[10px] font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 uppercase">
          {source}
        </span>
      </div>

      {/* Text */}
      <p className="text-sm text-gray-400 leading-relaxed">{displayText}</p>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
      )}
    </div>
  )
}

export default function HistoricalDocuments({ chunks }) {
  if (!chunks?.length) return null

  return (
    <section className="pb-12">
      <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-primary" />
        Historical Documents
      </h2>

      <div className="space-y-4">
        {chunks.map((chunk, i) => (
          <DocumentCard key={i} chunk={chunk} index={i} />
        ))}
      </div>
    </section>
  )
}

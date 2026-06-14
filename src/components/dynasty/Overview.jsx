const ERA_STYLES = {
  'Độc lập':  { text: '#22c55e', bg: '#22c55e18', border: '#22c55e50' },
  'Bắc thuộc': { text: '#ef4444', bg: '#ef444418', border: '#ef444450' },
  'Huyền sử': { text: '#a855f7', bg: '#a855f718', border: '#a855f750' },
}

function MetaBadge({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-200" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  )
}

function EraBadge({ era }) {
  const s = ERA_STYLES[era]
  if (!s) return <span className="text-sm font-medium text-gray-200">{era}</span>
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full border font-medium"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {era}
    </span>
  )
}

export default function Overview({ chunks, listDynasty }) {
  const hasChunks = chunks?.length > 0
  const hasMeta = listDynasty?.period || listDynasty?.capital || listDynasty?.era
  const hasContent = listDynasty?.description || hasMeta || hasChunks

  if (!hasContent) return null

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-primary" />
        Overview
      </h2>

      <div className="bg-surface rounded-xl border border-surface2 p-6 space-y-5">
        {/* Metadata row */}
        {hasMeta && (
          <div className="flex flex-wrap items-start gap-6 pb-5 border-b border-surface2">
            {listDynasty.period && (
              <MetaBadge label="Period" value={listDynasty.period} color="#C8A951" />
            )}
            {listDynasty.capital && (
              <MetaBadge label="Capital" value={listDynasty.capital} />
            )}
            {listDynasty.era && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Era</span>
                <EraBadge era={listDynasty.era} />
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {listDynasty?.description && (
          <p className="text-gray-300 text-sm leading-relaxed">{listDynasty.description}</p>
        )}

        {/* Historical Records */}
        {hasChunks && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Historical Records
            </h3>
            {chunks.map((chunk, i) => {
              const text = typeof chunk === 'string' ? chunk : chunk.text ?? String(chunk)
              return (
                <p
                  key={i}
                  className="text-gray-400 text-sm leading-relaxed border-l-2 border-surface2 pl-4"
                >
                  {text}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

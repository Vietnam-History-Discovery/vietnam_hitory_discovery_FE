import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDynasties } from '../../services/dynastyService'

const ERA_COLORS = {
  'Huyền sử': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Bắc thuộc': 'text-red-400 bg-red-400/10 border-red-400/20',
  'Độc lập': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

function eraColor(era) {
  const key = Object.keys(ERA_COLORS).find((k) => (era ?? '').includes(k))
  return ERA_COLORS[key] ?? ERA_COLORS['Độc lập']
}

export default function RelatedSuggestions({ suggestions, onFollowUp }) {
  const { data: allDynasties = [] } = useQuery({
    queryKey: ['dynasties'],
    queryFn: getDynasties,
  })

  const hasContent =
    suggestions &&
    ((suggestions.dynasties?.length ?? 0) > 0 ||
      (suggestions.persons?.length ?? 0) > 0 ||
      (suggestions.followUps?.length ?? 0) > 0)

  return (
    <div className="w-72 bg-surface border-l border-surface2 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface2 shrink-0">
        <h2 className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
          Gợi ý liên quan
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-5">
        {!hasContent ? (
          /* Default: top dynasties */
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2.5">
              Triều đại phổ biến
            </p>
            <div className="space-y-1.5">
              {allDynasties.slice(0, 5).map((d) => {
                const name = d.name ?? d.id ?? ''
                return (
                  <Link
                    key={name}
                    to={`/dynasties/${encodeURIComponent(name)}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface2/50 hover:bg-surface2 border border-transparent hover:border-surface2 transition-all group"
                  >
                    <span
                      className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border font-medium shrink-0 ${eraColor(d.era)}`}
                    >
                      {d.era ?? 'Triều đại'}
                    </span>
                    <span className="text-xs text-gray-300 group-hover:text-gray-100 truncate">
                      {name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Related dynasties */}
            {suggestions.dynasties?.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2.5">
                  📚 Triều đại liên quan
                </p>
                <div className="space-y-1.5">
                  {suggestions.dynasties.map((name) => (
                    <Link
                      key={name}
                      to={`/dynasties/${encodeURIComponent(name)}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface2/50 hover:bg-surface2 border border-transparent hover:border-primary/20 transition-all text-xs text-gray-300 hover:text-primary"
                    >
                      <span className="text-primary shrink-0">›</span>
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Historical persons */}
            {suggestions.persons?.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2.5">
                  👤 Nhân vật lịch sử
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.persons.map((name) => (
                    <button
                      key={name}
                      onClick={() => onFollowUp(`${name} là ai?`)}
                      className="text-xs text-gray-400 hover:text-gray-200 bg-surface2 hover:border-primary/30 border border-surface2 rounded-full px-2.5 py-1 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up questions */}
            {suggestions.followUps?.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2.5">
                  💬 Tìm hiểu thêm
                </p>
                <div className="space-y-1.5">
                  {suggestions.followUps.map((q) => (
                    <button
                      key={q}
                      onClick={() => onFollowUp(q)}
                      className="w-full text-left text-xs text-gray-400 hover:text-gray-200 bg-surface2/50 hover:bg-surface2 border border-surface2 hover:border-primary/20 rounded-lg px-3 py-2 transition-all leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

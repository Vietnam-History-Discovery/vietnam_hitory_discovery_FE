import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDynasties } from '../../services/dynastyService'

const ERA_STYLES = {
  'Độc lập':  { text: '#22c55e', bg: '#22c55e18', border: '#22c55e50' },
  'Bắc thuộc': { text: '#ef4444', bg: '#ef444418', border: '#ef444450' },
  'Huyền sử': { text: '#a855f7', bg: '#a855f718', border: '#a855f750' },
}

function getEraGroups(dynasties) {
  const eraMap = {}
  dynasties.forEach((d) => {
    if (!eraMap[d.era]) eraMap[d.era] = { minYear: d.start_year ?? Infinity, items: [] }
    eraMap[d.era].items.push(d)
    if ((d.start_year ?? Infinity) < eraMap[d.era].minYear) {
      eraMap[d.era].minYear = d.start_year
    }
  })
  return Object.entries(eraMap)
    .map(([era, { minYear, items }]) => ({ era, minYear, items }))
    .sort((a, b) => a.minYear - b.minYear)
}

function EraBadge({ era }) {
  const s = ERA_STYLES[era]
  if (!s) return <span className="text-xs text-gray-500">{era}</span>
  return (
    <span
      className="self-start text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {era}
    </span>
  )
}

function DynastyCard({ dynasty, onClick }) {
  const descPreview = dynasty.description
    ? dynasty.description.slice(0, 80) + (dynasty.description.length > 80 ? '…' : '')
    : null

  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 w-52 rounded-xl bg-surface2 border border-surface2/60 hover:border-primary/40 transition-all hover:scale-[1.02] text-left focus:outline-none focus:ring-2 focus:ring-primary p-4 flex flex-col gap-2"
    >
      <h3 className="text-base font-bold text-gray-100 leading-snug">{dynasty.name}</h3>
      {dynasty.period && (
        <p className="text-sm font-semibold" style={{ color: '#C8A951' }}>
          {dynasty.period}
        </p>
      )}
      <EraBadge era={dynasty.era} />
      {descPreview && (
        <p className="text-xs text-gray-400 leading-relaxed mt-1">{descPreview}</p>
      )}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-52 h-44 rounded-xl bg-surface2 border border-surface2 animate-pulse" />
  )
}

export default function FeaturedDynasties() {
  const navigate = useNavigate()
  const { data: dynasties, isLoading, isError } = useQuery({
    queryKey: ['dynasties'],
    queryFn: getDynasties,
  })

  const groups = dynasties ? getEraGroups(dynasties) : []

  return (
    <section className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Featured Dynasties</h2>
            <p className="text-sm text-gray-500 mt-1">Explore major Vietnamese dynasties</p>
          </div>
          <button
            onClick={() => navigate('/dynasties')}
            className="text-sm text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            View all →
          </button>
        </div>

        {isError ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Could not load dynasties. Check that the API is running.
          </p>
        ) : isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(({ era, items }) => {
              const eraStyle = ERA_STYLES[era]
              return (
                <div key={era}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: eraStyle?.text ?? '#9ca3af' }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: eraStyle?.text ?? '#9ca3af' }}
                    >
                      {era}
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    {items.map((dynasty) => (
                      <DynastyCard
                        key={dynasty.name}
                        dynasty={dynasty}
                        onClick={() =>
                          navigate(`/dynasties/${encodeURIComponent(dynasty.name)}`)
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

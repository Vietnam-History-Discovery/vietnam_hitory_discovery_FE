import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDynasties } from '../../services/dynastyService'

const ERA_COLOR = {
  'Độc lập':  '#C8A951',
  'Bắc thuộc': '#ef4444',
  'Huyền sử': '#a855f7',
}

function formatYear(year) {
  if (year == null) return ''
  return year < 0 ? `${Math.abs(year)} TCN` : String(year)
}

function SkeletonDot() {
  return (
    <div className="flex flex-col items-center gap-0">
      <div className="w-3 h-3 rounded-full bg-surface2 animate-pulse mt-[14.5px]" />
      <div className="mt-4 space-y-1 flex flex-col items-center">
        <div className="h-3 w-12 rounded bg-surface2 animate-pulse" />
        <div className="h-3 w-16 rounded bg-surface2 animate-pulse" />
      </div>
    </div>
  )
}

export default function Timeline() {
  const navigate = useNavigate()
  const { data: dynasties, isLoading } = useQuery({
    queryKey: ['dynasties'],
    queryFn: getDynasties,
  })

  return (
    <section className="px-4 py-12 bg-surface">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-100 mb-2">Historical Timeline</h2>
        <p className="text-sm text-gray-500 mb-10">Milestones in Vietnamese history</p>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="relative min-w-max">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface2" />

            <div className="relative flex gap-16 pb-8">
              {isLoading
                ? Array.from({ length: 7 }).map((_, i) => <SkeletonDot key={i} />)
                : dynasties?.map((dynasty) => {
                    const color = ERA_COLOR[dynasty.era] ?? '#C8A951'
                    return (
                      <button
                        key={dynasty.name}
                        onClick={() =>
                          navigate(`/dynasties/${encodeURIComponent(dynasty.name)}`)
                        }
                        className="group flex flex-col items-center gap-0 focus:outline-none"
                      >
                        {/* Dot */}
                        <div
                          className="relative z-10 w-3 h-3 rounded-full border-2 group-hover:scale-150 transition-all mt-[14.5px]"
                          style={{ backgroundColor: `${color}40`, borderColor: color }}
                        />

                        {/* Year + name + period below line */}
                        <div className="flex flex-col items-center mt-4 gap-0.5">
                          <span
                            className="text-xs font-semibold"
                            style={{ color }}
                          >
                            {formatYear(dynasty.start_year)}
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors whitespace-nowrap max-w-[100px] text-center leading-snug">
                            {dynasty.name}
                          </span>
                          {dynasty.period && (
                            <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors whitespace-nowrap text-center">
                              {dynasty.period}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
            </div>
          </div>
        </div>

        {/* Era legend */}
        {!isLoading && (
          <div className="flex gap-5 mt-2 flex-wrap">
            {Object.entries(ERA_COLOR).map(([era, color]) => (
              <div key={era} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-500">{era}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

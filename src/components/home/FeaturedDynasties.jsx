import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDynasties } from '../../services/dynastyService'

const DYNASTY_COLORS = [
  'from-yellow-900/60',
  'from-red-900/60',
  'from-emerald-900/60',
  'from-blue-900/60',
  'from-purple-900/60',
  'from-orange-900/60',
]

function DynastyCard({ dynasty, colorClass, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 w-48 h-64 rounded-xl overflow-hidden bg-surface2 border border-surface2 hover:border-primary/40 transition-all hover:scale-[1.02] text-left focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${colorClass} to-transparent opacity-70 group-hover:opacity-90 transition-opacity`}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-sm font-semibold text-gray-100 leading-snug">
          {dynasty.name}
        </h3>
        {dynasty.mentionsCount != null && (
          <p className="text-xs text-gray-400 mt-1">
            {dynasty.mentionsCount.toLocaleString()} mentions
          </p>
        )}
      </div>

      {/* Top badge */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-48 h-64 rounded-xl bg-surface2 border border-surface2 animate-pulse" />
  )
}

export default function FeaturedDynasties() {
  const navigate = useNavigate()
  const { data: dynasties, isLoading, isError } = useQuery({
    queryKey: ['dynasties'],
    queryFn: getDynasties,
  })

  return (
    <section className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
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

        {/* Scrollable row */}
        {isError ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Could not load dynasties. Check that the API is running.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : dynasties?.map((dynasty, i) => (
                  <DynastyCard
                    key={dynasty.id ?? dynasty.name}
                    dynasty={dynasty}
                    colorClass={DYNASTY_COLORS[i % DYNASTY_COLORS.length]}
                    onClick={() =>
                      navigate(`/dynasties/${encodeURIComponent(dynasty.name)}`)
                    }
                  />
                ))}
          </div>
        )}
      </div>
    </section>
  )
}

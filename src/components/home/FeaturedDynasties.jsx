import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDynasties } from '../../services/dynastyService'

const ERA_STYLES = {
  'Buổi đầu độc lập': { text: '#9fc2b0', bg: 'rgba(92,122,107,0.1)', border: 'rgba(92,122,107,0.5)' },
  'Lý – Trần': { text: '#e8c77e', bg: 'rgba(198,161,91,0.08)', border: 'rgba(198,161,91,0.4)' },
  'Hậu Lê – Nguyễn': { text: '#e0a394', bg: 'rgba(139,58,43,0.1)', border: 'rgba(139,58,43,0.5)' },
  // Fallbacks for other possible eras
  'Độc lập': { text: '#9fc2b0', bg: 'rgba(92,122,107,0.1)', border: 'rgba(92,122,107,0.5)' },
  'Bắc thuộc': { text: '#e0a394', bg: 'rgba(139,58,43,0.1)', border: 'rgba(139,58,43,0.5)' },
  'Huyền sử': { text: '#e8c77e', bg: 'rgba(198,161,91,0.08)', border: 'rgba(198,161,91,0.4)' },
}

function getEraGroups(dynasties) {
  const eraMap = {}
  dynasties.forEach((d) => {
    const eraName = d.era || 'Khác'
    if (!eraMap[eraName]) eraMap[eraName] = { minYear: d.start_year ?? Infinity, items: [] }
    eraMap[eraName].items.push(d)
    if ((d.start_year ?? Infinity) < eraMap[eraName].minYear) {
      eraMap[eraName].minYear = d.start_year
    }
  })
  return Object.entries(eraMap)
    .map(([era, { minYear, items }]) => ({ era, minYear, items }))
    .sort((a, b) => a.minYear - b.minYear)
}

function EraBadge({ era }) {
  const s = ERA_STYLES[era] || { text: '#9c9080', bg: 'rgba(156,144,128,0.1)', border: 'rgba(156,144,128,0.3)' }
  return (
    <span
      className="self-start text-[10.5px] px-2 py-0.5 rounded-full border font-semibold tracking-wide"
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
      className="group flex-shrink-0 w-64 rounded-[3px] bg-surface border border-gold-border hover:border-gold-border-strong hover:bg-surface2 hover:-translate-y-0.5 transition-all duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-bright p-[18px_18px_16px] flex flex-col gap-2 relative"
    >
      <div className="flex justify-between items-start w-full gap-2">
        <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-primary-bright transition-colors">
          {dynasty.name}
        </h3>
        {dynasty.mentions && (
          <div className="text-[11px] text-primary font-mono whitespace-nowrap">
            {dynasty.mentions}×
          </div>
        )}
      </div>
      {dynasty.period && (
        <div className="text-xs text-ink-muted font-mono">
          {dynasty.period}
        </div>
      )}
      <EraBadge era={dynasty.era} />
      {descPreview ? (
        <p className="text-xs text-ink-muted leading-relaxed mt-1 line-clamp-2">{descPreview}</p>
      ) : (
        <p className="text-xs text-ink-muted italic leading-relaxed mt-1">Chưa có mô tả tóm tắt</p>
      )}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-64 h-40 rounded-[3px] bg-surface border border-gold-border animate-pulse p-[18px_18px_16px] flex flex-col gap-2">
      <div className="h-5 bg-surface2 rounded w-2/3" />
      <div className="h-4 bg-surface2 rounded w-1/2" />
      <div className="h-4 bg-surface2 rounded w-1/3 mt-2" />
    </div>
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
    <section className="px-4 py-12 relative">
      {/* Decorative background layers from Stitch */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-10 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">Triều Đại Nổi Bật</h2>
            <p className="text-sm text-ink-muted mt-1">Khám phá các triều đại lịch sử Việt Nam</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-primary hover:text-primary-bright font-semibold transition-colors shrink-0"
          >
            Tất cả triều đại →
          </button>
        </div>

        {isError ? (
          <div className="border border-dashed border-vermilion/50 bg-surface/50 rounded-[3px] p-8 text-center max-w-md mx-auto">
            <h4 className="text-ink font-semibold mb-2">Không tải được danh sách triều đại</h4>
            <p className="text-xs text-ink-muted mb-4">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
          </div>
        ) : isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map(({ era, items }) => {
              return (
                <div key={era} className="space-y-4">
                  {/* Era signature band from Stitch */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex-none text-[11px] tracking-widest uppercase text-background bg-primary font-bold px-3 py-1 rounded-[6px_2px_6px_2px]">
                      {era}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gold-border-strong to-transparent" />
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


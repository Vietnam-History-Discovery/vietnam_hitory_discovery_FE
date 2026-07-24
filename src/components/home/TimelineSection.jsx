import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDynasties } from '../../services/dynastyService'
import useInView from '../../hooks/useInView'

const PREVIEW_COUNT = 7

// Picks an even spread of milestones across the full chronological range,
// rather than just the earliest N, so the preview spans the whole history.
function pickMilestones(dynasties) {
  const sorted = dynasties
    .filter((d) => d.start_year != null)
    .sort((a, b) => a.start_year - b.start_year)
  if (sorted.length <= PREVIEW_COUNT) return sorted

  const step = (sorted.length - 1) / (PREVIEW_COUNT - 1)
  return Array.from({ length: PREVIEW_COUNT }, (_, i) => sorted[Math.round(i * step)])
}

export default function TimelineSection() {
  const navigate = useNavigate()
  const { ref, isInView } = useInView()
  const { data: dynasties } = useQuery({ queryKey: ['dynasties'], queryFn: getDynasties })

  const milestones = useMemo(() => (dynasties ? pickMilestones(dynasties) : []), [dynasties])
  const [selectedMilestone, setSelectedMilestone] = useState(null)

  const activeMilestone = selectedMilestone ?? milestones[0] ?? null

  return (
    <section ref={ref} className="px-4 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isInView ? 'animate-section-reveal' : 'opacity-0'}`}>
          {/* Left: copy + CTA */}
          <div>
            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4">
              Khám phá theo dòng thời gian
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
              Hành trình xuyên suốt lịch sử Việt Nam
            </h2>
            <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Từ thời Hồng Bàng dựng nước đến các triều đại phong kiến sau này, dòng thời gian
              tương tác giúp bạn theo dõi các mốc son lịch sử theo trình tự thời gian, kèm bối
              cảnh và nhân vật liên quan.
            </p>
            <button
              onClick={() => navigate('/timeline')}
              className="mt-4 bg-primary hover:bg-primary/90 text-gray-900 font-semibold text-sm rounded-lg px-5 py-2.5 transition-all"
            >
              Xem Timeline đầy đủ →
            </button>
          </div>

          {/* Right: compact milestone preview */}
          <div className="relative">
            {milestones.length > 0 && (
              <>
                <div className="relative h-px bg-gold-border mb-8">
                  <div
                    className={`absolute inset-0 h-px bg-primary ${isInView ? 'animate-draw-line' : 'scale-x-0'}`}
                  />
                </div>
                <div className="flex justify-between gap-2">
                  {milestones.map((m, i) => {
                    const isActive = activeMilestone?.name === m.name
                    return (
                      <button
                        key={m.name}
                        onMouseEnter={() => setSelectedMilestone(m)}
                        onClick={() => setSelectedMilestone(m)}
                        style={isInView ? { animationDelay: `${300 + i * 70}ms` } : undefined}
                        className={`group flex flex-col items-center gap-2 flex-1 min-w-0 ${
                          isInView ? 'animate-section-reveal' : 'opacity-0'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 ${
                            isActive
                              ? 'bg-primary border-primary scale-125'
                              : 'bg-surface border-gold-border-strong group-hover:border-primary'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-mono text-center leading-tight transition-colors ${
                            isActive ? 'text-primary' : 'text-ink-muted group-hover:text-primary'
                          }`}
                        >
                          {m.period ?? m.start_year}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {activeMilestone && (
                  <div className="mt-8 bg-surface border border-gold-border rounded-xl p-5">
                    <h3 className="font-serif text-lg font-semibold text-ink mb-1">
                      {activeMilestone.name}
                    </h3>
                    {activeMilestone.description && (
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                        {activeMilestone.description}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

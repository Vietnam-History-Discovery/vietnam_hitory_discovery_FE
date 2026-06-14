import { useNavigate } from 'react-router-dom'

const EVENTS = [
  { year: '2879 TCN', label: 'Hồng Bàng', dynasty: 'Hồng Bàng' },
  { year: '257 TCN',  label: 'Âu Lạc',    dynasty: 'Âu Lạc' },
  { year: '179 TCN',  label: 'Nam Việt',   dynasty: 'Nam Việt' },
  { year: '40 SCN',   label: 'Hai Bà Trưng', dynasty: 'Hai Bà Trưng' },
  { year: '544',      label: 'Nhà Lý Nam Đế', dynasty: 'Lý Nam Đế' },
  { year: '938',      label: 'Ngô Quyền',  dynasty: 'Ngô' },
  { year: '968',      label: 'Nhà Đinh',   dynasty: 'Đinh' },
]

export default function Timeline() {
  const navigate = useNavigate()

  return (
    <section className="px-4 py-12 bg-surface">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-100 mb-2">Key Historical Events</h2>
        <p className="text-sm text-gray-500 mb-10">
          Milestones in Vietnamese history
        </p>

        {/* Scrollable timeline container */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="relative min-w-max">
            {/* Horizontal line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-surface2" />

            {/* Events */}
            <div className="relative flex gap-16 pb-8">
              {EVENTS.map((event, i) => (
                <button
                  key={i}
                  onClick={() =>
                    navigate(`/dynasties/${encodeURIComponent(event.dynasty)}`)
                  }
                  className="group flex flex-col items-center gap-0 focus:outline-none"
                >
                  {/* Dot */}
                  <div className="relative z-10 w-3 h-3 rounded-full bg-primary/40 border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all mt-[14.5px]" />

                  {/* Year + label below line */}
                  <div className="flex flex-col items-center mt-4 gap-1">
                    <span className="text-xs font-semibold text-primary">
                      {event.year}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors whitespace-nowrap max-w-[100px] text-center leading-snug">
                      {event.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

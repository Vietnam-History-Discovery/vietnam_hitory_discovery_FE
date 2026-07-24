import { useNavigate } from 'react-router-dom'
import { Users, Swords, Landmark } from 'lucide-react'
import useInView from '../../hooks/useInView'

const EXAMPLES = [
  { icon: Users, label: 'Nhân vật lịch sử' },
  { icon: Swords, label: 'Sự kiện chiến tranh' },
  { icon: Landmark, label: 'Bối cảnh văn hóa' },
]

export default function ChatCTASection() {
  const navigate = useNavigate()
  const { ref, isInView } = useInView()

  return (
    <section ref={ref} className="px-4 py-20 lg:py-28">
      <div
        className={`max-w-5xl mx-auto relative overflow-hidden rounded-2xl lg:rounded-3xl border border-gold-border bg-gradient-to-br from-primary/10 via-surface to-surface p-10 sm:p-14 lg:p-16 text-center ${
          isInView ? 'animate-section-reveal' : 'opacity-0'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative">
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
            Hỏi Bất Kỳ Điều Gì
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
            AI đã học toàn bộ Đại Việt Sử Ký Toàn Thư và Việt Nam Sử Lược, sẵn sàng trả lời bất kỳ
            câu hỏi nào của bạn.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-primary hover:bg-primary/90 text-gray-900 font-semibold text-base rounded-lg px-8 py-3.5 transition-all"
          >
            Bắt đầu trò chuyện →
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 max-w-2xl mx-auto">
            {EXAMPLES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 justify-center sm:justify-start bg-surface/60 border border-gold-border rounded-lg px-4 py-3"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

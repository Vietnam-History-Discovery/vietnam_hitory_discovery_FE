import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function DynastyHero({ name, mentions }) {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden bg-background border-b border-gold-border py-8">
      {/* Decorative background layers from Stitch */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 900px 500px at 15% -5%, rgba(198,161,91,0.07), transparent 60%),
              radial-gradient(ellipse 700px 500px at 100% 10%, rgba(139,58,43,0.06), transparent 60%)
            `
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Topbar/Breadcrumb row from Stitch */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-4 border-b border-gold-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-[1.5px] border-primary rounded-[6px_2px_6px_2px] flex items-center justify-center text-primary shadow-[inset_0_0_0_1px_rgba(198,161,91,0.15)]">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-ink leading-tight block">Dynasty Explorer</span>
              <span className="text-[10px] text-ink-muted tracking-wider block mt-0.5">Vietnam Chronicles — Đại Việt Sử Ký Toàn Thư</span>
            </div>
          </div>

          <div className="text-xs text-ink-muted flex items-center gap-1.5 font-sans">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary-bright transition-colors"
            >
              Home
            </button>
            <span className="opacity-50">/</span>
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary-bright transition-colors"
            >
              Dynasties
            </button>
            <span className="opacity-50">/</span>
            <span className="text-primary">{name}</span>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-xs text-ink-muted hover:text-primary-bright transition-colors flex items-center gap-1.5 mb-6 focus:outline-none"
        >
          ← Quay lại danh sách triều đại
        </button>

        {/* Hero title & stats */}
        <div className="dyn-hero">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-tight tracking-wide mb-3">
            {name}
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-muted">
            {mentions != null ? (
              <>
                Được nhắc đến <b className="text-primary font-mono font-semibold text-sm sm:text-base">{mentions}</b> lần trong sử liệu
              </>
            ) : (
              'Chưa có dữ liệu lượt nhắc đến'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


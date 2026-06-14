import { useNavigate } from 'react-router-dom'

export default function DynastyHero({ name, mentions }) {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden bg-surface border-b border-surface2">
      {/* Decorative background layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Gold radial glow top-right */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        {/* Subtle horizontal gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {/* Diagonal grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #C8A951 0, #C8A951 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-600 mb-6">
          <button
            onClick={() => navigate('/')}
            className="hover:text-primary transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/dynasties')}
            className="hover:text-primary transition-colors"
          >
            Dynasties
          </button>
          <span>/</span>
          <span className="text-gray-400">{name}</span>
        </nav>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-primary/60" />
          <span className="text-xs font-medium tracking-widest text-primary uppercase">
            Dynasty
          </span>
        </div>

        {/* Dynasty name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-3 leading-tight">
          {name}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-base mb-6">
          Explore the history of the {name} period
        </p>

        {/* Stats row */}
        {mentions != null && (
          <div className="inline-flex items-center gap-2 bg-surface2 border border-surface2 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-gray-400">
              <span className="text-gray-200 font-medium">
                {mentions.toLocaleString()}
              </span>{' '}
              historical mentions
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

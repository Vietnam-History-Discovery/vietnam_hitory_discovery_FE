const LINE_LENGTH = 280
const DOT_POSITIONS = [10, 80, 150, 220, 290]

// Ambient mini timeline preview for the "no snapshot yet" empty state — a
// line that continuously draws in and fades (stroke-dasharray/-dashoffset)
// with softly staggered pulsing dots, meant to read as a quiet "breathing"
// idle state rather than a loading spinner.
export default function TimelineEmptyStateIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 300 80" className={className} aria-hidden="true">
      <line
        x1="10"
        y1="40"
        x2="290"
        y2="40"
        stroke="var(--color-gold-border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-timeline-preview-draw"
        style={{ '--tl-preview-length': LINE_LENGTH }}
      />
      {DOT_POSITIONS.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="40"
          r="5"
          fill="var(--color-gold-border-strong)"
          className="animate-timeline-preview-pulse"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </svg>
  )
}

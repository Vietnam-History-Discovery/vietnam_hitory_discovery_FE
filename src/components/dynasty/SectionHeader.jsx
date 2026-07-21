export default function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-2.5 pb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <h3 className="text-xs font-bold text-primary-bright uppercase tracking-[0.1em] leading-none">
        {children}
      </h3>
    </div>
  )
}

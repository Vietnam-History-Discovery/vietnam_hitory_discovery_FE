export default function Overview({ chunks }) {
  // Use the first chunk as the overview paragraph
  const overviewText = chunks?.[0]?.text ?? chunks?.[0] ?? null

  if (!overviewText) return null

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-primary" />
        Overview
      </h2>

      <div className="bg-surface rounded-xl border border-surface2 p-6">
        <p className="text-gray-300 text-sm leading-relaxed">
          {overviewText}
        </p>
      </div>
    </section>
  )
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function PersonCard({ name }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-surface rounded-xl border border-surface2 hover:border-primary/30 p-5 transition-colors text-center">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold shrink-0">
        {getInitials(name)}
      </div>
      <span className="text-sm text-gray-300 font-medium leading-snug">{name}</span>
    </div>
  )
}

export default function KeyFigures({ persons }) {
  if (!persons?.length) return null

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-primary" />
        Key Figures
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {persons.map((person, i) => {
          const name = typeof person === 'string' ? person : person.name ?? String(person)
          return <PersonCard key={i} name={name} />
        })}
      </div>
    </section>
  )
}

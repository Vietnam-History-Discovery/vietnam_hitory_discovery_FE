import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function TableOfContents({ sections, variant = 'sidebar' }) {
  const [activeId, setActiveId] = useState(sections[0]?.id)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const elements = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  const list = (
    <ul className="space-y-1">
      {sections.map((section) => (
        <li key={section.id}>
          <button
            onClick={() => scrollToSection(section.id)}
            className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg border transition-colors ${activeId === section.id
                ? 'bg-primary/20 border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-primary'
              }`}
          >
            {section.title}
          </button>
        </li>
      ))}
    </ul>
  )

  if (variant === 'sidebar') {
    return (
      <div className="bg-surface border border-surface2 rounded-xl p-4">
        <h3 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Mục lục</h3>
        {list}
      </div>
    )
  }

  return (
    <div className="bg-surface border border-surface2 rounded-xl mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300"
      >
        <span className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-primary" />
          Mục lục
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{list}</div>
        </div>
      </div>
    </div>
  )
}

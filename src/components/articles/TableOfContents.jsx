import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const SIDEBAR_VISIBLE_ITEMS = 4
const SIDEBAR_ITEM_GAP_PX = 4 // matches the `space-y-1` gap between <li> items

export default function TableOfContents({ sections, variant = 'sidebar', activeSectionId }) {
  const [internalActiveId, setInternalActiveId] = useState(sections[0]?.id)
  const [open, setOpen] = useState(false) // accordion (mobile) expand/collapse — unchanged
  const [sidebarExpanded, setSidebarExpanded] = useState(true) // sidebar collapse/expand — default expanded

  const activeId = activeSectionId ?? internalActiveId

  // Self-managed active-section tracking, used only when the parent doesn't supply
  // activeSectionId — keeps this component backward compatible (e.g. PoliciesPage.jsx
  // uses both variants without the prop) and skips registering a duplicate observer
  // whenever the parent already tracks this itself.
  useEffect(() => {
    if (activeSectionId != null) return undefined
    const elements = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setInternalActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections, activeSectionId])

  // Measure one rendered item's height so the sidebar's ~4-item scroll window is
  // sized correctly even when titles wrap to multiple lines, instead of a fixed px guess.
  // Also re-measures on re-expand: if sections changed while collapsed (e.g. navigating
  // to a different article via prev/next), the ref only exists once expanded again.
  const firstItemRef = useRef(null)
  const [itemHeight, setItemHeight] = useState(null)
  useLayoutEffect(() => {
    if (sidebarExpanded && firstItemRef.current) setItemHeight(firstItemRef.current.offsetHeight)
  }, [sections, sidebarExpanded])

  // Per-item refs so the active item can be scrolled into view within the sidebar's
  // own internal scroll container, not the page.
  const itemRefs = useRef(new Map())

  useEffect(() => {
    if (variant !== 'sidebar' || !sidebarExpanded || !activeId) return
    itemRefs.current.get(activeId)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId, variant, sidebarExpanded])

  if (sections.length === 0) return null

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  const itemClass = (id) =>
    `block w-full text-left text-sm py-1.5 px-3 rounded-lg border transition-colors ${
      activeId === id
        ? 'bg-primary/20 border-primary text-primary'
        : 'border-transparent text-gray-400 hover:text-primary'
    }`

  if (variant === 'sidebar') {
    const maxListHeight = itemHeight
      ? itemHeight * SIDEBAR_VISIBLE_ITEMS + SIDEBAR_ITEM_GAP_PX * (SIDEBAR_VISIBLE_ITEMS - 1)
      : undefined

    return (
      <div className="bg-surface border border-surface2 rounded-xl p-4">
        <button
          onClick={() => setSidebarExpanded((v) => !v)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-xs tracking-[0.2em] uppercase text-gray-500">Mục lục</h3>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
              sidebarExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>
        {sidebarExpanded && (
          <div className="overflow-y-auto" style={{ maxHeight: maxListHeight }}>
            <ul className="space-y-1">
              {sections.map((section, i) => (
                <li key={section.id} ref={i === 0 ? firstItemRef : undefined}>
                  <button
                    ref={(el) => {
                      if (el) itemRefs.current.set(section.id, el)
                      else itemRefs.current.delete(section.id)
                    }}
                    onClick={() => scrollToSection(section.id)}
                    className={itemClass(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
          <div className="px-4 pb-4">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button onClick={() => scrollToSection(section.id)} className={itemClass(section.id)}>
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

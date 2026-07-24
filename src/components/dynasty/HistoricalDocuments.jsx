import { useState } from 'react'
import SectionHeader from './SectionHeader'
import { getChunkSource, getChunkText, getChunkTitle } from './dynastyViewUtils'

function DocumentCard({ chunk, index }) {
  const [expanded, setExpanded] = useState(false)

  const rawText = getChunkText(chunk)
  const title = getChunkTitle(chunk, index)
  const source = getChunkSource(chunk)

  return (
    <div className="bg-surface border border-gold-border rounded-[3px] p-[16px_18px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <h4 className="font-serif text-[14.5px] font-semibold text-ink leading-snug">{title}</h4>
        <span className="shrink-0 text-[10.5px] text-primary border border-primary/35 rounded-full px-[9px] py-[2px] tracking-wider uppercase font-sans font-semibold">
          {source}
        </span>
      </div>

      {/* Text */}
      <p
        id={`doc-text-${index}`}
        className={`text-[13.5px] text-ink-muted leading-[1.8] font-sans ${expanded ? '' : 'line-clamp-2'}`}
      >
        {rawText}
      </p>

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`doc-text-${index}`}
        className="bg-none border-none text-primary hover:text-primary-bright text-[12.5px] font-bold cursor-pointer pt-2 font-sans focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-bright"
      >
        {expanded ? 'Thu gọn' : 'Xem thêm'}
      </button>
    </div>
  )
}

export default function HistoricalDocuments({ chunks, dynastyName }) {
  if (!chunks?.length) return null

  // Filter chunks có title liên quan đến dynasty, bỏ "Mở đầu" và chunks không rõ nguồn
  const filtered = chunks
    .filter(chunk => {
      const title = (getChunkTitle(chunk, 0) || '').toLowerCase()
      // Bỏ chunks có title chung chung
      if (title === 'mở đầu' || title.startsWith('mở đầu')) return false
      return true
    })
    // Ưu tiên chunks có title chứa tên dynasty
    .sort((a, b) => {
      const nameL = (dynastyName || '').toLowerCase().replace(/^nhà\s+/i, '')
      const aTitle = (a.title || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()
      const aMatch = aTitle.includes(nameL) ? -1 : 0
      const bMatch = bTitle.includes(nameL) ? -1 : 0
      return aMatch - bMatch
    })
    .slice(0, 5) // Giới hạn 5 chunks

  if (!filtered.length) return null

  return (
    <section className="space-y-4">
      <SectionHeader>Nguồn sử liệu gốc</SectionHeader>
      <p className="text-xs text-gray-600 -mt-2">Trích từ Đại Việt Sử Ký Toàn Thư</p>
      <div className="space-y-3">
        {filtered.map((chunk, i) => (
          <DocumentCard key={i} chunk={chunk} index={i} />
        ))}
      </div>
    </section>
  )
}

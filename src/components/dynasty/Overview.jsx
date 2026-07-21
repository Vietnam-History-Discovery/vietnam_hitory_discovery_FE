import SectionHeader from './SectionHeader'
import { getChunkText } from './dynastyViewUtils'

const ERA_STYLES = {
  'Buổi đầu độc lập': { text: '#9fc2b0', bg: 'rgba(92,122,107,0.1)', border: 'rgba(92,122,107,0.5)' },
  'Lý – Trần': { text: '#e8c77e', bg: 'rgba(198,161,91,0.08)', border: 'rgba(198,161,91,0.4)' },
  'Hậu Lê – Nguyễn': { text: '#e0a394', bg: 'rgba(139,58,43,0.1)', border: 'rgba(139,58,43,0.5)' },
  // Fallbacks
  'Độc lập': { text: '#9fc2b0', bg: 'rgba(92,122,107,0.1)', border: 'rgba(92,122,107,0.5)' },
  'Bắc thuộc': { text: '#e0a394', bg: 'rgba(139,58,43,0.1)', border: 'rgba(139,58,43,0.5)' },
  'Huyền sử': { text: '#e8c77e', bg: 'rgba(198,161,91,0.08)', border: 'rgba(198,161,91,0.4)' },
}

function MetaPill({ label, value, isPrimaryColor }) {
  return (
    <div className="bg-surface border border-gold-border rounded-[4px] p-2.5 min-w-[100px] flex flex-col gap-1">
      <span className="text-[10px] text-ink-muted uppercase tracking-widest leading-none block mb-0.5">{label}</span>
      <span className={`text-[12.5px] font-medium font-mono ${isPrimaryColor ? 'text-primary' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  )
}

function EraPill({ era }) {
  const s = ERA_STYLES[era] || { text: '#9c9080', bg: 'rgba(156,144,128,0.1)', border: 'rgba(156,144,128,0.3)' }
  return (
    <div className="bg-surface border border-gold-border rounded-[4px] p-2.5 flex flex-col gap-1.5">
      <span className="text-[10px] text-ink-muted uppercase tracking-widest leading-none block">Era</span>
      <span
        className="text-[10.5px] px-2 py-0.5 rounded-full border font-semibold tracking-wide self-start"
        style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
      >
        {era}
      </span>
    </div>
  )
}

export default function Overview({ chunks, listDynasty }) {
  const hasChunks = chunks?.length > 0
  const hasMeta = listDynasty?.period || listDynasty?.capital || listDynasty?.era
  const hasContent = listDynasty?.description || hasMeta || hasChunks

  if (!hasContent) return null

  // Format first chunk text as highlight excerpt if present
  const highlightText = hasChunks ? getChunkText(chunks[0]) : ''

  return (
    <section className="space-y-4">
      <SectionHeader>Tổng quan</SectionHeader>

      <div className="bg-surface border border-gold-border rounded-[3px] p-[18px_18px_16px] space-y-4">
        {/* Metadata pills */}
        {hasMeta && (
          <div className="flex flex-wrap items-start gap-2.5">
            {listDynasty.period && (
              <MetaPill label="Giai đoạn" value={listDynasty.period} isPrimaryColor />
            )}
            {listDynasty.capital && (
              <MetaPill label="Kinh đô" value={listDynasty.capital} />
            )}
            {listDynasty.era && (
              <EraPill era={listDynasty.era} />
            )}
          </div>
        )}

        {/* Description */}
        {listDynasty?.description && (
          <p className="text-ink text-[14.5px] leading-relaxed max-w-[70ch]">{listDynasty.description}</p>
        )}

        {/* Highlight Excerpt from Stitch */}
        {highlightText && highlightText.trim() && (
          <div className="border-l-2 border-primary pl-4 py-1 mt-4 italic text-ink-muted text-[13.5px] leading-relaxed max-w-[65ch]">
            "{highlightText.length > 160 ? highlightText.slice(0, 160) + '…' : highlightText}"
          </div>
        )}
      </div>
    </section>
  )
}


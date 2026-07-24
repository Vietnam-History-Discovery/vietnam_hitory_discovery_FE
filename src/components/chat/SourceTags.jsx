import { BookOpen, ExternalLink } from 'lucide-react'

const DOCUMENT_URLS = {
  'Đại Việt sử ký toàn thư': 'https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư',
  'Đại Việt Sử Ký Toàn Thư': 'https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư',
  'Việt Nam sử lược': 'https://vi.wikisource.org/wiki/Việt_Nam_sử_lược',
  'Việt Nam Sử Lược': 'https://vi.wikisource.org/wiki/Việt_Nam_sử_lược',
}

export default function SourceTags({ sources = [] }) {
  if (!sources.length) return null

  return (
    <div className="flex flex-wrap gap-1.5 px-1 pt-1" aria-label="Nguồn tài liệu">
      {sources.map((source) => {
        const label = source.document || source.title || source.source
        if (!label) return null
        const url = source.url || DOCUMENT_URLS[label]

        const className = 'inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] leading-none text-gray-400 transition-colors'
        const contents = (
          <>
            <BookOpen className="h-3 w-3 shrink-0 text-primary/80" aria-hidden="true" />
            <span className="shrink-0 text-gray-500">Nguồn:</span>
            <span className="truncate text-gray-300">{label}</span>
            {url && <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />}
          </>
        )

        return url ? (
          <a
            key={`${label}-${url}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Mở nguồn ${label}`}
            className={`${className} hover:border-primary/40 hover:text-primary`}
          >
            {contents}
          </a>
        ) : (
          <span key={label} className={className} title={`Nguồn ${label}`}>
            {contents}
          </span>
        )
      })}
    </div>
  )
}

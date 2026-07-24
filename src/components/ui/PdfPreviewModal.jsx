import { X } from 'lucide-react'

export default function PdfPreviewModal({ url, title, onClose }) {
  if (!url) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-surface border border-surface2 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface2">
          <span className="text-sm font-semibold text-gray-100">{title}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* PDF iframe */}
        <iframe
          src={url}
          className="w-full h-[calc(100%-48px)]"
          title={title}
        />
      </div>
    </div>
  )
}

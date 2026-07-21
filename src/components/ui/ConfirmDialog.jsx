import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm bg-surface border border-surface2 rounded-2xl p-6 shadow-2xl animate-message-in"
      >
        <div className="flex items-start gap-3">
          {variant === 'danger' && (
            <div className="shrink-0 w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
          )}
          <div className="flex-1 pt-1 min-w-0">
            <h2 id="confirm-dialog-title" className="text-sm font-semibold text-gray-100">
              {title}
            </h2>
            {description && <p className="text-sm text-gray-400 mt-1.5">{description}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            autoFocus
            className={`text-sm font-semibold rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              variant === 'danger'
                ? 'bg-red-500/90 hover:bg-red-500 text-white'
                : 'bg-primary hover:bg-primary/90 text-gray-900'
            }`}
          >
            {isLoading ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

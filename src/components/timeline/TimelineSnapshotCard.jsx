import { Clock } from 'lucide-react'

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (mins > 0) return `${mins} phút trước`
  return 'Vừa xong'
}

export default function TimelineSnapshotCard({ snapshot, createdAt, isActive, onClick }) {
  if (!snapshot) return null
  const eventCount = snapshot.events?.length ?? 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isActive
          ? 'bg-primary/10 border-primary/30'
          : 'bg-surface border-surface2 hover:border-primary/20 hover:bg-surface2/60'
      }`}
    >
      <p className={`text-xs font-medium truncate ${isActive ? 'text-primary' : 'text-gray-200'}`}>
        {snapshot.title || 'Dòng thời gian'}
      </p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="text-[10px] text-gray-600">
          {eventCount} sự kiện
        </span>
        {createdAt && (
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            <Clock className="w-2.5 h-2.5" />
            {relativeTime(createdAt)}
          </span>
        )}
      </div>
    </button>
  )
}

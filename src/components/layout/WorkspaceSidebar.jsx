import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Clock, ChevronDown, Plus } from 'lucide-react'
import chatService from '../../services/chatService'

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

function SessionRow({ session, isActive, isDeleting, onSelect, onDelete }) {
  const preview = (session.title || session.lastMessage || 'Cuộc trò chuyện').slice(0, 40)
  const ts = session.updatedAt ?? session.lastMessageAt ?? session.createdAt

  return (
    <div
      className={`group relative flex items-center ${
        isActive ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-surface2/60'
      }`}
    >
      <button
        onClick={onSelect}
        disabled={isDeleting}
        className="flex-1 min-w-0 text-left px-4 py-3 pr-2"
      >
        <p
          className={`text-xs font-medium truncate ${
            isActive ? 'text-primary' : 'text-gray-300 group-hover:text-gray-100'
          }`}
        >
          {preview}
        </p>
        <p className="text-[10px] text-gray-600 mt-0.5">{relativeTime(ts)}</p>
      </button>

      <button
        onClick={onDelete}
        disabled={isDeleting}
        title="Xóa cuộc trò chuyện"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 mr-2 rounded-lg text-gray-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function SessionList({ sessions, isLoading, emptyLabel, activeSessionId, deletingIds, onSelect, onDelete }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return <p className="text-xs text-gray-600 text-center px-4 py-8">{emptyLabel}</p>
  }

  return sessions.map((session) => (
    <SessionRow
      key={session.id}
      session={session}
      isActive={session.id === activeSessionId}
      isDeleting={deletingIds.has(session.id)}
      onSelect={() => onSelect(session.id)}
      onDelete={(e) => onDelete(e, session)}
    />
  ))
}

export default function WorkspaceSidebar({
  activeSessionId,
  activeType,
  onSelectSession,
  onNewChat,
  onNewTimeline,
}) {
  const queryClient = useQueryClient()
  const [timelineOpen, setTimelineOpen] = useState(() => activeType === 'TIMELINE')
  const [deletingIds, setDeletingIds] = useState(() => new Set())

  const { data: chatSessions = [], isLoading: chatLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatService.getSessions('CHAT'),
  })

  const { data: timelineSessions = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline-sessions'],
    queryFn: () => chatService.getSessions('TIMELINE'),
    enabled: timelineOpen,
  })

  const handleDelete = async (e, session, type) => {
    e.stopPropagation()
    const sessionId = session.id
    if (deletingIds.has(sessionId)) return
    if (!window.confirm('Xóa cuộc trò chuyện này?')) return

    const queryKey = type === 'TIMELINE' ? ['timeline-sessions'] : ['chat-sessions']
    const previousSessions = queryClient.getQueryData(queryKey)

    setDeletingIds((current) => new Set(current).add(sessionId))
    queryClient.setQueryData(queryKey, (current = []) => current.filter((s) => s.id !== sessionId))

    if (sessionId === activeSessionId) {
      if (type === 'TIMELINE') {
        onNewTimeline?.()
      } else {
        onNewChat?.()
      }
    }

    try {
      await chatService.deleteSession(sessionId)
      await queryClient.invalidateQueries({ queryKey })
    } catch {
      if (previousSessions) {
        queryClient.setQueryData(queryKey, previousSessions)
      }
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current)
        next.delete(sessionId)
        return next
      })
    }
  }

  return (
    <div className="w-64 bg-surface flex flex-col border-r border-surface2 shrink-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface2 shrink-0">
        <h2 className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
          Lịch sử trò chuyện
        </h2>
        <button
          onClick={onNewChat}
          title="Cuộc trò chuyện mới"
          className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat + Timeline lists */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="py-1">
          <SessionList
            sessions={chatSessions}
            isLoading={chatLoading}
            emptyLabel="Chưa có cuộc trò chuyện nào"
            activeSessionId={activeType === 'CHAT' ? activeSessionId : null}
            deletingIds={deletingIds}
            onSelect={(id) => onSelectSession(id, 'CHAT')}
            onDelete={(e, session) => handleDelete(e, session, 'CHAT')}
          />
        </div>

        {/* Timeline accordion */}
        <div className="border-t border-surface2">
          <button
            onClick={() => setTimelineOpen((open) => !open)}
            className="w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-medium text-gray-400 hover:text-gray-200 hover:bg-surface2/60 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Timeline
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${timelineOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: timelineOpen ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[10px] text-gray-600">Dòng thời gian</span>
                <button
                  onClick={onNewTimeline}
                  title="Timeline mới"
                  className="w-6 h-6 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="pb-1">
                <SessionList
                  sessions={timelineSessions}
                  isLoading={timelineLoading}
                  emptyLabel="Chưa có timeline nào"
                  activeSessionId={activeType === 'TIMELINE' ? activeSessionId : null}
                  deletingIds={deletingIds}
                  onSelect={(id) => onSelectSession(id, 'TIMELINE')}
                  onDelete={(e, session) => handleDelete(e, session, 'TIMELINE')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

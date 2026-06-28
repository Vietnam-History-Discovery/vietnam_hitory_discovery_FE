import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { getSessions } from '../../services/chatService'
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

export default function ChatSidebar({ activeSessionId, onSelectSession, onNewChat }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deletingSessionIds, setDeletingSessionIds] = useState(() => new Set())

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: getSessions,
  })

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation()
    if (deletingSessionIds.has(sessionId)) return
    if (!window.confirm('Xóa cuộc trò chuyện này?')) return

    const previousSessions = queryClient.getQueryData(['chat-sessions'])

    setDeletingSessionIds((current) => new Set(current).add(sessionId))
    queryClient.setQueryData(['chat-sessions'], (current = []) =>
      current.filter((session) => session.id !== sessionId)
    )

    if (sessionId === activeSessionId) {
      navigate('/chat')
    }

    try {
      await chatService.deleteSession(sessionId)
      await queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    } catch (err) {
      if (previousSessions) {
        queryClient.setQueryData(['chat-sessions'], previousSessions)
      }
      console.error('Delete failed:', err)
    } finally {
      setDeletingSessionIds((current) => {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-gray-600 text-center px-4 py-8">
            Chưa có cuộc trò chuyện nào
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId
            const isDeleting = deletingSessionIds.has(session.id)
            const preview = (session.title || session.lastMessage || 'Cuộc trò chuyện').slice(0, 40)
            const ts = session.updatedAt ?? session.lastMessageAt ?? session.createdAt

            return (
              <div
                key={session.id}
                className={`group relative flex items-center ${
                  isActive ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-surface2/60'
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
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
                  onClick={(e) => handleDelete(e, session.id)}
                  disabled={isDeleting}
                  title="Xóa cuộc trò chuyện"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 mr-2 rounded-lg text-gray-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

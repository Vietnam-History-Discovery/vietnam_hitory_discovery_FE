import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import WorkspaceSidebar from '../components/layout/WorkspaceSidebar'

export default function WorkspaceLayout() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const activeType = location.pathname.startsWith('/timeline') ? 'TIMELINE' : 'CHAT'

  const handleSelectSession = (id, type) => {
    navigate(type === 'TIMELINE' ? `/timeline/${id}` : `/chat/${id}`)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left panel — hidden on mobile, persists across chat/timeline navigation */}
        <div className="hidden md:flex shrink-0">
          <WorkspaceSidebar
            activeSessionId={sessionId ?? null}
            activeType={activeType}
            onSelectSession={handleSelectSession}
            onNewChat={() => navigate('/chat')}
            onNewTimeline={() => navigate('/timeline')}
          />
        </div>

        <Outlet />
      </div>
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import DynastyDetailPage from './pages/DynastyDetailPage'
import WorkspaceLayout from './pages/WorkspaceLayout'
import ChatPage from './pages/ChatPage'
import TimelinePage from './pages/TimelinePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import AdminLayout from './pages/AdminLayout'
import UserManagementTab from './components/admin/UserManagementTab'
import ArticleManagementTab from './components/admin/ArticleManagementTab'
import AdminArticleFormPage from './pages/AdminArticleFormPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dynasties/:name"
              element={
                <ProtectedRoute>
                  <DynastyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/:slug"
              element={
                <ProtectedRoute>
                  <ArticleDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<UserManagementTab />} />
              <Route path="/admin/articles" element={<ArticleManagementTab />} />
              <Route path="/admin/articles/new" element={<AdminArticleFormPage />} />
              <Route path="/admin/articles/:slug/edit" element={<AdminArticleFormPage />} />
            </Route>
            <Route
              element={
                <ProtectedRoute>
                  <WorkspaceLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:sessionId" element={<ChatPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/timeline/:sessionId" element={<TimelinePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

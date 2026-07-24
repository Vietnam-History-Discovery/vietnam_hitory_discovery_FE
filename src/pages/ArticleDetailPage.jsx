import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import TableOfContents from '../components/articles/TableOfContents'
import { ArticleDetailSkeleton } from '../components/articles/ArticleSkeleton'
import ChatBox from '../components/chat/ChatBox'
import { getArticle, getArticlesByEra, getArticleChatContext } from '../services/articleService'
import chatService from '../services/chatService'
import { ERA_DISPLAY } from '../constants/articles'

function Paragraphs({ text }) {
  if (!text) return null
  return text.split(/\n\n+/).map((para, i) => (
    <p key={i} className="mb-4">
      {para}
    </p>
  ))
}

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
    enabled: !!slug,
  })

  const { data: eraArticles } = useQuery({
    queryKey: ['articles-by-era', article?.era_slug],
    queryFn: () => getArticlesByEra(article.era_slug),
    enabled: !!article?.era_slug,
  })

  // Rich, article-specific context string for the chat AI (mirrors DynastyDetailPage's
  // dynastyChatContext query) — replaces the coarse article.era label, which caused
  // Chronicle AI to answer about unrelated dynasties within the same broad era.
  const { data: articleChatContext } = useQuery({
    queryKey: ['articleChatContext', slug],
    queryFn: () => getArticleChatContext(slug),
    enabled: !!slug,
    retry: false,
  })

  const [sessionId, setSessionId] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const articleSessionRef = useRef(null)
  const creatingSessionRef = useRef(null)

  // Look up an existing chat session for this article, keyed by the route slug
  // (unlike chapter_title, guaranteed unique). Depends on `article` (not just
  // `slug`) so it re-fires once the article query resolves — slug alone never
  // changes for a given page view, so if this only depended on slug and the
  // first invocation ran before `article` loaded, this lookup would be silently
  // skipped forever. Does NOT create a new session — that only happens lazily,
  // the moment the user actually sends their first message (see ensureSession,
  // passed to ChatBox). ChatBox already loads message history whenever
  // sessionId is set, so reload/revisit correctly resumes an existing session.
  useEffect(() => {
    if (!article || articleSessionRef.current === slug) return
    articleSessionRef.current = slug
    setSessionLoading(true)

    const sessionTitle = `${article.chapter_title} – Chronicle Session`

    chatService.getSessions()
      .then((sessions) => {
        const existing = sessions?.find((s) => s.title === sessionTitle)
        const existingId = existing && (existing.id ?? existing.sessionId ?? existing.session_id)
        if (existingId) setSessionId(existingId)
      })
      .catch((err) => {
        console.error('Failed to check for existing article chat session:', err)
      })
      .finally(() => setSessionLoading(false))
  }, [article, slug])

  // Lazily creates (or reuses) a session the first time the user sends a message.
  // De-dupes concurrent calls (e.g. rapid double-submit) via creatingSessionRef,
  // mirroring the mount-time reuse-by-title pattern above.
  const ensureSession = async () => {
    if (sessionId) return sessionId
    if (creatingSessionRef.current) return creatingSessionRef.current

    const sessionTitle = `${article.chapter_title} – Chronicle Session`
    const promise = chatService.createSession(sessionTitle)
      .then((session) => {
        const id = session.id ?? session.sessionId ?? session.session_id
        setSessionId(id)
        return id
      })
      .finally(() => {
        creatingSessionRef.current = null
      })

    creatingSessionRef.current = promise
    return promise
  }

  const { prevArticle, nextArticle } = useMemo(() => {
    if (!eraArticles || !article) return { prevArticle: null, nextArticle: null }
    const index = eraArticles.findIndex((a) => a.slug === article.slug)
    if (index === -1) return { prevArticle: null, nextArticle: null }
    return {
      prevArticle: eraArticles[index - 1] ?? null,
      nextArticle: eraArticles[index + 1] ?? null,
    }
  }, [eraArticles, article])

  const sections = useMemo(() => {
    if (!article?.sections?.length) return []
    return article.sections.map((s) => ({ id: `section-${s.section_num}`, title: s.section_title }))
  }, [article])

  // Tracks which section heading is currently in view, shared by both TableOfContents
  // instances below so only one IntersectionObserver is registered for the page.
  const [activeSectionId, setActiveSectionId] = useState(null)
  useEffect(() => {
    const elements = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSectionId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const chatSuggestions = useMemo(() => {
    if (!article) return []
    return [
      `Tóm tắt bài viết "${article.chapter_title}"`,
      'Các sự kiện quan trọng trong giai đoạn này',
      'Nhân vật lịch sử nổi bật được nhắc đến',
      'Ý nghĩa lịch sử của thời kỳ này',
    ]
  }, [article])

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-gray-400">Không thể tải bài viết.</p>
          <button onClick={() => navigate('/articles')} className="text-sm text-primary hover:underline">
            ← Bài viết
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <button
          onClick={() => navigate('/articles')}
          className="text-sm text-gray-400 hover:text-primary transition-colors mb-6"
        >
          ← Bài viết
        </button>

        {isLoading || !article ? (
          <ArticleDetailSkeleton />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start relative">
            <div className="min-w-0">
              {/* Header */}
              <div className="mb-8">
                <span className="text-xs text-primary uppercase tracking-wider">
                  {ERA_DISPLAY[article.era_slug] ?? article.era}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mt-2 mb-4 leading-tight">
                  {article.chapter_title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                  <span>{article.estimated_read_minutes} phút đọc</span>
                  <span>·</span>
                  <span>{article.word_count?.toLocaleString()} từ</span>
                  {article.source && (
                    <>
                      <span>·</span>
                      <span>{article.source}</span>
                    </>
                  )}
                </div>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-surface2 text-gray-400 rounded-full px-2.5 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile TOC (collapsible, above content) */}
              {sections.length > 2 && (
                <div className="lg:hidden">
                  <TableOfContents sections={sections} variant="accordion" activeSectionId={activeSectionId} />
                </div>
              )}

              {/* Content */}
              <div className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {article.sections?.length > 0 ? (
                  article.sections.map((s) => (
                    <div key={s.section_num} id={`section-${s.section_num}`} className="scroll-mt-24">
                      <h2 className="text-lg font-semibold text-gray-100 mt-8 mb-3 border-l-2 border-primary pl-3">
                        {s.section_title}
                      </h2>
                      <Paragraphs text={s.content} />
                    </div>
                  ))
                ) : (
                  <Paragraphs text={article.content} />
                )}
              </div>

              {/* Prev/Next navigation */}
              {(prevArticle || nextArticle) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 pt-6 border-t border-surface2">
                  {prevArticle ? (
                    <Link
                      to={`/articles/${prevArticle.slug}`}
                      className="bg-surface border border-surface2 hover:border-primary/40 rounded-xl p-4 transition-colors"
                    >
                      <span className="text-xs text-gray-500 block mb-1">← Bài trước</span>
                      <span className="text-sm text-gray-200 font-medium block">
                        {prevArticle.chapter_title}
                      </span>
                      <span className="text-xs text-primary uppercase tracking-wider">
                        {ERA_DISPLAY[prevArticle.era_slug] ?? prevArticle.era}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextArticle ? (
                    <Link
                      to={`/articles/${nextArticle.slug}`}
                      className="bg-surface border border-surface2 hover:border-primary/40 rounded-xl p-4 transition-colors sm:text-right"
                    >
                      <span className="text-xs text-gray-500 block mb-1">Bài sau →</span>
                      <span className="text-sm text-gray-200 font-medium block">
                        {nextArticle.chapter_title}
                      </span>
                      <span className="text-xs text-primary uppercase tracking-wider">
                        {ERA_DISPLAY[nextArticle.era_slug] ?? nextArticle.era}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              )}

              {/* Mobile ChatBox */}
              <div className="lg:hidden mt-8">
                <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 rounded-full bg-primary" />
                  Hỏi Chronicle AI
                </h2>
                <div className="h-[480px]">
                  <ChatBox
                    sessionId={sessionId}
                    ensureSession={ensureSession}
                    dynastyName={article.chapter_title}
                    chatContext={articleChatContext?.context}
                    sessionLoading={sessionLoading}
                    suggestions={chatSuggestions}
                  />
                </div>
              </div>
            </div>

            {/* Desktop sidebar: TOC + ChatBox */}
            <div className="hidden lg:flex lg:flex-col lg:gap-4 sticky top-20 self-start">
              {sections.length > 2 && (
                <TableOfContents sections={sections} variant="sidebar" activeSectionId={activeSectionId} />
              )}
              <div className="h-[480px]">
                <ChatBox
                  sessionId={sessionId}
                  ensureSession={ensureSession}
                  dynastyName={article.chapter_title}
                  chatContext={articleChatContext?.context}
                  sessionLoading={sessionLoading}
                  suggestions={chatSuggestions}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

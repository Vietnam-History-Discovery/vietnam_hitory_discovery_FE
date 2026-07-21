import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import TableOfContents from '../components/articles/TableOfContents'
import { ArticleDetailSkeleton } from '../components/articles/ArticleSkeleton'
import { getArticle, getArticlesByEra } from '../services/articleService'
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
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start relative">
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
                  <TableOfContents sections={sections} variant="accordion" />
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
            </div>

            {/* Desktop TOC sidebar */}
            {sections.length > 2 && (
              <div className="hidden lg:block sticky top-20 self-start">
                <TableOfContents sections={sections} variant="sidebar" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

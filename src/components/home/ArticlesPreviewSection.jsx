import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllArticles } from '../../services/articleService'
import ArticleCard from '../articles/ArticleCard'
import useInView from '../../hooks/useInView'

const PREVIEW_COUNT = 4

function pickRandom(articles, count) {
  const shuffled = [...articles].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function SkeletonCard() {
  return (
    <div className="h-40 bg-surface border border-surface2 rounded-xl p-5 animate-pulse flex flex-col gap-2">
      <div className="h-3 bg-surface2 rounded w-1/4" />
      <div className="h-5 bg-surface2 rounded w-3/4 mt-1" />
      <div className="h-3 bg-surface2 rounded w-1/2 mt-auto" />
    </div>
  )
}

export default function ArticlesPreviewSection() {
  const navigate = useNavigate()
  const { ref, isInView } = useInView()
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles-all-summary'],
    queryFn: getAllArticles,
    staleTime: Infinity,
  })

  // Re-picked only when the underlying article list identity changes (i.e. once
  // per page load from cache), not on every render.
  const featured = useMemo(() => (articles ? pickRandom(articles, PREVIEW_COUNT) : []), [articles])

  return (
    <section ref={ref} className="px-4 py-20 lg:py-28 bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className={`flex items-end justify-between mb-10 ${isInView ? 'animate-section-reveal' : 'opacity-0'}`}>
          <div>
            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4">
              Đọc sâu hơn
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-3">
              Bài Viết Chuyên Sâu
            </h2>
            <p className="text-ink-muted text-sm sm:text-base leading-relaxed max-w-md">
              Kho bài viết được biên soạn từ Đại Việt Sử Ký Toàn Thư và Việt Nam Sử Lược, đi sâu
              vào từng giai đoạn lịch sử.
            </p>
          </div>
          <button
            onClick={() => navigate('/articles')}
            className="hidden sm:block text-sm text-primary hover:text-primary-bright font-semibold transition-colors shrink-0"
          >
            Xem tất cả bài viết →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((article, i) => (
                <div
                  key={article.slug}
                  style={isInView ? { animationDelay: `${i * 70}ms` } : undefined}
                  className={`transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_0_24px_-8px_var(--color-primary)] rounded-xl ${
                    isInView ? 'animate-section-reveal' : 'opacity-0'
                  }`}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
        </div>

        <button
          onClick={() => navigate('/articles')}
          className="sm:hidden mt-6 text-sm text-primary hover:text-primary-bright font-semibold transition-colors"
        >
          Xem tất cả bài viết →
        </button>
      </div>
    </section>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { getAllArticles } from '../../services/articleService'
import { filterArticlesForDynasty } from '../../utils/dynastyArticleMatcher'
import SectionHeader from './SectionHeader'

const ERA_DISPLAY = {
  'mo-dau': 'Mở Đầu',
  'thuong-co': 'Thượng Cổ',
  'bac-thuoc': 'Bắc Thuộc',
  'tu-chu': 'Tự Chủ',
  'tu-chu-nam-bac': 'Nam Bắc Phân Tranh',
  'can-kim': 'Cận Kim',
}

function ArticleLinkCard({ article, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-surface border border-gold-border hover:border-primary/60 hover:bg-surface2/60 rounded-[3px] p-[14px_18px] transition-all duration-150 flex items-start gap-3"
    >
      <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-primary uppercase tracking-wider font-semibold">
            {ERA_DISPLAY[article.era_slug] ?? article.era}
          </span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-600 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {article.estimated_read_minutes} phút đọc
          </span>
        </div>
        <h4 className="text-[13.5px] font-semibold text-ink group-hover:text-primary transition-colors leading-snug">
          {article.chapter_title}
        </h4>
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-gray-500 bg-surface2 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary shrink-0 mt-1 transition-colors" />
    </button>
  )
}

export default function RelatedArticles({ dynastyName, dynastyStartYear }) {
  const navigate = useNavigate()

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles-all-summary'],
    queryFn: getAllArticles,
    staleTime: Infinity,
  })

  const related = filterArticlesForDynasty(articles, dynastyName, dynastyStartYear)

  if (isLoading) {
    return (
      <section className="space-y-4">
        <SectionHeader>Bài viết liên quan</SectionHeader>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-surface border border-gold-border rounded-[3px] animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (!related.length) return null

  return (
    <section className="space-y-4">
      <SectionHeader>Bài viết liên quan</SectionHeader>
      <div className="space-y-2">
        {related.map((article) => (
          <ArticleLinkCard
            key={article.slug}
            article={article}
            onClick={() => navigate(`/articles/${article.slug}`)}
          />
        ))}
      </div>
      <button
        onClick={() => navigate('/articles')}
        className="text-[12.5px] text-primary hover:text-primary-bright font-semibold transition-colors"
      >
        Xem tất cả bài viết →
      </button>
    </section>
  )
}

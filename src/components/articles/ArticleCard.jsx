import { useNavigate } from 'react-router-dom'
import { eraLabel } from '../../constants/articles'

export default function ArticleCard({ article }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/articles/${article.slug}`)}
      className="group text-left flex flex-col gap-2 w-full h-full bg-surface border border-l-2 border-surface2 border-l-primary/0 rounded-xl p-5 transition-colors hover:border-primary/40 hover:border-l-primary/60"
    >
      <span className="text-xs text-primary uppercase tracking-wider">
        {eraLabel(article.era_slug, article.era)}
      </span>

      <h3 className="text-gray-100 font-semibold text-base leading-snug">
        {article.chapter_title}
      </h3>

      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {article.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-surface2 text-gray-400 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-gray-500">
        <span>{article.estimated_read_minutes} phút đọc</span>
        <span>·</span>
        <span>{article.word_count?.toLocaleString()} từ</span>
      </div>
    </button>
  )
}

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/layout/Navbar'
import ArticleCard from '../components/articles/ArticleCard'
import { ArticleGridSkeleton } from '../components/articles/ArticleSkeleton'
import { getArticles, getEras } from '../services/articleService'
import { ERA_DISPLAY, ERA_TAB_ORDER } from '../constants/articles'

const PAGE_SIZE = 12

function EraTab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-2 text-sm rounded-full px-4 py-1.5 border transition-colors ${
        active
          ? 'bg-primary/20 border-primary text-primary'
          : 'bg-surface2 border-surface2 text-gray-400 hover:text-primary'
      }`}
    >
      {label}
      {count != null && <span className="text-xs opacity-70">{count}</span>}
    </button>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pageNumbers = [...new Set([0, totalPages - 1, page - 1, page, page + 1])]
    .filter((n) => n >= 0 && n < totalPages)
    .sort((a, b) => a - b)

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="text-sm text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 transition-colors"
      >
        ← Trước
      </button>

      {pageNumbers.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && pageNumbers[i - 1] !== n - 1 && <span className="text-gray-600 px-1">…</span>}
          <button
            onClick={() => onChange(n)}
            className={`text-sm w-8 h-8 rounded transition-colors ${
              n === page
                ? 'bg-primary/20 border border-primary text-primary'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            {n + 1}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="text-sm text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 transition-colors"
      >
        Sau →
      </button>
    </div>
  )
}

export default function ArticlesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [era, setEra] = useState(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSearchChange = (value) => {
    setSearchInput(value)
    if (value.trim()) setEra(null)
  }

  const handleEraSelect = (slug) => {
    setEra(slug)
    setSearchInput('')
    setDebouncedQuery('')
    setPage(0)
  }

  const { data: eras } = useQuery({
    queryKey: ['article-eras'],
    queryFn: getEras,
    staleTime: Infinity,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', { page, era, q: debouncedQuery || null }],
    queryFn: () => getArticles({ page, size: PAGE_SIZE, era, q: debouncedQuery || null }),
  })

  const articles = data?.articles ?? []
  const totalPages = data?.totalPages ?? 0

  // Build era tabs from the fixed ERA_TAB_ORDER, not the API array order — the backend
  // sorts an unmapped era slug last (see constants/articles.js), so its response order
  // can't be trusted for chronological tab placement.
  const countBySlug = new Map(eras?.map((e) => [e.era_slug, e.count]))
  const eraTabs = ERA_TAB_ORDER
    .filter((slug) => countBySlug.has(slug))
    .map((slug) => ({ slug, count: countBySlug.get(slug) }))
  const totalCount = eras?.reduce((sum, e) => sum + e.count, 0) ?? null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="px-4 pt-16 pb-10 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-medium tracking-widest text-primary uppercase">
            Việt Nam Sử Lược
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mt-3 mb-3 leading-tight">
            Lịch Sử Việt Nam
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mb-8">
            Khám phá lịch sử Việt Nam qua Việt Nam Sử Lược của Trần Trọng Kim
          </p>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết…"
            className="w-full bg-surface border border-surface2 rounded-xl px-5 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 flex-1">
        {/* Era filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <EraTab label="Tất cả" count={totalCount} active={era === null} onClick={() => handleEraSelect(null)} />
          {eraTabs.map(({ slug, count }) => (
            <EraTab
              key={slug}
              label={ERA_DISPLAY[slug] ?? slug}
              count={count}
              active={era === slug}
              onClick={() => handleEraSelect(slug)}
            />
          ))}
        </div>

        {/* Articles grid */}
        {isLoading ? (
          <ArticleGridSkeleton />
        ) : isError ? (
          <p className="text-sm text-gray-500 py-16 text-center">
            Không thể tải bài viết. Vui lòng thử lại.
          </p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500 py-16 text-center">Không tìm thấy kết quả</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}

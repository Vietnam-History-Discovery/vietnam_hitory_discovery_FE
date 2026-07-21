import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { getArticles, deleteArticle } from '../../services/articleService'
import { eraLabel, ERA_TAB_ORDER, ERA_DISPLAY } from '../../constants/articles'
import ConfirmDialog from '../ui/ConfirmDialog'

const PAGE_SIZE = 10

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pageNumbers = [...new Set([0, totalPages - 1, page - 1, page, page + 1])]
    .filter((n) => n >= 0 && n < totalPages)
    .sort((a, b) => a - b)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
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

function SortIcon({ direction }) {
  if (direction === 'asc') return <ChevronUp className="w-3 h-3" />
  if (direction === 'desc') return <ChevronDown className="w-3 h-3" />
  return <ChevronsUpDown className="w-3 h-3 opacity-40" />
}

const columnHelper = createColumnHelper()

export default function ArticleManagementTab() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [articleToDelete, setArticleToDelete] = useState(null)
  const [sorting, setSorting] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [era, setEra] = useState(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleEraChange = (value) => {
    setEra(value || null)
    setPage(0)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-articles', page, era, debouncedQuery || null],
    queryFn: () => getArticles({ page, size: PAGE_SIZE, era, q: debouncedQuery || null }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-eras'] })
      setArticleToDelete(null)
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor((a) => eraLabel(a.era_slug, a.era), {
        id: 'era',
        header: 'Thời kỳ',
        cell: (info) => (
          <span className="text-xs text-primary uppercase tracking-wider">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('chapter_title', {
        header: 'Tiêu đề',
        cell: (info) => (
          <div className="min-w-0">
            <p className="text-sm text-gray-100 truncate">{info.getValue()}</p>
            <p className="text-xs text-gray-500 truncate">{info.row.original.slug}</p>
          </div>
        ),
      }),
      columnHelper.accessor('word_count', {
        header: 'Số từ',
        cell: (info) => (
          <span className="text-sm text-gray-400">{info.getValue()?.toLocaleString()}</span>
        ),
      }),
      columnHelper.accessor('estimated_read_minutes', {
        header: 'Thời gian đọc',
        cell: (info) => <span className="text-sm text-gray-400">{info.getValue()} phút</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const article = info.row.original
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === article.slug
          return (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => navigate(`/admin/articles/${article.slug}/edit`)}
                title="Sửa bài viết"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg text-gray-600 hover:bg-primary/20 hover:text-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setArticleToDelete(article)}
                disabled={isDeleting}
                title="Xóa bài viết"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg text-gray-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        },
      }),
    ],
    [deleteMutation.isPending, deleteMutation.variables, navigate]
  )

  const articles = data?.articles ?? []
  const totalPages = data?.totalPages ?? 0

  const table = useReactTable({
    data: articles,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm bài viết…"
              className="w-full bg-surface2 border border-gray-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <select
            value={era ?? ''}
            onChange={(e) => handleEraChange(e.target.value)}
            className="bg-surface2 border border-gray-700 rounded-lg px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors sm:w-48"
          >
            <option value="">Tất cả thời kỳ</option>
            {ERA_TAB_ORDER.map((slug) => (
              <option key={slug} value={slug}>
                {ERA_DISPLAY[slug]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => navigate('/admin/articles/new')}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-gray-900 font-semibold rounded-lg px-4 py-2 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Bài viết mới
        </button>
      </div>

      <div className="bg-surface border border-surface2 rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-gray-500 py-16 text-center">Đang tải…</p>
        ) : isError ? (
          <p className="text-sm text-gray-500 py-16 text-center">
            Không thể tải danh sách bài viết.
          </p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500 py-16 text-center">
            {debouncedQuery || era ? 'Không tìm thấy bài viết phù hợp' : 'Không có bài viết nào'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-surface2">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium"
                      >
                        {header.column.getCanSort() ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon direction={header.column.getIsSorted()} />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-surface2">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group hover:bg-surface2/60 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-1.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <ConfirmDialog
        open={!!articleToDelete}
        title="Xóa bài viết?"
        description={`Xóa "${articleToDelete?.chapter_title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(articleToDelete.slug)}
        onCancel={() => setArticleToDelete(null)}
      />
    </div>
  )
}

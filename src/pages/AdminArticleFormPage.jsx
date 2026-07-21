import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getArticle } from '../services/articleService'
import ArticleForm from '../components/admin/ArticleForm'
import useArticleSave from '../hooks/useArticleSave'

export default function AdminArticleFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = !!slug

  const { data: article, isLoading } = useQuery({
    queryKey: ['admin-article-detail', slug],
    queryFn: () => getArticle(slug),
    enabled: isEdit,
  })

  const goToList = () => navigate('/admin/articles')

  const { save, isEdit: isEditing, isSaving, error, successMessage } = useArticleSave(article, {
    onCreated: goToList,
  })

  return (
    <div>
      <button
        onClick={goToList}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách bài viết
      </button>

      {isEdit && (isLoading || !article) ? (
        <p className="text-sm text-gray-500 py-16 text-center">Đang tải…</p>
      ) : (
        <ArticleForm
          article={isEdit ? article : null}
          isEdit={isEditing}
          isSaving={isSaving}
          error={error}
          successMessage={successMessage}
          onSubmit={save}
          onCancel={goToList}
        />
      )}
    </div>
  )
}

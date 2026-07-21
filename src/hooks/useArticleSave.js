import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createArticle, updateArticle } from '../services/articleService'

// Owns the actual save API call (create vs update, cache invalidation, success/error
// state) for an article, decoupled from any particular form UI so it can be reused by
// other consumers later without dragging form-field concerns along with it.
export default function useArticleSave(initialArticle, { onCreated } = {}) {
  const [savedArticle, setSavedArticle] = useState(initialArticle ?? null)
  const [successMessage, setSuccessMessage] = useState('')
  const queryClient = useQueryClient()

  // Hydrate once the initial article finishes loading (edit mode fetches it async) —
  // adjusted during render rather than an effect, per React's guidance for syncing state
  // from a changing prop. Guarded so this never clobbers the article a successful save
  // just set locally.
  const [lastSeenArticle, setLastSeenArticle] = useState(initialArticle)
  if (initialArticle !== lastSeenArticle) {
    setLastSeenArticle(initialArticle)
    if (initialArticle && !savedArticle) {
      setSavedArticle(initialArticle)
    }
  }

  const isEdit = !!savedArticle

  const mutation = useMutation({
    mutationFn: (dto) => (isEdit ? updateArticle(savedArticle.slug, dto) : createArticle(dto)),
    onSuccess: (data) => {
      const wasCreate = !isEdit
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-eras'] })
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      // The edit form and the public article page each cache this article under their
      // own key — both need invalidating or they keep showing the pre-save version.
      queryClient.invalidateQueries({ queryKey: ['admin-article-detail'] })
      queryClient.invalidateQueries({ queryKey: ['article'] })
      setSavedArticle(data)
      setSuccessMessage(wasCreate ? 'Đã tạo bài viết mới.' : 'Đã lưu thay đổi bài viết.')
      if (wasCreate) {
        onCreated?.(data)
      }
    },
  })

  const save = useCallback(
    (dto) => {
      setSuccessMessage('')
      mutation.mutate(dto)
    },
    [mutation]
  )

  return {
    save,
    isEdit,
    isSaving: mutation.isPending,
    error: mutation.isError
      ? mutation.error?.response?.data?.error || 'Đã xảy ra lỗi. Vui lòng thử lại.'
      : '',
    successMessage,
  }
}

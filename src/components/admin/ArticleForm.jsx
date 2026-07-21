import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { ERA_TAB_ORDER, ERA_DISPLAY } from '../../constants/articles'

const inputClass =
  'w-full bg-surface2 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm'
const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

function emptySection() {
  return { section_num: 1, section_title: '', content: '' }
}

function toFormState(article) {
  if (!article) {
    return {
      article_id: '',
      source: '',
      era_slug: ERA_TAB_ORDER[0],
      chapter_num: 1,
      chapter_title: '',
      slug: '',
      content: '',
      sections: [],
      tags: '',
    }
  }
  return {
    article_id: article.article_id || '',
    source: article.source || '',
    era_slug: article.era_slug || ERA_TAB_ORDER[0],
    chapter_num: article.chapter_num ?? 1,
    chapter_title: article.chapter_title || '',
    slug: article.slug || '',
    content: article.content || '',
    sections: article.sections?.length
      ? article.sections.map((s) => ({
          section_num: s.section_num,
          section_title: s.section_title || '',
          content: s.content || '',
        }))
      : [],
    tags: (article.tags || []).join(', '),
  }
}

function computeReadingStats(content) {
  const words = content.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const estimatedReadMinutes = wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / 200))
  return { wordCount, estimatedReadMinutes }
}

// Pure form UI — knows nothing about the network. Serializes its fields into the
// ArticleDetailDto shape and hands it to `onSubmit`; the caller owns the actual save
// (see `useArticleSave`) and feeds back `isEdit`/`isSaving`/`error`/`successMessage`.
export default function ArticleForm({ article, isEdit, isSaving, error, successMessage, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toFormState(article))

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const updateSection = (index, field, value) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }))
  }

  const addSection = () => {
    setForm((f) => ({
      ...f,
      sections: [...f.sections, { ...emptySection(), section_num: f.sections.length + 1 }],
    }))
  }

  const removeSection = (index) => {
    setForm((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const { wordCount, estimatedReadMinutes } = computeReadingStats(form.content)
    const dto = {
      article_id: form.article_id.trim(),
      source: form.source.trim(),
      era: ERA_DISPLAY[form.era_slug] ?? form.era_slug,
      era_slug: form.era_slug,
      chapter_num: Number(form.chapter_num) || 0,
      chapter_title: form.chapter_title.trim(),
      slug: form.slug.trim(),
      content: form.content,
      sections: form.sections.map((s, i) => ({
        section_num: Number(s.section_num) || i + 1,
        section_title: s.section_title.trim(),
        content: s.content,
      })),
      word_count: wordCount,
      estimated_read_minutes: estimatedReadMinutes,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    onSubmit(dto)
  }

  const { wordCount, estimatedReadMinutes } = computeReadingStats(form.content)

  return (
    <div className="bg-surface rounded-2xl border border-surface2 p-8 shadow-2xl">
      <h2 className="text-lg font-semibold text-gray-100 mb-6">
        {isEdit ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Article ID</label>
            <input
              type="text"
              value={form.article_id}
              onChange={(e) => updateField('article_id', e.target.value)}
              required
              disabled={isEdit}
              className={`${inputClass} disabled:opacity-50`}
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              required
              disabled={isEdit}
              className={`${inputClass} disabled:opacity-50`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nguồn (source)</label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => updateField('source', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Thời kỳ (era)</label>
            <select
              value={form.era_slug}
              onChange={(e) => updateField('era_slug', e.target.value)}
              className={inputClass}
            >
              {ERA_TAB_ORDER.map((slug) => (
                <option key={slug} value={slug}>
                  {ERA_DISPLAY[slug]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Số chương</label>
            <input
              type="number"
              value={form.chapter_num}
              onChange={(e) => updateField('chapter_num', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tiêu đề chương</label>
            <input
              type="text"
              value={form.chapter_title}
              onChange={(e) => updateField('chapter_title', e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Nội dung</label>
          <textarea
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={8}
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            {wordCount.toLocaleString()} từ · {estimatedReadMinutes} phút đọc (tự động tính)
          </p>
        </div>

        <div>
          <label className={labelClass}>Tags (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            placeholder="vd: Hùng Vương, dựng nước"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass.replace('mb-1.5', 'mb-0')}>Các mục (sections)</label>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm mục
            </button>
          </div>

          <div className="space-y-3">
            {form.sections.map((section, index) => (
              <div key={index} className="bg-surface2 border border-surface2 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Mục {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    title="Xóa mục"
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-3 mb-3">
                  <input
                    type="number"
                    value={section.section_num}
                    onChange={(e) => updateSection(index, 'section_num', e.target.value)}
                    placeholder="Số"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={section.section_title}
                    onChange={(e) => updateSection(index, 'section_title', e.target.value)}
                    placeholder="Tiêu đề mục"
                    className={inputClass}
                  />
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                  placeholder="Nội dung mục"
                  rows={3}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-950/50 border border-green-800 text-green-400 rounded-lg px-4 py-3 text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg px-5 py-2.5 transition-all text-sm"
          >
            {isSaving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-400 hover:text-primary transition-colors px-5 py-2.5"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

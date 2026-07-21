import api from './api'

const articleService = {
  getArticles: async ({ page = 0, size = 10, era = null, q = null } = {}) => {
    const params = { page, size }
    if (era) params.era = era
    if (q) params.q = q
    const res = await api.get('/api/articles', { params })
    return res.data
  },

  // Get article detail by slug
  getArticle: async (slug) => {
    const res = await api.get(`/api/articles/${slug}`)
    return res.data
  },

  // List articles by era
  getArticlesByEra: async (eraSlug) => {
    const res = await api.get(`/api/articles/era/${eraSlug}`)
    return res.data
  },

  getEras: async () => {
    const res = await api.get('/api/articles/eras')
    return res.data
  },

  createArticle: async (dto) => {
    const res = await api.post('/api/articles', dto)
    return res.data
  },

  updateArticle: async (slug, dto) => {
    const res = await api.put(`/api/articles/${slug}`, dto)
    return res.data
  },

  deleteArticle: async (slug) => {
    await api.delete(`/api/articles/${slug}`)
  },
}

export default articleService
export const {
  getArticles,
  getArticle,
  getArticlesByEra,
  getEras,
  createArticle,
  updateArticle,
  deleteArticle,
} = articleService

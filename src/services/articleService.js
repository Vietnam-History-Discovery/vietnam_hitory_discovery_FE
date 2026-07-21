import api from './api'

const articleService = {
  // List with pagination + optional filter
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

  // List all eras with counts
  getEras: async () => {
    const res = await api.get('/api/articles/eras')
    return res.data
  },
}

export default articleService
export const { getArticles, getArticle, getArticlesByEra, getEras } = articleService

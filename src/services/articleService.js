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

  // Rich, article-specific context string for the chat AI (mirrors dynastyService.getDynastyChatContext)
  getArticleChatContext: async (slug) => {
    const res = await api.get(`/api/articles/${slug}/chat-context`)
    return res.data
  },

  // GET /api/articles caps `size` at 20 server-side, so it can't return the
  // whole catalog in one call. listByEra() has no such cap, so fetch eras
  // first and pull every article per era in parallel.
  getAllArticles: async () => {
    const eras = await articleService.getEras()
    const perEra = await Promise.all(
      eras.map((era) => articleService.getArticlesByEra(era.era_slug))
    )
    return perEra.flat()
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
  getAllArticles,
  getArticleChatContext,
  createArticle,
  updateArticle,
  deleteArticle,
} = articleService

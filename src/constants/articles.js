// era_slug 'nam-bac' is the real value in the seed data (data/articles/vnsl_articles.json).
// The backend's own ArticleService.ERA_ORDER hardcodes 'tu-chu-nam-bac' instead, which is a
// bug that makes that era sort last from getEras()/getArticles() — kept as a defensive alias
// below in case the backend data is ever corrected, but don't rely on API ordering for tabs.
export const ERA_DISPLAY = {
  'mo-dau': 'Mở Đầu',
  'thuong-co': 'Thượng Cổ',
  'bac-thuoc': 'Bắc Thuộc',
  'tu-chu': 'Tự Chủ',
  'nam-bac': 'Nam Bắc Phân Tranh',
  'tu-chu-nam-bac': 'Nam Bắc Phân Tranh',
  'can-kim': 'Cận Kim',
}

// Fixed chronological order for era tabs — do not derive from the API response order.
export const ERA_TAB_ORDER = ['mo-dau', 'thuong-co', 'bac-thuoc', 'tu-chu', 'nam-bac', 'can-kim']

export function eraLabel(eraSlug, fallback) {
  return ERA_DISPLAY[eraSlug] ?? fallback ?? eraSlug
}

// Era year ranges for the fallback pass — mirrors ArticleService.ERA_ORDER on the
// backend (services/article-service), minus "mo-dau" (front-matter, no year range).
const ERA_YEAR_RANGES = [
  { slug: 'thuong-co', start: -2879, end: -207 }, // Thượng Cổ
  { slug: 'bac-thuoc', start: -207, end: 938 }, // Bắc Thuộc
  { slug: 'tu-chu', start: 938, end: 1527 }, // Tự Chủ
  { slug: 'tu-chu-nam-bac', start: 1527, end: 1802 }, // Nam Bắc Phân Tranh
  { slug: 'can-kim', start: 1802, end: 1945 }, // Cận Kim
]

// Exposed for reuse by other year → era_slug matchers (e.g. dynastyArticleMatcher).
export function eraSlugForYear(year) {
  if (year == null) return null
  const era = ERA_YEAR_RANGES.find((e) => year >= e.start && year < e.end)
  return era?.slug ?? null
}

/**
 * Find the best matching article for a timeline event.
 * Strategy:
 *   1. Title keyword match against chapter_title (highest priority)
 *   2. Entity match against tags
 *   3. Era fallback by year range
 * Returns { slug, confidence: 'high'|'medium'|'low' } or null
 */
export function findMatchingArticle(event, articles) {
  if (!articles?.length || !event) return null

  const eventTitle = (event.title || '').toLowerCase()
  const eventEntities = (event.related_entities || []).map((e) => e.toLowerCase())
  const eventYear = event.start_year

  // Pass 1: chapter_title keyword match
  for (const article of articles) {
    const chapterTitle = (article.chapter_title || '').toLowerCase()
    if (!chapterTitle) continue
    const eventWords = eventTitle.split(/\s+/).filter((w) => w.length > 3)
    const chapterWords = chapterTitle.split(/\s+/).filter((w) => w.length > 3)
    const hasMatch =
      eventWords.some((w) => chapterTitle.includes(w)) ||
      chapterWords.some((w) => eventTitle.includes(w))
    if (hasMatch) return { slug: article.slug, confidence: 'high' }
  }

  // Pass 2: entity match against tags
  for (const article of articles) {
    const tags = (article.tags || []).map((t) => t.toLowerCase())
    if (!tags.length) continue
    const hasEntityMatch = eventEntities.some((entity) =>
      tags.some((tag) => tag.includes(entity) || entity.includes(tag))
    )
    if (hasEntityMatch) return { slug: article.slug, confidence: 'medium' }
  }

  // Pass 3: era fallback by year
  const eraSlug = eraSlugForYear(eventYear)
  if (eraSlug) {
    const eraArticle = articles.find((a) => a.era_slug === eraSlug)
    if (eraArticle) return { slug: eraArticle.slug, confidence: 'low' }
  }

  return null
}

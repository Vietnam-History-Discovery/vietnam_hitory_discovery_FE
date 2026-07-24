import { eraSlugForYear } from './articleMatcher'

const MAX_RESULTS = 5

/**
 * Find articles relevant to a dynasty.
 * Strategy:
 *   1. chapter_title contains the dynasty name (or a keyword from it)
 *   2. Era fallback by dynasty start_year (dynasty.era from Neo4j is a coarse
 *      "Huyền sử / Bắc thuộc / Độc lập" split that doesn't map to the 5
 *      article eras, so year range is the reliable signal here — see
 *      src/graph/seed_dynasties.py)
 * Returns up to 5 ArticleSummaryDto, or [] if nothing matches.
 */
export function filterArticlesForDynasty(articles, dynastyName, dynastyStartYear) {
  if (!articles?.length) return []

  const nameLower = (dynastyName || '')
    .toLowerCase()
    .replace(/^nhà\s+/i, '') // strip "nhà" prefix: "nhà Trần" → "trần"
    .replace(/^thời\s+/i, '') // strip "thời" prefix

  // Pass 1: chapter_title contains dynasty name keywords
  if (nameLower) {
    const nameMatches = articles.filter((a) => {
      const title = (a.chapter_title || '').toLowerCase()
      if (!title) return false
      return (
        title.includes(nameLower) ||
        nameLower.split(/\s+/).some((w) => w.length > 2 && title.includes(w))
      )
    })
    if (nameMatches.length > 0) return nameMatches.slice(0, MAX_RESULTS)
  }

  // Pass 2: era fallback by year
  const eraSlug = eraSlugForYear(dynastyStartYear)
  if (eraSlug) {
    const eraMatches = articles.filter((a) => a.era_slug === eraSlug)
    if (eraMatches.length > 0) return eraMatches.slice(0, MAX_RESULTS)
  }

  return []
}

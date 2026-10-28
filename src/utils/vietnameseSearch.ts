// Fast memoization cache for short strings (queries, labels, codes)
const toneCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1200;

/**
 * Strips Vietnamese diacritics and tones efficiently.
 * Uses character classes and an LRU-like memory cache for high-frequency queries.
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  const trimmed = str.toString().trim();
  if (trimmed.length < 60) {
    const cached = toneCache.get(trimmed);
    if (cached !== undefined) return cached;
  }

  let result = trimmed.toLowerCase();
  // Using character sets is up to 10x faster than piped alternation in V8
  result = result.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  result = result.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  result = result.replace(/[ìíịỉĩ]/g, 'i');
  result = result.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  result = result.replace(/[ùúụủũưừứựửữ]/g, 'u');
  result = result.replace(/[ỳýỵỷỹ]/g, 'y');
  result = result.replace(/đ/g, 'd');
  // Unicode combining diacritics
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalized = result.trim();

  if (trimmed.length < 60) {
    if (toneCache.size >= MAX_CACHE_SIZE) {
      // Clear half the cache to prevent unbounded growth
      const keys = Array.from(toneCache.keys()).slice(0, 400);
      keys.forEach((k) => toneCache.delete(k));
    }
    toneCache.set(trimmed, normalized);
  }

  return normalized;
}

/**
 * Pre-computes a consolidated search index from multiple fields
 */
export function prepareSearchIndex(fields: (string | number | undefined | null)[]): string {
  const combined = fields
    .filter((f) => f !== undefined && f !== null && f !== '')
    .map((f) => String(f))
    .join(' ');
  return removeVietnameseTones(combined);
}

/**
 * Lightning-fast query matching using a pre-computed search index.
 * Normalizes query only ONCE per search call instead of repeating for every row.
 */
export function matchesQueryIndexed(searchIndex: string | undefined, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!searchIndex) return false;

  const cleanQuery = removeVietnameseTones(query.trim());
  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  if (searchTerms.length === 0) return true;

  // All terms must appear in the pre-indexed text
  for (let i = 0; i < searchTerms.length; i++) {
    if (!searchIndex.includes(searchTerms[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if any of the provided fields match the search query (fallback compatibility)
 */
export function matchesQuery(
  fields: (string | number | undefined | null)[],
  query: string
): boolean {
  if (!query || !query.trim()) return true;
  const index = prepareSearchIndex(fields);
  return matchesQueryIndexed(index, query);
}

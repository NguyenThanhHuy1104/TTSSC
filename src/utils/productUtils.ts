/**
 * Utility functions for parsing product codes, extracting embedded links,
 * and handling Google Sheets hyperlinks.
 */

export interface ParsedProductCode {
  code: string;
  linkUrl: string | null;
}

/**
 * Extracts clean product code and any attached hyperlink.
 * Handles:
 * - Google Sheets cell properties (cellObj.p.hyperlink / link / url)
 * - =HYPERLINK("https://...", "00015165") formula strings
 * - Markdown links [00015165](https://...)
 * - URLs embedded directly in text (e.g. "00015165 https://nhathuoclongchau.com.vn/...")
 * - Pure URLs (e.g. "https://nhathuoclongchau.com.vn/.../sp-00015165.html")
 */
export function extractProductCodeAndLink(
  rawInput: any,
  rawFormatted?: any,
  cellProps?: any
): ParsedProductCode {
  // 1. Check Google Visualization cell properties (p.hyperlink, p.link, p.url)
  const propLink =
    cellProps?.hyperlink ||
    cellProps?.link ||
    cellProps?.url ||
    cellProps?.href;

  let directUrl: string | null = null;
  if (typeof propLink === 'string' && propLink.trim()) {
    directUrl = propLink.trim();
  }

  const rawStr = (rawInput ?? '').toString().trim();
  const formatStr = (rawFormatted ?? '').toString().trim();
  const combined = `${formatStr} ${rawStr}`.trim();

  // 2. Check for Google Sheets HYPERLINK formula: =HYPERLINK("url", "label")
  const formulaMatch = combined.match(/HYPERLINK\s*\(\s*["']([^"']+)["']\s*(?:,\s*["']([^"']+)["'])?\s*\)/i);
  if (formulaMatch) {
    const url = formulaMatch[1].trim();
    const label = formulaMatch[2]?.trim() || rawStr.replace(/=HYPERLINK\([^)]+\)/i, '').trim();
    return {
      code: label || url,
      linkUrl: sanitizeUrl(url)
    };
  }

  // 3. Check for Markdown link: [code](url)
  const markdownMatch = combined.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownMatch) {
    return {
      code: markdownMatch[1].trim(),
      linkUrl: sanitizeUrl(markdownMatch[2].trim())
    };
  }

  // 4. Check for URL in the text: http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+)/i;
  const urlMatch = combined.match(urlRegex);

  if (urlMatch) {
    const foundUrl = sanitizeUrl(urlMatch[1]);
    // Extract clean code by removing the URL and extra separators
    let cleanCode = rawStr
      .replace(urlMatch[0], '')
      .replace(/[()[\]\-:,]/g, ' ')
      .trim();

    // If removing the URL left no code, try extracting a product code pattern from the URL (e.g. 6-10 digits)
    if (!cleanCode || cleanCode.length === 0) {
      const codeInUrl = foundUrl?.match(/(\d{6,10})/);
      if (codeInUrl) {
        cleanCode = codeInUrl[1];
      } else {
        // Fallback to formatted string or the last URL slug
        cleanCode = formatStr && !formatStr.includes('http') ? formatStr : 'Xem link';
      }
    }

    return {
      code: cleanCode || '000000',
      linkUrl: foundUrl
    };
  }

  // 5. If directUrl was in cell properties but not in text
  if (directUrl) {
    return {
      code: rawStr || formatStr || '000000',
      linkUrl: sanitizeUrl(directUrl)
    };
  }

  // 6. No link found, return raw string
  return {
    code: rawStr || formatStr || '000000',
    linkUrl: null
  };
}

/**
 * Ensures URL starts with https:// or http://
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('www.')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it's a relative nhathuoclongchau path
  if (trimmed.startsWith('/')) {
    return `https://nhathuoclongchau.com.vn${trimmed}`;
  }
  return trimmed;
}

/**
 * Helper to test if a string looks like or contains a valid link
 */
export function hasLink(str: string | null | undefined): boolean {
  if (!str) return false;
  return /(https?:\/\/|www\.|HYPERLINK)/i.test(str);
}

/**
 * Collection browse_products_url (single text column).
 * Stored as plain text: one path per line, or a single path on one line.
 * Legacy JSON arrays ([ "...","..." ]) still parse for existing rows.
 */

function normalizeBrowsePathSegment(part) {
  const p = String(part).trim();
  if (!p) return '';
  if (
    p.startsWith('/product/') ||
    p.startsWith('/shop') ||
    /^https?:\/\//i.test(p)
  )
    return p;
  if (!p.includes('/')) return `/product/${p}`;
  return p;
}

function normalizePathList(parts) {
  const mapped = parts.map(normalizeBrowsePathSegment).filter(Boolean);
  return [...new Set(mapped)];
}

/** Split textarea / pasted text into path tokens (lines or commas / semicolons). */
export function parseBrowseProductsField(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return [];

  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        return normalizePathList(arr.map((x) => String(x).trim()).filter(Boolean));
      }
    } catch {
      /* fall through — treat as plain text */
    }
  }

  const parts = s
    .split(/[\r\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return normalizePathList(parts);
}

/** Plain multi-line text for textarea (converts legacy JSON rows on edit). */
export function browseProductsUrlToPlainText(raw) {
  const paths = parseBrowseProductsField(raw);
  if (!paths.length) return '';
  if (paths.length === 1) return paths[0];
  return paths.join('\n');
}

function slugsFromProductPaths(paths) {
  const slugs = [];
  for (const p of paths) {
    const str = String(p).trim();
    const m = str.match(/\/product\/([^/?#]+)/);
    if (m) slugs.push(decodeURIComponent(m[1]));
  }
  return [...new Set(slugs)];
}

/** Canonical plain-text storage (dedupe, normalize segments). */
export function serializeBrowseProductPaths(paths) {
  const normalized = normalizePathList(paths.map((p) => String(p).trim()).filter(Boolean));
  if (!normalized.length) return '';
  if (normalized.length === 1) return normalized[0];
  return normalized.join('\n');
}

/** Normalize whatever is in the form field before save. */
export function canonicalizeBrowseProductsInput(raw) {
  const paths = parseBrowseProductsField(raw);
  return serializeBrowseProductPaths(paths);
}

/** Target for collection tile Link: PDP, curated shop list, or first raw path. */
export function resolveCollectionBrowseHref(raw, collectionName) {
  const fallback = `/shop?cat=${encodeURIComponent(collectionName)}`;
  const paths = parseBrowseProductsField(raw);
  if (!paths.length) return fallback;
  const slugs = slugsFromProductPaths(paths);
  if (!slugs.length) return paths[0];
  if (slugs.length === 1) return `/product/${slugs[0]}`;
  return `/shop?products=${slugs.map(encodeURIComponent).join(',')}`;
}

export function formatBrowseProductsPreview(raw, maxShow = 2) {
  const paths = parseBrowseProductsField(raw);
  if (!paths.length) return '';
  if (paths.length <= maxShow) return paths.join(' · ');
  return `${paths.slice(0, maxShow).join(' · ')} · +${paths.length - maxShow} more`;
}

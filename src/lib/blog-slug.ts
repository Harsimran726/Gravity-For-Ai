export function normalizeBlogSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function blogRouteCandidates(value: string) {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* Keep malformed legacy input literal. */ }
  return Array.from(new Set([value, decoded, normalizeBlogSlug(decoded)]));
}

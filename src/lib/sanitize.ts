const MAX_SEARCH_LENGTH = 200;
const HTML_TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHAR_REGEX = /[\x00-\x1f\x7f]/g;

export function sanitizeSearchQuery(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .replace(HTML_TAG_REGEX, '')
    .replace(CONTROL_CHAR_REGEX, '')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

export function sanitizeIntParam(
  value: string | null | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return Math.floor(parsed);
}

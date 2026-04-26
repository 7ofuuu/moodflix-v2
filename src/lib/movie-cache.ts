const CACHE_KEY_PREFIX = 'moodflix:movieCache:';
const SESSION_KEY = 'moodflix:movieCacheSession';
const ANON_TTL_MS = 30 * 60 * 1000;

interface MovieCacheEntry {
  urls: string[];
  cachedAt: number;
}

function parseEntry(raw: string | null): MovieCacheEntry | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MovieCacheEntry;
  } catch {
    return null;
  }
}

export function getCachedPosters(mood: string): string[] | null {
  if (typeof globalThis.window === 'undefined') return null;
  const entry = parseEntry(globalThis.window.localStorage.getItem(`${CACHE_KEY_PREFIX}${mood}`));
  if (!entry) return null;
  const sessionExpiry = globalThis.window.localStorage.getItem(SESSION_KEY);
  if (sessionExpiry && Date.now() < Number(sessionExpiry)) return entry.urls;
  if (Date.now() < entry.cachedAt + ANON_TTL_MS) return entry.urls;
  return null;
}

export function setCachedPosters(mood: string, urls: string[]): void {
  if (typeof globalThis.window === 'undefined') return;
  const entry: MovieCacheEntry = { urls, cachedAt: Date.now() };
  globalThis.window.localStorage.setItem(`${CACHE_KEY_PREFIX}${mood}`, JSON.stringify(entry));
}

export function invalidateCache(mood: string): void {
  if (typeof globalThis.window === 'undefined') return;
  globalThis.window.localStorage.removeItem(`${CACHE_KEY_PREFIX}${mood}`);
}

export function setSessionExpiry(expiresAtEpochSeconds: number): void {
  if (typeof globalThis.window === 'undefined') return;
  globalThis.window.localStorage.setItem(SESSION_KEY, String(expiresAtEpochSeconds * 1000));
}

export function clearMoodCache(): void {
  if (typeof globalThis.window === 'undefined') return;
  const keys = Object.keys(globalThis.window.localStorage).filter(k =>
    k.startsWith(CACHE_KEY_PREFIX)
  );
  keys.forEach(k => globalThis.window.localStorage.removeItem(k));
  globalThis.window.localStorage.removeItem(SESSION_KEY);
}

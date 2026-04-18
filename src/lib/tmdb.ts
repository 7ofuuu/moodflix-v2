const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL;
const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

export function validateTmdbEnv(): { base: string; token: string } {
  if (!TMDB_BASE || !TMDB_TOKEN) {
    throw new Error('TMDB_API_BASE_URL or TMDB_API_TOKEN is not configured');
  }
  return { base: TMDB_BASE, token: TMDB_TOKEN };
}

export function getTmdbHeaders(): Record<string, string> {
  const { token } = validateTmdbEnv();
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchTmdb<T>(path: string, params?: Record<string, string>): Promise<T> {
  const { base } = validateTmdbEnv();
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  const url = `${base}${path}${query}`;

  const response = await fetch(url, {
    headers: getTmdbHeaders(),
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error(`TMDB API error ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

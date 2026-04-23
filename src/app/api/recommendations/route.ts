import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { MOOD_GENRE_MAP, VALID_ACTIONS } from '@/lib/mood';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import type { ActionType } from '@/lib/mood';
import type { MovieDetails, PaginatedResponse } from '@/types/movie';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_RECOMMENDATIONS = 5;

interface GeminiRecommendation {
  movieIds: number[];
  reasons: Array<{ id: number; reason: string }>;
}

interface CandidateMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

interface TmdbMovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genres?: Array<{ name: string }>;
}

function extractFirstJsonObject(value: string): string | null {
  const firstBrace = value.indexOf('{');
  if (firstBrace < 0) return null;

  let depth = 0;
  for (let index = firstBrace; index < value.length; index += 1) {
    if (value[index] === '{') depth += 1;
    else if (value[index] === '}') {
      depth -= 1;
      if (depth === 0) return value.slice(firstBrace, index + 1);
    }
  }
  return null;
}

async function fetchMoviesByIds(movieIds: number[]): Promise<MovieDetails[]> {
  const uniqueIds = Array.from(new Set(movieIds)).slice(0, MAX_RECOMMENDATIONS + 2);

  const moviePromises = uniqueIds.map(async id => {
    try {
      const movie = await fetchTmdb<TmdbMovieDetail>(`/movie/${id}`, { language: 'en-US' });
      return {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: null,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        genre_names: Array.isArray(movie.genres) ? movie.genres.map(g => g.name) : [],
      } as MovieDetails;
    } catch {
      return null;
    }
  });

  const movies = await Promise.all(moviePromises);
  return movies.filter((movie): movie is MovieDetails => Boolean(movie));
}

async function fetchCandidateMovies(mood: string, action: ActionType): Promise<CandidateMovie[]> {
  const sortBy = action === 'explore' ? 'vote_average.desc' : 'popularity.desc';

  const discoverRequests = [1, 2, 3].map(async page => {
    try {
      const data = await fetchTmdb<PaginatedResponse<CandidateMovie>>('/discover/movie', {
        language: 'en-US',
        include_adult: 'false',
        sort_by: sortBy,
        page: String(page),
        with_genres: MOOD_GENRE_MAP[mood].join(','),
        'vote_count.gte': '150',
        with_original_language: 'en',
      });
      return data.results ?? [];
    } catch {
      return [];
    }
  });

  const results = (await Promise.all(discoverRequests)).flat();
  const deduped = new Map<number, CandidateMovie>();
  for (const movie of results) {
    if (!deduped.has(movie.id)) deduped.set(movie.id, movie);
  }
  return Array.from(deduped.values()).slice(0, 90);
}

function serializeCandidate(movie: CandidateMovie): string {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const compactGenres = (movie.genre_ids ?? []).slice(0, 3).join(',');
  const compactTitle = movie.title.replace(/\|/g, '').slice(0, 60);
  return `${movie.id}|${compactTitle}|${year}|${movie.vote_average?.toFixed(1) ?? 'N/A'}|g:${compactGenres}`;
}

function buildFallbackReason(mood: string, action: ActionType): string {
  const actionCopy: Record<string, string> = {
    stay: 'match your current vibe',
    distract: 'help distract and reset your thoughts',
    improve: 'lift your spirit with a brighter tone',
    explore: 'push you toward a fresh movie experience',
  };
  return `Picked to ${actionCopy[action] ?? 'fit your preference'} while keeping a ${mood} mood.`;
}

async function fetchFallbackRecommendations(mood: string, action: ActionType): Promise<MovieDetails[]> {
  const withGenres = MOOD_GENRE_MAP[mood]?.join(',') ?? '';
  const sortBy = action === 'explore' ? 'vote_average.desc' : 'popularity.desc';

  const params: Record<string, string> = {
    language: 'en-US',
    page: '1',
    sort_by: sortBy,
    'vote_count.gte': '180',
  };
  if (withGenres) params.with_genres = withGenres;

  try {
    const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/discover/movie', params);
    return (data.results ?? []).slice(0, MAX_RECOMMENDATIONS).map(movie => ({
      ...movie,
      recommendation_reason: buildFallbackReason(mood, action),
    }));
  } catch (error) {
    logger.error('Fallback recommendation failed:', error);
    return [];
  }
}

async function getMovieRecommendationsFromGemini(
  mood: string,
  action: ActionType,
  candidates: CandidateMovie[]
): Promise<GeminiRecommendation> {
  const candidateBlock = candidates.slice(0, 80).map(serializeCandidate).join('\n');
  const allowedCandidateIds = new Set(candidates.map(movie => movie.id));

  const prompt = `You are a movie recommendation expert. Based on the user's current mood and preference, suggest ${MAX_RECOMMENDATIONS} TMDB movie IDs.

User's Mood: ${mood}
User's Preference: ${action}

Mood Context:
- happy: User is feeling joyful and positive
- sad: User is feeling down or melancholic
- excited: User is feeling energetic and thrilled
- cozy: User is feeling comfortable and relaxed
- nostalgic: User is feeling nostalgic
- scattered: User is feeling confused or unfocused
- romantic: User is feeling romantic
- adventurous: User is feeling adventurous

Action Context:
- stay: Find movies that match the current mood perfectly
- distract: Find movies to take their mind off things
- improve: Find movies to lift their spirits
- explore: Find movies outside their usual preferences

Candidate pool (must pick IDs only from this list):
${candidateBlock}

Return strict JSON with this exact shape and no markdown:
{
  "movieIds": [id1, id2, id3, id4, id5],
  "reasons": [
    { "id": id1, "reason": "One short sentence about why this movie fits." }
  ]
}

Rules:
- movieIds must contain exactly ${MAX_RECOMMENDATIONS} numeric IDs.
- Every movie ID must come from the candidate pool.
- reasons should include at least 3 entries.
- Do not include text before or after JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!responseText) throw new Error('Empty response from Gemini API');

  const parsedObject = extractFirstJsonObject(responseText);
  if (!parsedObject) throw new Error('Could not parse JSON object from Gemini response');

  const parsed = JSON.parse(parsedObject) as GeminiRecommendation;
  const movieIds = (parsed.movieIds ?? [])
    .filter(id => Number.isInteger(id) && id > 0)
    .filter(id => allowedCandidateIds.has(id))
    .slice(0, MAX_RECOMMENDATIONS);

  if (movieIds.length === 0) throw new Error('Gemini returned no valid movie IDs');

  const reasons = Array.isArray(parsed.reasons)
    ? parsed.reasons
        .filter(item => Number.isInteger(item.id) && typeof item.reason === 'string')
        .slice(0, MAX_RECOMMENDATIONS)
    : [];

  return { movieIds, reasons };
}

export async function POST(request: NextRequest) {
  try {
    validateTmdbEnv();

    const { mood, action } = await request.json();

    if (!mood || !action) {
      return NextResponse.json({ error: 'Missing mood or action' }, { status: 400 });
    }

    const normalizedMood = String(mood).toLowerCase();
    const normalizedAction = String(action).toLowerCase();

    if (!(normalizedMood in MOOD_GENRE_MAP)) {
      return NextResponse.json({ error: 'Unsupported mood value' }, { status: 400 });
    }

    if (!VALID_ACTIONS.includes(normalizedAction as ActionType)) {
      return NextResponse.json({ error: 'Unsupported action value' }, { status: 400 });
    }

    const actionType = normalizedAction as ActionType;
    const candidateMovies = await fetchCandidateMovies(normalizedMood, actionType);

    let movieIds: number[] = [];
    let reasonsById = new Map<number, string>();
    let source: 'gemini-hybrid' | 'tmdb-fallback' = 'tmdb-fallback';

    if (GEMINI_API_KEY && candidateMovies.length > 0) {
      try {
        const geminiResponse = await getMovieRecommendationsFromGemini(
          normalizedMood, actionType, candidateMovies
        );
        movieIds = geminiResponse.movieIds;
        reasonsById = new Map(geminiResponse.reasons.map(item => [item.id, item.reason]));
        source = 'gemini-hybrid';
      } catch (geminiError) {
        logger.warn('Gemini failed, using fallback:', geminiError);
      }
    }

    const geminiMovies = movieIds.length > 0 ? await fetchMoviesByIds(movieIds) : [];
    const fallbackMovies = await fetchFallbackRecommendations(normalizedMood, actionType);

    const mergedMovies = [...geminiMovies, ...fallbackMovies]
      .reduce<MovieDetails[]>((acc, movie) => {
        if (!acc.some(m => m.id === movie.id)) acc.push(movie);
        return acc;
      }, [])
      .slice(0, MAX_RECOMMENDATIONS)
      .map(movie => ({
        ...movie,
        recommendation_reason:
          reasonsById.get(movie.id) ||
          movie.recommendation_reason ||
          buildFallbackReason(normalizedMood, actionType),
      }));

    return NextResponse.json({
      movies: mergedMovies,
      mood: normalizedMood,
      action: normalizedAction,
      source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('API error:', message);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}

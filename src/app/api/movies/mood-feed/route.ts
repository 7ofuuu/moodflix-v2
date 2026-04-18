import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import { sanitizeIntParam } from '@/lib/sanitize';
import { normalizeMood, MOOD_GENRE_MAP } from '@/lib/mood';
import type { PaginatedResponse, MovieDetails } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const url = new URL(request.url);
    const mood = normalizeMood(url.searchParams.get('mood'));
    const page = sanitizeIntParam(url.searchParams.get('page'), 1, 500, 1);

    const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/discover/movie', {
      language: 'en-US',
      include_adult: 'false',
      sort_by: 'popularity.desc',
      page: String(page),
      with_genres: MOOD_GENRE_MAP[mood].join(','),
      'vote_count.gte': '120',
      with_original_language: 'en',
    });

    return NextResponse.json({
      mood,
      page: data.page ?? page,
      totalPages: data.total_pages ?? 1,
      movies: data.results ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Mood feed error:', message);
    return NextResponse.json({ error: 'Failed to fetch mood feed' }, { status: 500 });
  }
}

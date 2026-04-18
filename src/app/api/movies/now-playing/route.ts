import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import { sanitizeIntParam } from '@/lib/sanitize';
import type { PaginatedResponse, MovieDetails } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const pageValue = new URL(request.url).searchParams.get('page');
    const page = sanitizeIntParam(pageValue, 1, 500, 1);

    const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/movie/now_playing', {
      language: 'en-US',
      page: String(page),
    });

    return NextResponse.json({
      page: data.page ?? page,
      totalPages: data.total_pages ?? 1,
      movies: data.results ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Now playing feed error:', message);
    return NextResponse.json({ error: 'Failed to fetch now playing feed' }, { status: 500 });
  }
}

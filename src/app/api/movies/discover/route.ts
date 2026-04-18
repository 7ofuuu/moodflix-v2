import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import { sanitizeSearchQuery, sanitizeIntParam } from '@/lib/sanitize';
import { VALID_SORT_VALUES } from '@/lib/constants';
import { MOOD_GENRE_MAP, isMoodKey } from '@/lib/mood';
import type { PaginatedResponse, MovieDetails } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const url = new URL(request.url);
    const page = sanitizeIntParam(url.searchParams.get('page'), 1, 500, 1);
    const query = sanitizeSearchQuery(url.searchParams.get('query'));
    const sortBy = url.searchParams.get('sort_by') ?? 'popularity.desc';
    const withGenres = url.searchParams.get('with_genres') ?? '';
    const mood = url.searchParams.get('mood') ?? '';
    const eraStart = url.searchParams.get('era_start') ?? '';
    const eraEnd = url.searchParams.get('era_end') ?? '';
    const withWatchProviders = url.searchParams.get('with_watch_providers') ?? '';
    const watchRegion = url.searchParams.get('watch_region') ?? 'US';

    if (query) {
      const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/search/movie', {
        query,
        page: String(page),
        language: 'en-US',
        include_adult: 'false',
      });

      return NextResponse.json({
        page: data.page,
        totalPages: Math.min(data.total_pages, 500),
        totalResults: data.total_results,
        movies: data.results ?? [],
      });
    }

    const validSort = VALID_SORT_VALUES.includes(sortBy) ? sortBy : 'popularity.desc';

    const genreIds: string[] = [];
    if (mood && isMoodKey(mood)) {
      genreIds.push(...MOOD_GENRE_MAP[mood].map(String));
    }
    if (withGenres) {
      const explicit = withGenres.split(',').filter(id => /^\d+$/.test(id));
      for (const id of explicit) {
        if (!genreIds.includes(id)) genreIds.push(id);
      }
    }

    const params: Record<string, string> = {
      language: 'en-US',
      include_adult: 'false',
      sort_by: validSort,
      page: String(page),
      'vote_count.gte': validSort === 'vote_average.desc' ? '200' : '50',
    };

    if (genreIds.length > 0) {
      params.with_genres = genreIds.join(',');
    }

    if (eraStart) params['primary_release_date.gte'] = eraStart;
    if (eraEnd) params['primary_release_date.lte'] = eraEnd;

    if (withWatchProviders) {
      params.with_watch_providers = withWatchProviders;
      params.watch_region = watchRegion;
    }

    const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/discover/movie', params);

    return NextResponse.json({
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
      movies: data.results ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Discover API error:', message);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import { sanitizeIntParam } from '@/lib/sanitize';
import { ERA_RANGES } from '@/lib/constants';
import type { PaginatedResponse, MovieReview } from '@/types/movie';

interface TmdbReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}

interface ExtendedReview extends MovieReview {
  movie_vote_average: number;
  movie_popularity: number;
}

const REVIEWS_PER_PAGE = 24;
const MOVIE_POOL_SIZE = 20;
const REVIEW_PAGES_PER_MOVIE = 2;

const VALID_SORT_VALUES = [
  'created_at.desc',
  'created_at.asc',
  'vote_average.desc',
  'popularity.desc',
] as const;

type SortValue = (typeof VALID_SORT_VALUES)[number];

function isValidSort(value: string): value is SortValue {
  return (VALID_SORT_VALUES as readonly string[]).includes(value);
}

async function fetchMovieReviews(movie: TmdbMovie): Promise<ExtendedReview[]> {
  const pagePromises = Array.from({ length: REVIEW_PAGES_PER_MOVIE }, (_, i) =>
    fetchTmdb<PaginatedResponse<TmdbReview>>(`/movie/${movie.id}/reviews`, {
      page: String(i + 1),
      language: 'en-US',
    }).then(data =>
      (data.results ?? []).map(r => ({
        ...r,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_poster_path: movie.poster_path,
        movie_vote_average: movie.vote_average,
        movie_popularity: movie.popularity,
      }))
    ).catch(() => [] as ExtendedReview[])
  );

  const pages = await Promise.all(pagePromises);
  // Deduplicate by review id across pages
  const seen = new Set<string>();
  return pages.flat().filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

async function buildMoviePool(
  genreId: string | null,
  eraRange: (typeof ERA_RANGES)[number] | undefined
): Promise<TmdbMovie[]> {
  if ((genreId && genreId !== 'all') || eraRange?.start) {
    const discoverParams: Record<string, string> = {
      language: 'en-US',
      sort_by: 'popularity.desc',
      page: '1',
      'vote_count.gte': '50',
    };
    if (genreId && genreId !== 'all') discoverParams['with_genres'] = genreId;
    if (eraRange?.start) {
      discoverParams['primary_release_date.gte'] = eraRange.start;
      discoverParams['primary_release_date.lte'] = eraRange.end;
    }
    const discovered = await fetchTmdb<PaginatedResponse<TmdbMovie>>('/discover/movie', discoverParams);
    return (discovered.results ?? []).slice(0, MOVIE_POOL_SIZE);
  }
  const trending = await fetchTmdb<PaginatedResponse<TmdbMovie>>('/trending/movie/week', { language: 'en-US' });
  return (trending.results ?? []).slice(0, MOVIE_POOL_SIZE);
}

function compareReviews(a: ExtendedReview, b: ExtendedReview, sortBy: SortValue): number {
  if (sortBy === 'vote_average.desc') return b.movie_vote_average - a.movie_vote_average;
  if (sortBy === 'popularity.desc') return b.movie_popularity - a.movie_popularity;
  const dateA = new Date(a.created_at).getTime();
  const dateB = new Date(b.created_at).getTime();
  return sortBy === 'created_at.asc' ? dateA - dateB : dateB - dateA;
}

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const url = new URL(request.url);
    const page = sanitizeIntParam(url.searchParams.get('page'), 1, 500, 1);
    const movieId = url.searchParams.get('movie_id');
    const sortByRaw = url.searchParams.get('sort_by') ?? 'created_at.desc';
    const sortBy: SortValue = isValidSort(sortByRaw) ? sortByRaw : 'created_at.desc';
    const genreId = url.searchParams.get('genre_id');
    const era = url.searchParams.get('era');
    const minRating = sanitizeIntParam(url.searchParams.get('min_rating'), 0, 10, 0);

    // Single movie mode — paginate through TMDB's own review pages
    if (movieId) {
      const id = sanitizeIntParam(movieId, 1, 999999999, 0);
      if (id === 0) {
        return NextResponse.json({ error: 'Invalid movie_id' }, { status: 400 });
      }

      const [data, movieData] = await Promise.all([
        fetchTmdb<PaginatedResponse<TmdbReview>>(`/movie/${id}/reviews`, {
          page: String(page),
          language: 'en-US',
        }),
        fetchTmdb<TmdbMovie>(`/movie/${id}`, { language: 'en-US' }),
      ]);

      const reviews: MovieReview[] = (data.results ?? []).map(r => ({
        ...r,
        movie_id: id,
        movie_title: movieData.title,
        movie_poster_path: movieData.poster_path,
      }));

      return NextResponse.json({
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        reviews,
      });
    }

    // Bulk mode: resolve era + genre filters, fetch movie pool
    const eraRange = ERA_RANGES.find(e => e.label === era);
    const movies = await buildMoviePool(genreId, eraRange);

    // Fetch multiple review pages per movie in parallel
    const allReviews: ExtendedReview[] = [];
    const reviewsPerMovie = await Promise.all(movies.map(fetchMovieReviews));
    for (const reviews of reviewsPerMovie) {
      allReviews.push(...reviews);
    }

    // Filter by minimum author rating
    const filtered = minRating > 0
      ? allReviews.filter(r => {
          const rating = r.author_details.rating;
          return typeof rating === 'number' && rating >= minRating;
        })
      : allReviews;

    filtered.sort((a, b) => compareReviews(a, b, sortBy));

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / REVIEWS_PER_PAGE));
    const startIdx = (page - 1) * REVIEWS_PER_PAGE;

    return NextResponse.json({
      page,
      totalPages,
      totalResults,
      reviews: filtered.slice(startIdx, startIdx + REVIEWS_PER_PAGE),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Reviews API error:', message);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

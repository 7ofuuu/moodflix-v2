import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';
import { sanitizeIntParam } from '@/lib/sanitize';
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

interface TmdbTrendingMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

const REVIEWS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const url = new URL(request.url);
    const page = sanitizeIntParam(url.searchParams.get('page'), 1, 500, 1);
    const movieId = url.searchParams.get('movie_id');
    const sortBy = url.searchParams.get('sort_by') ?? 'created_at.desc';

    if (movieId) {
      const id = sanitizeIntParam(movieId, 1, 999999999, 0);
      if (id === 0) {
        return NextResponse.json({ error: 'Invalid movie_id' }, { status: 400 });
      }

      const data = await fetchTmdb<PaginatedResponse<TmdbReview>>(`/movie/${id}/reviews`, {
        page: String(page),
        language: 'en-US',
      });

      const movieData = await fetchTmdb<{ title: string; poster_path: string | null }>(`/movie/${id}`, {
        language: 'en-US',
      });

      const reviews: MovieReview[] = (data.results ?? []).map(r => ({
        ...r,
        movie_id: id,
        movie_title: movieData.title,
        movie_poster_path: movieData.poster_path,
      }));

      return NextResponse.json({
        page: data.page,
        totalPages: data.total_pages,
        reviews,
      });
    }

    const trending = await fetchTmdb<PaginatedResponse<TmdbTrendingMovie>>('/trending/movie/week', {
      language: 'en-US',
    });

    const trendingMovies = (trending.results ?? []).slice(0, 10);

    const allReviews: MovieReview[] = [];

    const reviewPromises = trendingMovies.map(async (movie) => {
      try {
        const data = await fetchTmdb<PaginatedResponse<TmdbReview>>(`/movie/${movie.id}/reviews`, {
          page: '1',
          language: 'en-US',
        });

        return (data.results ?? []).map(r => ({
          ...r,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster_path: movie.poster_path,
        }));
      } catch {
        return [];
      }
    });

    const reviewArrays = await Promise.all(reviewPromises);
    for (const reviews of reviewArrays) {
      allReviews.push(...reviews);
    }

    const sortAsc = sortBy === 'created_at.asc';
    allReviews.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    const totalResults = allReviews.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / REVIEWS_PER_PAGE));
    const startIdx = (page - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = allReviews.slice(startIdx, startIdx + REVIEWS_PER_PAGE);

    return NextResponse.json({
      page,
      totalPages,
      reviews: paginatedReviews,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reviews API error:', message);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import { MovieReview } from '@/types/movie';
import type { ReviewParams, ReviewsResult } from '@/types/hooks';

export function useMovieReviews(params: ReviewParams): ReviewsResult {
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { page, movieId, sortBy = 'created_at.desc', genreId, era, minRating } = params;

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const searchParams = new URLSearchParams({
          page: String(page),
          sort_by: sortBy,
        });

        if (movieId) searchParams.set('movie_id', String(movieId));
        if (genreId && genreId !== 'all') searchParams.set('genre_id', genreId);
        if (era && era !== 'All Eras') searchParams.set('era', era);
        if (minRating && minRating !== '0') searchParams.set('min_rating', minRating);

        const response = await fetch(`/api/movies/reviews?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setReviews(data.reviews ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalResults(data.totalResults ?? 0);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Failed to load reviews');
        setReviews([]);
        logger.error('Error loading reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, [page, movieId, sortBy, genreId, era, minRating]);

  return { reviews, totalPages, totalResults, isLoading, error };
}

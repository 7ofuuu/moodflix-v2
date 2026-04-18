import { useState, useEffect, useRef } from 'react';
import { MovieReview } from '@/types/movie';

interface ReviewParams {
  page: number;
  movieId?: number;
  sortBy?: string;
}

interface ReviewsResult {
  reviews: MovieReview[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export function useMovieReviews(params: ReviewParams): ReviewsResult {
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { page, movieId, sortBy = 'created_at.desc' } = params;

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

        if (movieId) {
          searchParams.set('movie_id', String(movieId));
        }

        const response = await fetch(`/api/movies/reviews?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setReviews(data.reviews ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Failed to load reviews');
        setReviews([]);
        console.error('Error loading reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, [page, movieId, sortBy]);

  return { reviews, totalPages, isLoading, error };
}

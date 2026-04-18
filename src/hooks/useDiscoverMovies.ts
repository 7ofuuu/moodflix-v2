import { useState, useEffect, useRef } from 'react';
import { MovieDetails } from '@/types/movie';
import { useDebounce } from './useDebounce';

export interface DiscoverParams {
  page: number;
  query?: string;
  sortBy?: string;
  genreId?: number;
  mood?: string;
  eraStart?: string;
  eraEnd?: string;
  watchProviders?: number[];
}

interface DiscoverResult {
  movies: MovieDetails[];
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
}

export function useDiscoverMovies(params: DiscoverParams): DiscoverResult {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(params.query ?? '', 400);

  const {
    page,
    sortBy = 'popularity.desc',
    genreId,
    mood,
    eraStart,
    eraEnd,
    watchProviders,
  } = params;

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const searchParams = new URLSearchParams({ page: String(page) });

        if (debouncedQuery) {
          searchParams.set('query', debouncedQuery);
        } else {
          searchParams.set('sort_by', sortBy);
          if (genreId) searchParams.set('with_genres', String(genreId));
          if (mood) searchParams.set('mood', mood);
          if (eraStart) searchParams.set('era_start', eraStart);
          if (eraEnd) searchParams.set('era_end', eraEnd);
          if (watchProviders && watchProviders.length > 0) {
            searchParams.set('with_watch_providers', watchProviders.join('|'));
          }
        }

        const response = await fetch(`/api/movies/discover?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setMovies(data.movies ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalResults(data.totalResults ?? 0);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Failed to load movies');
        setMovies([]);
        console.error('Error loading movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();

    return () => controller.abort();
  }, [page, debouncedQuery, sortBy, genreId, mood, eraStart, eraEnd, watchProviders]);

  return { movies, totalPages, totalResults, isLoading, error };
}

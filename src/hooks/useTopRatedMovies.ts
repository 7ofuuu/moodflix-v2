import { useState, useEffect } from 'react';
import { MovieDetails } from '@/types/movie';

export interface PaginatedResponse {
  page: number;
  results: MovieDetails[];
  total_pages: number;
  total_results: number;
}

export function useTopRatedMovies(page: number, genreId?: number, year?: number) {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        let url = `${process.env.NEXT_PUBLIC_TMDB_API_BASE_URL}/discover/movie?page=${page}&sort_by=vote_average.desc&vote_count.gte=200`;

        if (genreId) {
          url += `&with_genres=${genreId}`;
        }

        if (year) {
          url += `&primary_release_year=${year}`;
        }

        const response = await fetch(url, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_TOKEN}`,
          },
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
        setError(null);
      } catch (err) {
        setError('Failed to load movies');
        console.error('Error loading movies:', err);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [page, genreId, year]);

  return { movies, totalPages, isLoading, error };
}

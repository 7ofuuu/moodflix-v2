'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MovieDetails } from '@/types/movie';
import { MovieCard } from '@/components/ui/movie-card';
import { MOOD_LABELS } from '@/lib/mood';

interface MoodFeedResponse {
  page: number;
  totalPages: number;
  movies: MovieDetails[];
}

interface MoodPicksDropdownProps {
  mood: string;
  isOpen: boolean;
}

const MAX_MOOD_COLLECTION_MOVIES = 50;

async function fetchMoodFeedPage(mood: string, page: number): Promise<MoodFeedResponse> {
  const response = await fetch(`/api/movies/mood-feed?mood=${mood}&page=${page}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load mood picks');
  }

  return (await response.json()) as MoodFeedResponse;
}

export function MoodPicksDropdown({ mood, isOpen }: MoodPicksDropdownProps) {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedMoodRef = useRef<string | null>(null);

  const moodLabel = MOOD_LABELS[mood] ?? mood;
  const canLoadMore =
    currentPage < totalPages &&
    !isLoading &&
    !isLoadingMore &&
    movies.length < MAX_MOOD_COLLECTION_MOVIES;

  const loadPage = useCallback(async (page: number, append: boolean, moodKey: string) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const data = await fetchMoodFeedPage(moodKey, page);
      setCurrentPage(data.page ?? page);
      setTotalPages(data.totalPages ?? 1);

      if (append) {
        setMovies(previous => {
          const merged = [...previous, ...(data.movies ?? [])];
          const deduped = new Map<number, MovieDetails>();
          for (const movie of merged) {
            deduped.set(movie.id, movie);
          }
          return Array.from(deduped.values()).slice(0, MAX_MOOD_COLLECTION_MOVIES);
        });
      } else {
        setMovies((data.movies ?? []).slice(0, MAX_MOOD_COLLECTION_MOVIES));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load mood picks');
      if (!append) {
        setMovies([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (loadedMoodRef.current === mood && movies.length > 0) {
      return;
    }

    loadedMoodRef.current = mood;
    setCurrentPage(0);
    setTotalPages(1);
    void loadPage(1, false, mood);
  }, [isOpen, loadPage, mood, movies.length]);

  return (
    <section
      id='mood-picks-dropdown'
      className={`relative overflow-hidden border-b border-white/8 bg-black transition-all duration-500 ease-out ${
        isOpen ? 'max-h-[999rem] opacity-100' : 'max-h-0 opacity-0'
      }`}
      aria-hidden={!isOpen}
    >
      <div className='container mx-auto px-4 py-10 md:px-7'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <span className='mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-400/75'>
              Mood collection
            </span>
            <h3 className='text-2xl font-black text-white md:text-3xl'>
              All {moodLabel} recommendations
            </h3>
          </div>
        </div>

        {isLoading && (
          <div className='flex items-center justify-center py-10'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70' />
          </div>
        )}

        {error && (
          <div className='mb-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200'>
            {error}
          </div>
        )}

        {!isLoading && movies.length > 0 && (
          <div className='grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!isLoading && movies.length === 0 && !error && (
          <p className='py-8 text-sm text-white/60'>No movies available for this mood yet.</p>
        )}

        {canLoadMore && (
          <div className='pt-8 text-center'>
            <button
              type='button'
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                void loadPage(currentPage + 1, true, mood);
              }}
              className='inline-flex items-center rounded-full border border-white/18 bg-white/6 px-6 py-2.5 text-sm font-medium text-white/75 transition-all hover:bg-white/12 hover:text-white'
            >
              {isLoadingMore ? 'Loading…' : 'Load more picks'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import { Reveal } from '@/components/ui/reveal';
import { SplitText } from '@/components/ui/split-text';
import { MovieDetails } from '@/types/movie';

interface NowPlayingResponse {
  page: number;
  totalPages: number;
  movies: MovieDetails[];
}

async function fetchNowPlayingPage(page: number): Promise<NowPlayingResponse> {
  const response = await fetch(`/api/movies/now-playing?page=${page}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch now playing feed');
  }

  return (await response.json()) as NowPlayingResponse;
}

export default function NowPlaying() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [initialCount, setInitialCount] = useState(0);

  const canLoadMore = currentPage < totalPages && !isLoading && !isLoadingMore;

  const loadPage = useCallback(async (page: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const data = await fetchNowPlayingPage(page);
      setCurrentPage(data.page ?? page);
      setTotalPages(data.totalPages ?? 1);

      if (append) {
        setNowPlayingMovies(previous => {
          const merged = [...previous, ...(data.movies ?? [])];
          const deduped = new Map<number, MovieDetails>();

          for (const movie of merged) {
            deduped.set(movie.id, movie);
          }

          return Array.from(deduped.values());
        });
      } else {
        const movies = data.movies ?? [];
        setNowPlayingMovies(movies);
        setInitialCount(movies.length);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load movies');
      if (!append) {
        setNowPlayingMovies([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!canLoadMore) {
      return;
    }

    setIsExpanded(true);
    await loadPage(currentPage + 1, true);
  }, [canLoadMore, currentPage, loadPage]);

  const displayedMovies = isExpanded ? nowPlayingMovies : nowPlayingMovies.slice(0, initialCount || nowPlayingMovies.length);
  const showMoreButton = canLoadMore;
  const showLessButton = isExpanded && nowPlayingMovies.length > initialCount;

  return (
    <section id='now-playing' className='container mx-auto px-4 py-16 md:py-20 md:px-7'>
      <Reveal>
        <div className='mb-12 text-center'>
          <span className='mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-blue-400/70'>
            In cinemas
          </span>
          <h2 className='text-3xl font-black text-white md:text-4xl'>
            <SplitText text='On Air Right Now' className='justify-center' />
          </h2>
        </div>
      </Reveal>

      {error && (
        <div className='mb-8 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-300'>
          {error}
        </div>
      )}

      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70' />
        </div>
      )}

      {!isLoading && nowPlayingMovies.length === 0 && !error && (
        <div className='text-center text-white/40'>No movies found</div>
      )}

      {!isLoading && displayedMovies.length > 0 && (
        <div className='mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5'>
          {displayedMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {isLoadingMore && (
        <div className='flex items-center justify-center py-4'>
          <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70' />
        </div>
      )}

      {!isLoading && (showMoreButton || showLessButton) && (
        <div className='pt-6 flex items-center justify-center gap-3'>
          {showMoreButton && (
            <button
              type='button'
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                void loadMore();
              }}
              disabled={isLoadingMore}
              className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-6 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoadingMore ? 'Loading movies…' : 'Show more'}
            </button>
          )}
          {showLessButton && (
            <button
              type='button'
              onClick={() => setIsExpanded(false)}
              className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-6 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white'
            >
              Show less
            </button>
          )}
        </div>
      )}
    </section>
  );
}

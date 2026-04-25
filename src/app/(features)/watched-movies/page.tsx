'use client';

import { useState, useCallback } from 'react';
import FooterComponent from '@/components/ui/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { useDiscoverMovies } from '@/hooks/useDiscoverMovies';
import { Loader2 } from 'lucide-react';

export default function WatchedMoviesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const { movies, totalPages, isLoading, error } = useDiscoverMovies({
    page: currentPage,
    sortBy,
  });

  const handleFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <section id='watched-movies' className='container mx-auto px-4 pt-12 pb-12 md:px-7'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
            <SplitText text='Watched Movies' />
          </h1>
          <p className='mt-3 text-sm text-white/50'>
            Your collection of watched films
          </p>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-24'>
            <Loader2 className='h-8 w-8 animate-spin text-amber-400/60' />
          </div>
        ) : error ? (
          <div className='py-24 text-center'>
            <p className='text-white/50'>{error}</p>
            <button
              onClick={() => setCurrentPage(1)}
              className='mt-4 text-sm text-amber-400 hover:underline'
            >
              Try again
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className='py-24 text-center'>
            <p className='text-white/50'>No watched movies yet.</p>
          </div>
        ) : (
          <Reveal>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </Reveal>
        )}

        {totalPages > 1 && !isLoading && movies.length > 0 && (
          <PopularPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      <FooterComponent />
    </div>
  );
}

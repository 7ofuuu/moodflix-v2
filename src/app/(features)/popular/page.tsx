'use client';

import { useState } from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { PopularFilters } from '@/components/features/popular/PopularFilters';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { usePopularMovies } from '@/hooks/usePopularMovies';

export default function PopularMoviesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const genreId = selectedGenre !== 'all' ? parseInt(selectedGenre) : undefined;
  const year = selectedYear !== 'all' ? parseInt(selectedYear) : undefined;

  const { movies, totalPages, isLoading, error } = usePopularMovies(
    currentPage,
    genreId,
    year
  );

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedGenre('all');
    setSelectedYear('all');
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />

      <section id='popular-movies' className='container py-12 px-7'>
        <h2 className='mb-8 text-center text-3xl font-bold'>Popular Movies</h2>

        <PopularFilters
          selectedGenre={selectedGenre}
          selectedYear={selectedYear}
          onGenreChange={handleGenreChange}
          onYearChange={handleYearChange}
          onReset={handleResetFilters}
        />

        {error && (
          <div className='mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800'>
            {error}
          </div>
        )}

        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        )}

        {!isLoading && movies.length === 0 && !error && (
          <div className='text-center text-gray-500'>No movies found</div>
        )}

        {!isLoading && movies.length > 0 && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-5 mb-8'>
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            <PopularPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

      <FooterComponent />
    </>
  );
}

'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { SearchInput } from '@/components/features/more-movies/SearchInput';
import { MoreMoviesFilters } from '@/components/features/more-movies/MoreMoviesFilters';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { useDiscoverMovies } from '@/hooks/useDiscoverMovies';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { ERA_RANGES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function MoreMoviesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedEra, setSelectedEra] = useState('All Eras');
  const [selectedProvider, setSelectedProvider] = useState('all');

  const { providers } = useWatchProviders();

  const era = ERA_RANGES.find(e => e.label === selectedEra);

  const { movies, totalPages, totalResults, isLoading, error } = useDiscoverMovies({
    page: currentPage,
    query: query || undefined,
    sortBy,
    genreId: selectedGenre !== 'all' ? Number(selectedGenre) : undefined,
    mood: selectedMood !== 'all' ? selectedMood : undefined,
    eraStart: era?.start || undefined,
    eraEnd: era?.end || undefined,
    watchProviders:
      selectedProvider !== 'all' ? [Number(selectedProvider)] : undefined,
  });

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setCurrentPage(1);
    },
    []
  );

  const handleReset = useCallback(() => {
    setQuery('');
    setSortBy('popularity.desc');
    setSelectedGenre('all');
    setSelectedMood('all');
    setSelectedEra('All Eras');
    setSelectedProvider('all');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <section id='more-movies' className='container mx-auto px-4 pt-28 pb-12 md:px-7'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
            <SplitText text='Discover Movies' />
          </h1>
          <p className='mt-3 text-sm text-white/50'>
            Search, filter by mood, genre, era, and platform
          </p>
        </div>

        <div className='mb-6'>
          <SearchInput onSearch={handleSearch} />
        </div>

        <div className='mb-8'>
          <MoreMoviesFilters
            sortBy={sortBy}
            selectedGenre={selectedGenre}
            selectedMood={selectedMood}
            selectedEra={selectedEra}
            selectedProvider={selectedProvider}
            providers={providers}
            onSortChange={handleFilterChange(setSortBy)}
            onGenreChange={handleFilterChange(setSelectedGenre)}
            onMoodChange={handleFilterChange(setSelectedMood)}
            onEraChange={handleFilterChange(setSelectedEra)}
            onProviderChange={handleFilterChange(setSelectedProvider)}
            onReset={handleReset}
          />
        </div>

        {query && !isLoading && (
          <p className='mb-4 text-sm text-white/40'>
            {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>
        )}

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
            <p className='text-white/50'>No movies found. Try adjusting your filters.</p>
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

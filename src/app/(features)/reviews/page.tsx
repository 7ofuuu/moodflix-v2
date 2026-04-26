'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { ReviewCard } from '@/components/features/reviews/ReviewCard';
import { ReviewsFilters } from '@/components/features/reviews/ReviewsFilters';
import { ReviewsMovieSearch } from '@/components/features/reviews/ReviewsMovieSearch';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { useMovieReviews } from '@/hooks/useMovieReviews';
import { Loader2 } from 'lucide-react';

interface SelectedMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at.desc');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedEra, setSelectedEra] = useState('All Eras');
  const [minRating, setMinRating] = useState('0');
  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null);

  const { reviews, totalPages, totalResults, isLoading, error } = useMovieReviews({
    page: currentPage,
    sortBy,
    genreId: selectedMovie ? undefined : selectedGenre,
    era: selectedMovie ? undefined : selectedEra,
    minRating: selectedMovie ? undefined : minRating,
    movieId: selectedMovie?.id,
  });

  const resetToPage1 = useCallback(() => setCurrentPage(1), []);

  const handleSortChange = useCallback((value: string) => { setSortBy(value); resetToPage1(); }, [resetToPage1]);
  const handleGenreChange = useCallback((value: string) => { setSelectedGenre(value); resetToPage1(); }, [resetToPage1]);
  const handleEraChange = useCallback((value: string) => { setSelectedEra(value); resetToPage1(); }, [resetToPage1]);
  const handleMinRatingChange = useCallback((value: string) => { setMinRating(value); resetToPage1(); }, [resetToPage1]);

  const handleReset = useCallback(() => {
    setSortBy('created_at.desc');
    setSelectedGenre('all');
    setSelectedEra('All Eras');
    setMinRating('0');
    resetToPage1();
  }, [resetToPage1]);

  const handleMovieSelect = useCallback((movie: SelectedMovie) => {
    setSelectedMovie(movie);
    resetToPage1();
  }, [resetToPage1]);

  const handleMovieClear = useCallback(() => {
    setSelectedMovie(null);
    resetToPage1();
  }, [resetToPage1]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <section id='reviews' className='container mx-auto px-4 pt-28 pb-12 md:px-7'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
            <SplitText text='Movie Reviews' />
          </h1>
          <p className='mt-3 text-sm text-white/50'>
            {selectedMovie
              ? `Reviews for "${selectedMovie.title}"`
              : 'Reviews from trending & curated movies'}
          </p>
        </div>

        <div className='mb-4 space-y-3'>
          <ReviewsMovieSearch
            selectedMovie={selectedMovie}
            onMovieSelect={handleMovieSelect}
            onClear={handleMovieClear}
          />

          {!selectedMovie && (
            <ReviewsFilters
              sortBy={sortBy}
              selectedGenre={selectedGenre}
              selectedEra={selectedEra}
              minRating={minRating}
              onSortChange={handleSortChange}
              onGenreChange={handleGenreChange}
              onEraChange={handleEraChange}
              onMinRatingChange={handleMinRatingChange}
              onReset={handleReset}
            />
          )}
        </div>

        {!isLoading && !error && totalResults > 0 && (
          <p className='mb-4 text-sm text-white/40'>
            {totalResults} review{totalResults === 1 ? '' : 's'} found
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
        ) : reviews.length === 0 ? (
          <div className='py-24 text-center'>
            <p className='text-white/50'>No reviews found.</p>
          </div>
        ) : (
          <Reveal>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </Reveal>
        )}

        {totalPages > 1 && !isLoading && reviews.length > 0 && (
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

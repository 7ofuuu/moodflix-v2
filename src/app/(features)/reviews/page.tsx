'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { ReviewCard } from '@/components/features/reviews/ReviewCard';
import { ReviewsSort } from '@/components/features/reviews/ReviewsSort';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { useMovieReviews } from '@/hooks/useMovieReviews';
import { Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at.desc');

  const { reviews, totalPages, isLoading, error } = useMovieReviews({
    page: currentPage,
    sortBy,
  });

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <section id='reviews' className='container mx-auto px-4 pt-28 pb-12 md:px-7'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
              <SplitText text='Movie Reviews' />
            </h1>
            <p className='mt-3 text-sm text-white/50'>
              Recent reviews from trending movies
            </p>
          </div>
          <ReviewsSort value={sortBy} onChange={handleSortChange} />
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

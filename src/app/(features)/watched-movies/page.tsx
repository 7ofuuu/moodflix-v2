'use client';

import FooterComponent from '@/components/ui/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { useWatchedMovies } from '@/hooks/useWatchedMovies'; // Import your hook
import { Loader2 } from 'lucide-react';
import Navbar from "@/components/ui/navbar";

export default function WatchedMoviesPage() {
  // Destructure the data and loading state from your hook
  const { watchlist, isLoaded, isLoggedIn } = useWatchedMovies();

  const renderContent = () => {
    // 1. Check if user is logged in
    if (isLoaded && !isLoggedIn) {
      return (
        <div className='py-24 text-center'>
          <p className='text-white/50'>Please log in to view your watched movies.</p>
        </div>
      );
    }

    // 2. Check loading state
    if (!isLoaded) {
      return (
        <div className='flex items-center justify-center py-24'>
          <Loader2 className='h-8 w-8 animate-spin text-amber-400/60' />
        </div>
      );
    }

    // 3. Check if the list is empty
    if (watchlist.length === 0) {
      return (
        <div className='py-24 text-center'>
          <p className='text-white/50'>No watched movies yet.</p>
        </div>
      );
    }

    // 4. Render the stored movies
    return (
      <Reveal>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </Reveal>
    );
  };

  return (
    <>
    <Navbar />
    <div className='min-h-screen bg-black'>
      <section id='watched-movies' className='container mx-auto px-4 pt-12 pb-12 md:px-7'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
            <SplitText text='Watched Movies' />
          </h1>
          <p className='mt-3 text-sm text-white/50'>
            Your collection of {watchlist.length} watched films
          </p>
        </div>

        {renderContent()}
      </section>

      <FooterComponent />
    </div>
    </>
  );
}
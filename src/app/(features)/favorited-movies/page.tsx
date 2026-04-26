'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { PopularPagination } from '@/components/features/popular/PopularPagination';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import { supabase } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { MovieDetails } from '@/types/movie';

const MOVIES_PER_PAGE = 10;

type Favorite = {
  movie_id: number;
};

export default function FavoritedMoviesPage() {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchFavorites() {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('movie_id')
        .eq('user_id', user.id);

      if (error || !favorites) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      const moviePromises = (favorites as Favorite[]).map(async (fav) => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${fav.movie_id}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_TOKEN}`,
              },
            }
          );

          if (!res.ok) {
            throw new Error('Failed to fetch movie');
          }

          return (await res.json()) as MovieDetails;
        } catch (err) {
          console.error('Error fetching movie:', err);
          return null;
        }
      });

      const moviesData = await Promise.all(moviePromises);

      // filter null kalau ada fetch gagal
      const validMovies = moviesData.filter(
        (movie): movie is MovieDetails => movie !== null
      );

      setMovies(validMovies);
      setIsLoading(false);
    }

    fetchFavorites();
  }, []);

  const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);

  const paginatedMovies = movies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <Navbar />

      <section className='container mx-auto px-4 pt-28 pb-12 md:px-7'>
        {/* HEADER */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>
            <SplitText text='Favorite Movies' />
          </h1>
          <p className='mt-3 text-sm text-white/50'>
            Your favorite movies collection
          </p>
        </div>

        {/* CONTENT */}
        {user ? (
          isLoading ? (
            <div className='flex items-center justify-center h-[40vh]'>
              <Loader2 className='h-8 w-8 animate-spin text-amber-400/60' />
            </div>
          ) : movies.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-[40vh] text-center'>
              <p className='text-white/50'>No favorite movies yet.</p>

              <a
                href='/more-movies'
                className='mt-4 text-amber-400 hover:underline'
              >
                Discover movies →
              </a>
            </div>
          ) : (
            <>
              <Reveal>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                  {paginatedMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </Reveal>

              {totalPages > 1 && (
                <PopularPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )
        ) : (
          <div className='flex items-center justify-center h-[40vh] text-center'>
            <p className='text-red-400'>You must be logged in</p>
          </div>
        )}
      </section>

      <FooterComponent />
    </div>
  );
}
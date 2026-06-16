import { useState, useEffect } from 'react';
import { MovieDetails } from '@/types/movie';
import { supabase } from '@/lib/auth-client';
import { useAuth } from '@/hooks/useAuth';
import { fetchTmdb } from '@/lib/tmdb';

export function useWatchedMovies() {
  const [watchlist, setWatchlist] = useState<MovieDetails[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setIsLoaded(true);
      return;
    }

    const fetchWatchedList = async () => {
      try {
        const { data, error } = await supabase
          .from('watched_movies')
          .select('movie_id')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data && data.length > 0) {
          const moviePromises = data.map((row: { movie_id: number }) => 
            fetchTmdb<MovieDetails>(`/movie/${row.movie_id}`)
          );
          const fetchedMovies = await Promise.all(moviePromises);
          setWatchlist(fetchedMovies);
        } else {
          setWatchlist([]);
        }
      } catch (e) {
        console.warn('Failed to load watched movies from Supabase. Error:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchWatchedList();
  }, [user]);

  const addToWatchedList = async (movie: MovieDetails) => {
    if (!user) return;
    setWatchlist((prev) => prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]);
    try {
      const { error } = await supabase.from('watched_movies').insert({
        user_id: user.id, movie_id: movie.id
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Failed to add movie to Supabase. Error:', e);
      setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
    }
  };



  const isInWatchedlist = (movieId: number) => watchlist.some((m) => m.id === movieId);
  
  return { watchlist, addToWatchlist: addToWatchedList, isInWatchedlist, isLoaded, isLoggedIn: !!user };
}

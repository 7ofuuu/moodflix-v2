import { useState, useEffect } from 'react';
import { MovieDetails } from '@/types/movie';
import { supabase } from '@/lib/auth-client';
import { useAuth } from '@/hooks/useAuth';
import { fetchTmdb } from '@/lib/tmdb';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MovieDetails[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setIsLoaded(true);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const { data, error } = await supabase
          .from('user_watchlists')
          .select('movie_id')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data && data.length > 0) {
          const moviePromises = data.map((row: any) => 
            fetchTmdb<MovieDetails>(`/movie/${row.movie_id}`)
          );
          const fetchedMovies = await Promise.all(moviePromises);
          setWatchlist(fetchedMovies);
        } else {
          setWatchlist([]);
        }
      } catch (e) {
        console.warn('Failed to load watchlist from Supabase. Error:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchWatchlist();
  }, [user]);

  const addToWatchlist = async (movie: MovieDetails) => {
    if (!user) return;
    setWatchlist((prev) => prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]);
    try {
      const { error } = await supabase.from('user_watchlists').insert({
        user_id: user.id, movie_id: movie.id
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Failed to add movie to Supabase. Error:', e);
      setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return;
    const movieToRemove = watchlist.find(m => m.id === movieId);
    if (!movieToRemove) return;
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
    try {
      const { error } = await supabase.from('user_watchlists').delete().eq('user_id', user.id).eq('movie_id', movieId);
      if (error) throw error;
    } catch (e) {
      console.warn('Failed to remove movie from Supabase. Error:', e);
      setWatchlist((prev) => [...prev, movieToRemove]);
    }
  };

  const isInWatchlist = (movieId: number) => watchlist.some((m) => m.id === movieId);
  
  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, isLoaded, isLoggedIn: !!user };
}

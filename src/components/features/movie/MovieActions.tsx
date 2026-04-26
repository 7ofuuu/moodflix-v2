'use client';

import { useState } from 'react';
import { Bookmark, Heart, CheckCircle } from 'lucide-react';
import { useWatchedMovies } from '@/hooks/useWatchedMovies';
import { MovieDetails } from '@/types/movie';


interface MovieActionsProps {
  readonly movie: MovieDetails;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MovieActions({ movie }: MovieActionsProps) {
  const { addToWatchlist, isInWatchedlist, isLoaded } = useWatchedMovies();
  const [isWishlist, setIsWishlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isWatched = isInWatchedlist(movie.id); 

  const handleToggleWatched = async (e: React.MouseEvent) => {
     e.preventDefault(); 
    if (isWatched || isAdding) return;
      // Pass the whole object to the hook
    setIsAdding(true);
    try {
      await addToWatchlist(movie); 
    } catch (err) {
      console.error("Failed to add movie:", err);
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isWishlist ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10'}`}
        onClick={() => setIsWishlist(!isWishlist)}
      >
        <Bookmark className={`w-5 h-5 ${isWishlist ? 'fill-current' : ''}`} />
        {isWishlist ? 'In Wishlist' : 'Watchlist'}
      </button>

      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isFavorite ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10'}`}
        onClick={() => setIsFavorite(!isFavorite)}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? 'Favorited' : 'Favorite'}
      </button>

      <button
        type="button"
        disabled={!isLoaded || isAdding}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
          isWatched 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
            : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10'
        } ${isAdding ? 'opacity-70 cursor-wait' : ''}`}
        onClick={handleToggleWatched}
      >
        <CheckCircle className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
        {!isLoaded || isAdding ? 'Processing...' : isWatched ? 'Watched' : 'Mark Watched'}
      </button>
    </div>
  );

} 

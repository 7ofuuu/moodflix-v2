'use client';

import { useState } from 'react';
import { Bookmark, Heart, CheckCircle } from 'lucide-react';

interface MovieActionsProps {
  readonly movieId: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MovieActions({ movieId }: MovieActionsProps) {
  // Local state untuk simulasi fitur interaksi
  const [isWishlist, setIsWishlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

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
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isWatched ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10'}`}
        onClick={() => setIsWatched(!isWatched)}
      >
        <CheckCircle className={`w-5 h-5`} />
        {isWatched ? 'Watched' : 'Mark Watched'}
      </button>
    </div>
  );
}

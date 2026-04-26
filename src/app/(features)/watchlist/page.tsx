'use client';

import { useState, useMemo } from 'react';
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistGrid } from "@/components/features/watchlist/WatchlistGrid";
import { AddMovieSearch } from "@/components/features/watchlist/AddMovieSearch";
import Navbar from "@/components/ui/navbar";
import { MovieDetails } from "@/types/movie";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, isLoaded } = useWatchlist();
  
  // Sort State
  const [sortBy, setSortBy] = useState('recent');
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (movie: MovieDetails) => {
    addToWatchlist(movie);
    showToast(`Added "${movie.title}" to watchlist!`);
  };

  const handleRemove = (id: number) => {
    const movie = watchlist.find(m => m.id === id);
    removeFromWatchlist(id);
    if (movie) {
      showToast(`Removed "${movie.title}" from watchlist.`);
    }
  };

  const sortedWatchlist = useMemo(() => {
    const copy = [...watchlist];
    switch (sortBy) {
      case 'rating_desc': return copy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'newest': return copy.sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
      case 'oldest': return copy.sort((a, b) => new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime());
      case 'recent':
      default: return copy; // Keep insertion order
    }
  }, [watchlist, sortBy]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 pt-24 relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-xl">My Watchlist</h1>
            <p className="text-slate-400 font-medium">Search and add movies to your watchlist.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {watchlist.length > 0 && (
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest Release</SelectItem>
                  <SelectItem value="oldest">Oldest Release</SelectItem>
                </SelectContent>
              </Select>
            )}
            <AddMovieSearch onAdd={handleAdd} isInWatchlist={isInWatchlist} />
          </div>
        </div>
        
        <WatchlistGrid movies={sortedWatchlist} onRemove={handleRemove} />

        {/* Custom Mini Toast Component */}
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out transform ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          {toastMessage && (
            <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

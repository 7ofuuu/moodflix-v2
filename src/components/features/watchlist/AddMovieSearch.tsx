'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MovieDetails } from "@/types/movie";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface AddMovieSearchProps {
  readonly onAdd: (movie: MovieDetails) => void;
  readonly isInWatchlist: (id: number) => boolean;
}

export function AddMovieSearch({ onAdd, isInWatchlist }: AddMovieSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/movies/discover?query=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.movies || []);
        }
      } catch (error) {
        console.error("Failed to search movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchMovies, 500); // debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = (movie: MovieDetails) => {
    onAdd(movie);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full md:w-auto">
        <Search className="h-4 w-4 mr-2" /> Add Movie
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Search Movies</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type a movie name..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                </div>
              )}
              
              {!isLoading && results.length === 0 && query.trim() !== '' && (
                <div className="text-center py-8 text-slate-500">
                  No movies found matching &quot;{query}&quot;
                </div>
              )}

              <div className="space-y-2 p-4">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="h-16 w-12 bg-slate-800 rounded overflow-hidden flex-shrink-0 relative">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{movie.title}</h4>
                      <p className="text-sm text-slate-400">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'} • ★ {movie.vote_average?.toFixed(1)}
                      </p>
                    </div>
                    <Button
                      variant={isInWatchlist(movie.id) ? "outline" : "secondary"}
                      size="sm"
                      disabled={isInWatchlist(movie.id)}
                      onClick={() => {
                        if (!isInWatchlist(movie.id)) handleAdd(movie);
                      }}
                    >
                      {isInWatchlist(movie.id) ? 'Added' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

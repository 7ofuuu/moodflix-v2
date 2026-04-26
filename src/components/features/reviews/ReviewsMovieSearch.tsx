'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import type { MovieDetails } from '@/types/movie';

interface SelectedMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

interface ReviewsMovieSearchProps {
  selectedMovie: SelectedMovie | null;
  onMovieSelect: (movie: SelectedMovie) => void;
  onClear: () => void;
}

export function ReviewsMovieSearch({
  selectedMovie,
  onMovieSelect,
  onClear,
}: Readonly<ReviewsMovieSearchProps>) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MovieDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);

    fetch(`/api/movies/discover?query=${encodeURIComponent(debouncedQuery)}&page=1`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        setSuggestions((data.movies ?? []).slice(0, 8));
        setOpen(true);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSuggestions([]);
      })
      .finally(() => setIsSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback((movie: MovieDetails) => {
    onMovieSelect({ id: movie.id, title: movie.title, poster_path: movie.poster_path });
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  }, [onMovieSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    onClear();
  }, [onClear]);

  if (selectedMovie) {
    return (
      <div className='flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3'>
        {selectedMovie.poster_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w45${selectedMovie.poster_path}`}
            alt=''
            width={28}
            height={42}
            className='rounded shrink-0 object-cover'
          />
        )}
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-amber-400/70'>Showing reviews for</p>
          <p className='truncate text-sm font-medium text-white'>{selectedMovie.title}</p>
        </div>
        <button
          onClick={handleClear}
          className='shrink-0 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white'
          aria-label='Clear movie selection'
        >
          <X className='size-4' />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='relative'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        {isSearching ? (
          <Loader2 className='h-4 w-4 animate-spin text-amber-400/60' />
        ) : (
          <Search className='h-4 w-4 text-white/40' />
        )}
      </div>
      <input
        type='text'
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder='Search a movie to see its reviews...'
        maxLength={200}
        className='w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:border-amber-400/40 focus:bg-white/[0.08] focus:ring-1 focus:ring-amber-400/20'
        aria-label='Search movie for reviews'
        aria-autocomplete='list'
        aria-expanded={open}
      />

      {open && suggestions.length > 0 && (
        <div className='absolute top-full z-50 mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 shadow-2xl'>
          <ul role='listbox'>
            {suggestions.map(movie => {
              const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
              return (
                <li key={movie.id} role='option' aria-selected={false}>
                  <button
                    className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]'
                    onClick={() => handleSelect(movie)}
                  >
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w45${movie.poster_path}`}
                        alt=''
                        width={28}
                        height={42}
                        className='shrink-0 rounded object-cover'
                      />
                    ) : (
                      <div className='h-[42px] w-[28px] shrink-0 rounded bg-white/10' />
                    )}
                    <div className='min-w-0'>
                      <p className='truncate text-sm text-white'>{movie.title}</p>
                      {year && <p className='text-xs text-white/40'>{year}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

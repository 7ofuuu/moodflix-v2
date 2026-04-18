'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchInput({ onSearch, initialValue = '' }: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 400);
  const isDebouncing = value !== debouncedValue;

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className='relative w-full'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        {isDebouncing ? (
          <Loader2 className='h-4 w-4 animate-spin text-amber-400/60' />
        ) : (
          <Search className='h-4 w-4 text-white/40' />
        )}
      </div>
      <input
        type='text'
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder='Search movies by title...'
        maxLength={200}
        className='w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:border-amber-400/40 focus:bg-white/8 focus:ring-1 focus:ring-amber-400/20'
        aria-label='Search movies'
      />
    </div>
  );
}

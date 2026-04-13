'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GENRES, YEARS } from '@/lib/constants';

interface PopularFiltersProps {
  selectedGenre: string;
  selectedYear: string;
  onGenreChange: (genre: string) => void;
  onYearChange: (year: string) => void;
  onReset: () => void;
}

export function PopularFilters({
  selectedGenre,
  selectedYear,
  onGenreChange,
  onYearChange,
  onReset,
}: PopularFiltersProps) {
  return (
    <div className='mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center sm:gap-6'>
      <Select value={selectedGenre} onValueChange={onGenreChange}>
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='All Genres' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Genres</SelectItem>
          {GENRES.map(genre => (
            <SelectItem key={genre.id} value={genre.id.toString()}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='All Years' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Years</SelectItem>
          {YEARS.map(year => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant='outline' onClick={onReset} className='w-full sm:w-auto'>
        Reset Filters
      </Button>
    </div>
  );
}

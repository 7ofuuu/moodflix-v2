'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GENRES, ERA_RANGES, SORT_OPTIONS } from '@/lib/constants';
import { MOOD_LABELS } from '@/lib/mood';
import { WatchProvider } from '@/types/movie';
import Image from 'next/image';

interface MoreMoviesFiltersProps {
  sortBy: string;
  selectedGenre: string;
  selectedMood: string;
  selectedEra: string;
  selectedProvider: string;
  providers: WatchProvider[];
  onSortChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onEraChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  onReset: () => void;
}

export function MoreMoviesFilters({
  sortBy,
  selectedGenre,
  selectedMood,
  selectedEra,
  selectedProvider,
  providers,
  onSortChange,
  onGenreChange,
  onMoodChange,
  onEraChange,
  onProviderChange,
  onReset,
}: MoreMoviesFiltersProps) {
  const moodEntries = Object.entries(MOOD_LABELS);

  return (
    <div className='sticky-surface rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className='w-full sm:w-44 rounded-full border-white/15 bg-white/5 text-white/80'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Genre */}
        <Select value={selectedGenre} onValueChange={onGenreChange}>
          <SelectTrigger className='w-full sm:w-44 rounded-full border-white/15 bg-white/5 text-white/80'>
            <SelectValue placeholder='Genre' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Genres</SelectItem>
            {GENRES.map(genre => (
              <SelectItem key={genre.id} value={String(genre.id)}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mood */}
        <Select value={selectedMood} onValueChange={onMoodChange}>
          <SelectTrigger className='w-full sm:w-44 rounded-full border-white/15 bg-white/5 text-white/80'>
            <SelectValue placeholder='Mood' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Moods</SelectItem>
            {moodEntries.map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Era */}
        <Select value={selectedEra} onValueChange={onEraChange}>
          <SelectTrigger className='w-full sm:w-36 rounded-full border-white/15 bg-white/5 text-white/80'>
            <SelectValue placeholder='Era' />
          </SelectTrigger>
          <SelectContent>
            {ERA_RANGES.map(era => (
              <SelectItem key={era.label} value={era.label}>
                {era.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Watch Provider */}
        <Select value={selectedProvider} onValueChange={onProviderChange}>
          <SelectTrigger className='w-full sm:w-48 rounded-full border-white/15 bg-white/5 text-white/80'>
            <SelectValue placeholder='Platform' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Platforms</SelectItem>
            {providers.map(provider => (
              <SelectItem key={provider.provider_id} value={String(provider.provider_id)}>
                <span className='flex items-center gap-2'>
                  {provider.logo_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt=''
                      width={18}
                      height={18}
                      className='rounded'
                    />
                  )}
                  {provider.provider_name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button
          variant='outline'
          size='sm'
          onClick={onReset}
          className='w-full sm:w-auto rounded-full border-white/15 text-white/60 hover:text-white'
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

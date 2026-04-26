'use client';

import { Button } from '@/components/ui/button';
import { FilterCombobox } from '@/components/ui/filter-combobox';
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
}: Readonly<MoreMoviesFiltersProps>) {
  const moodEntries = Object.entries(MOOD_LABELS);

  return (
    <div className='sticky-surface rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Sort */}
        <FilterCombobox
          value={sortBy}
          onValueChange={onSortChange}
          placeholder='Sort by'
          triggerClassName='w-full sm:w-44'
          options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
        />

        {/* Genre */}
        <FilterCombobox
          value={selectedGenre}
          onValueChange={onGenreChange}
          placeholder='All Genres'
          triggerClassName='w-full sm:w-44'
          options={[
            { value: 'all', label: 'All Genres' },
            ...GENRES.map(g => ({ value: String(g.id), label: g.name })),
          ]}
        />

        {/* Mood */}
        <FilterCombobox
          value={selectedMood}
          onValueChange={onMoodChange}
          placeholder='All Moods'
          triggerClassName='w-full sm:w-44'
          options={[
            { value: 'all', label: 'All Moods' },
            ...moodEntries.map(([key, label]) => ({ value: key, label })),
          ]}
        />

        {/* Era */}
        <FilterCombobox
          value={selectedEra}
          onValueChange={onEraChange}
          placeholder='All Eras'
          triggerClassName='w-full sm:w-36'
          options={ERA_RANGES.map(e => ({ value: e.label, label: e.label }))}
        />

        {/* Watch Provider */}
        <FilterCombobox
          value={selectedProvider}
          onValueChange={onProviderChange}
          placeholder='All Platforms'
          triggerClassName='w-full sm:w-48'
          options={[
            { value: 'all', label: 'All Platforms' },
            ...providers.map(p => ({
              value: String(p.provider_id),
              label: p.provider_name,
              icon: p.logo_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt=''
                  width={18}
                  height={18}
                  className='rounded shrink-0'
                />
              ) : undefined,
            })),
          ]}
        />

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

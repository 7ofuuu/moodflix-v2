'use client';

import { Button } from '@/components/ui/button';
import { FilterCombobox } from '@/components/ui/filter-combobox';
import { GENRES, ERA_RANGES } from '@/lib/constants';

const REVIEW_SORT_OPTIONS = [
  { value: 'created_at.desc', label: 'Newest Review' },
  { value: 'created_at.asc', label: 'Oldest Review' },
  { value: 'vote_average.desc', label: 'Highest Rated Movie' },
  { value: 'popularity.desc', label: 'Most Popular Movie' },
];

const MIN_RATING_OPTIONS = [
  { value: '0', label: 'Any Rating' },
  { value: '6', label: '6+ Stars' },
  { value: '7', label: '7+ Stars' },
  { value: '8', label: '8+ Stars' },
  { value: '9', label: '9+ Stars' },
];

interface ReviewsFiltersProps {
  sortBy: string;
  selectedGenre: string;
  selectedEra: string;
  minRating: string;
  onSortChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onEraChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onReset: () => void;
}

export function ReviewsFilters({
  sortBy,
  selectedGenre,
  selectedEra,
  minRating,
  onSortChange,
  onGenreChange,
  onEraChange,
  onMinRatingChange,
  onReset,
}: Readonly<ReviewsFiltersProps>) {
  return (
    <div className='sticky-surface rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
      <div className='flex flex-wrap items-center gap-3'>
        <FilterCombobox
          value={sortBy}
          onValueChange={onSortChange}
          placeholder='Sort by'
          triggerClassName='w-full sm:w-52'
          options={REVIEW_SORT_OPTIONS}
        />

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

        <FilterCombobox
          value={selectedEra}
          onValueChange={onEraChange}
          placeholder='All Eras'
          triggerClassName='w-full sm:w-36'
          options={ERA_RANGES.map(e => ({ value: e.label, label: e.label }))}
        />

        <FilterCombobox
          value={minRating}
          onValueChange={onMinRatingChange}
          placeholder='Any Rating'
          triggerClassName='w-full sm:w-36'
          options={MIN_RATING_OPTIONS}
        />

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

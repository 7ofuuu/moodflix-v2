'use client';

import { useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Search, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GENRES, ERA_RANGES, SORT_OPTIONS } from '@/lib/constants';
import { MOOD_LABELS } from '@/lib/mood';
import { WatchProvider } from '@/types/movie';
import Image from 'next/image';

interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

function FilterCombobox({
  value,
  onValueChange,
  placeholder,
  options,
  triggerClassName,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: ComboboxOption[];
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;
  const selectedIcon = options.find(o => o.value === value)?.icon;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(''); }}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            'flex h-8 items-center justify-between gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-sm text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none',
            triggerClassName
          )}
        >
          <span className='flex items-center gap-2 truncate'>
            {selectedIcon}
            <span className='truncate'>{selectedLabel}</span>
          </span>
          <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          align='start'
          className='z-50 w-56 rounded-lg bg-popover shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95'
        >
          {/* Search input */}
          <div className='flex items-center border-b border-white/10 px-3'>
            <Search className='mr-2 size-3.5 shrink-0 text-muted-foreground' />
            <input
              className='flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-muted-foreground'
              placeholder='Search...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Options list with dark scrollbar */}
          <div className='max-h-60 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700'>
            {filtered.length === 0 ? (
              <p className='py-4 text-center text-sm text-muted-foreground'>No results.</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  className='relative flex w-full items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => { onValueChange(opt.value); setOpen(false); setSearch(''); }}
                >
                  {opt.icon}
                  <span className='truncate'>{opt.label}</span>
                  {value === opt.value && (
                    <Check className='pointer-events-none absolute right-2 size-4 shrink-0' />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

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

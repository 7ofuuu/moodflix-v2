'use client';

import { useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Search, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export function FilterCombobox({
  value,
  onValueChange,
  placeholder,
  options,
  triggerClassName,
}: Readonly<{
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: ComboboxOption[];
  triggerClassName?: string;
}>) {
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
          <div className='flex items-center border-b border-white/10 px-3'>
            <Search className='mr-2 size-3.5 shrink-0 text-muted-foreground' />
            <input
              className='flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-muted-foreground'
              placeholder='Search...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
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

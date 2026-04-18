'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewsSortProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'created_at.desc', label: 'Newest First' },
  { value: 'created_at.asc', label: 'Oldest First' },
];

export function ReviewsSort({ value, onChange }: ReviewsSortProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='w-full sm:w-48 rounded-full border-white/15 bg-white/5 text-white/80'>
        <SelectValue placeholder='Sort reviews' />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Smile,
  CloudRain,
  Zap,
  Coffee,
  Sparkles,
  Wind,
  Heart,
  Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Mood {
  id: string;
  name: string;
  Icon: LucideIcon;
  iconColor: string;
  description: string;
  tone: string;
  border: string;
}

const MOODS: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    Icon: Smile,
    iconColor: 'text-amber-400',
    description: 'Bright stories with uplifting energy',
    tone: 'from-yellow-500/20 to-amber-500/8 dark:from-yellow-500/20 dark:to-amber-500/8',
    border: 'border-amber-400/30',
  },
  {
    id: 'sad',
    name: 'Melancholic',
    Icon: CloudRain,
    iconColor: 'text-sky-400',
    description: 'Tender stories for emotional reflection',
    tone: 'from-sky-500/20 to-blue-500/8 dark:from-sky-500/20 dark:to-blue-500/8',
    border: 'border-sky-400/30',
  },
  {
    id: 'excited',
    name: 'Thrilled',
    Icon: Zap,
    iconColor: 'text-rose-400',
    description: 'Fast-paced stories full of sparks',
    tone: 'from-rose-500/20 to-orange-500/8 dark:from-rose-500/20 dark:to-orange-500/8',
    border: 'border-rose-400/30',
  },
  {
    id: 'cozy',
    name: 'Cozy',
    Icon: Coffee,
    iconColor: 'text-orange-400',
    description: 'Warm comfort movies for calm nights',
    tone: 'from-orange-500/20 to-amber-500/8 dark:from-orange-500/20 dark:to-amber-500/8',
    border: 'border-orange-400/30',
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    Icon: Sparkles,
    iconColor: 'text-violet-400',
    description: 'Classic feelings and timeless moments',
    tone: 'from-violet-500/20 to-fuchsia-500/8 dark:from-violet-500/20 dark:to-fuchsia-500/8',
    border: 'border-violet-400/30',
  },
  {
    id: 'scattered',
    name: 'Scattered',
    Icon: Wind,
    iconColor: 'text-slate-400',
    description: 'Grounding movies to reset your focus',
    tone: 'from-slate-500/20 to-gray-500/8 dark:from-slate-500/20 dark:to-gray-500/8',
    border: 'border-slate-400/30',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    Icon: Heart,
    iconColor: 'text-rose-400',
    description: 'Heartfelt stories and intimate chemistry',
    tone: 'from-rose-500/20 to-pink-500/8 dark:from-rose-500/20 dark:to-pink-500/8',
    border: 'border-rose-400/30',
  },
  {
    id: 'adventurous',
    name: 'Adventurous',
    Icon: Compass,
    iconColor: 'text-emerald-400',
    description: 'Epic journeys and daring missions',
    tone: 'from-emerald-500/20 to-green-500/8 dark:from-emerald-500/20 dark:to-green-500/8',
    border: 'border-emerald-400/30',
  },
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: Dispatch<SetStateAction<string | null>>;
  onNext: () => void;
}

export function MoodSelector({ selectedMood, onMoodSelect, onNext }: MoodSelectorProps) {
  return (
    <div className='flex w-full flex-col items-center gap-12'>
      <div className='w-full text-center'>
        <h2 className='mb-2 text-4xl font-bold'>Set tonight&apos;s cinematic mood</h2>
        <p className='text-muted-foreground'>Pick the vibe that reflects your current state</p>
      </div>

      <div className='mx-auto grid w-full grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {MOODS.map(mood => (
          <Button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            variant='outline'
            className={`card-lift group relative h-full min-h-52 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-gradient-to-b p-5 text-center backdrop-blur-sm transition-all duration-300 ${mood.tone} ${
              selectedMood === mood.id
                ? 'border-white/50 outline outline-2 outline-white/35 shadow-[0_16px_34px_rgba(0,0,0,0.4)]'
                : `${mood.border} hover:border-white/28`
            }`}
          >
            <div className='relative flex h-16 w-16 items-center justify-center rounded-full bg-white/5 transition-all duration-300 group-hover:bg-white/10'>
              <mood.Icon
                className={`h-8 w-8 ${mood.iconColor} transition-transform duration-300 group-hover:scale-110`}
                strokeWidth={1.75}
                aria-hidden='true'
              />
            </div>
            <div className='mx-auto max-w-[24ch] px-1'>
              <span className='block w-full text-base font-bold text-white'>{mood.name}</span>
              <span className='mt-1.5 block w-full whitespace-normal break-words text-xs leading-relaxed text-white/65'>
                {mood.description}
              </span>
            </div>
          </Button>
        ))}
      </div>

      <div className='flex w-full flex-wrap items-center justify-center gap-4'>
        <Button asChild variant='outline' size='lg' className='h-12 min-w-[220px] rounded-xl border-white/18 bg-white/5 px-8 text-base font-semibold text-white/85 hover:bg-white/12 hover:text-white'>
          <Link href='/'>Back to Home</Link>
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedMood}
          size='lg'
          className='h-12 min-w-[220px] rounded-xl px-8 text-base font-semibold'
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

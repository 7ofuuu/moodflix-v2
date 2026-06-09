'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Mood } from '@/types/components';

const MOODS: Mood[] = [
  { id: 'happy',       name: 'Happy',       Icon: Smile,    iconColor: 'text-amber-400',   description: 'Bright stories with uplifting energy' },
  { id: 'sad',         name: 'Melancholic', Icon: CloudRain, iconColor: 'text-sky-400',     description: 'Tender stories for emotional reflection' },
  { id: 'excited',     name: 'Thrilled',    Icon: Zap,      iconColor: 'text-rose-400',    description: 'Fast-paced stories full of sparks' },
  { id: 'cozy',        name: 'Cozy',        Icon: Coffee,   iconColor: 'text-orange-400',  description: 'Warm comfort movies for calm nights' },
  { id: 'nostalgic',   name: 'Nostalgic',   Icon: Sparkles, iconColor: 'text-violet-400',  description: 'Classic feelings and timeless moments' },
  { id: 'scattered',   name: 'Scattered',   Icon: Wind,     iconColor: 'text-slate-400',   description: 'Grounding movies to reset your focus' },
  { id: 'romantic',    name: 'Romantic',    Icon: Heart,    iconColor: 'text-rose-400',    description: 'Heartfelt stories and intimate chemistry' },
  { id: 'adventurous', name: 'Adventurous', Icon: Compass,  iconColor: 'text-emerald-400', description: 'Epic journeys and daring missions' },
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

      <div className='mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {MOODS.map(mood => (
          <Card
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`card-lift relative cursor-pointer rounded-2xl border bg-gradient-to-b from-slate-900/95 via-blue-950/72 to-slate-900/90 backdrop-blur-sm transition-all duration-300 ${
              selectedMood === mood.id
                ? 'border-white/52 shadow-[0_18px_36px_rgba(0,0,0,0.42)]'
                : 'border-white/14 hover:border-white/28'
            }`}
          >
            <CardHeader className='px-5 py-5 md:px-6'>
              <div className='flex items-start gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8'>
                  <mood.Icon
                    className={`h-5 w-5 ${mood.iconColor}`}
                    strokeWidth={1.75}
                    aria-hidden='true'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <CardTitle className='line-clamp-1 break-words text-xl text-white'>{mood.name}</CardTitle>
                  <CardDescription className='mt-1.5 max-w-[34ch] whitespace-normal break-words pr-2 leading-relaxed text-white/68'>
                    {mood.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='flex w-full flex-wrap items-center justify-center gap-4'>
        <Button
          asChild
          variant='outline'
          size='lg'
          className='h-12 w-[220px] shrink-0 rounded-xl border-white/18 bg-white/5 px-8 text-base font-semibold text-white/85 hover:bg-white/12 hover:text-white'
        >
          <Link href='/'>Back to Home</Link>
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedMood}
          size='lg'
          className='h-12 w-[220px] shrink-0 rounded-xl bg-white px-8 text-base font-semibold text-black hover:bg-white/92'
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

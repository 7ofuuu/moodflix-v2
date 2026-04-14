'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

const MOODS: Mood[] = [
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'sad', name: 'Melancholic', emoji: '😔' },
  { id: 'excited', name: 'Thrilled', emoji: '🤩' },
  { id: 'cozy', name: 'Cozy', emoji: '☕' },
  { id: 'nostalgic', name: 'Nostalgic', emoji: '🕰️' },
  { id: 'scattered', name: 'Scattered', emoji: '😵' },
  { id: 'romantic', name: 'Romantic', emoji: '💕' },
  { id: 'adventurous', name: 'Adventurous', emoji: '🚀' },
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: Dispatch<SetStateAction<string | null>>;
  onNext: () => void;
}

export function MoodSelector({ selectedMood, onMoodSelect, onNext }: MoodSelectorProps) {
  return (
    <div className='flex flex-col items-center gap-12'>
      <div className='text-center'>
        <h2 className='text-4xl font-bold mb-2'>What's your mood right now?</h2>
        <p className='text-muted-foreground'>Select the mood that best describes how you're feeling</p>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-2xl'>
        {MOODS.map(mood => (
          <Button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            variant={selectedMood === mood.id ? 'default' : 'outline'}
            className='h-32 flex-col gap-2 text-lg transition-all duration-200 hover:scale-105'
          >
            <span className='text-4xl'>{mood.emoji}</span>
            <span className='text-sm font-medium'>{mood.name}</span>
          </Button>
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={!selectedMood}
        size='lg'
        className='px-8 py-6 text-lg font-semibold'
      >
        Continue
      </Button>
    </div>
  );
}

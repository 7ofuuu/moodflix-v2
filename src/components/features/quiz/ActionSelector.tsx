'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Action {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ACTIONS: Action[] = [
  {
    id: 'stay',
    title: 'Stay in this mood',
    description: 'Find movies that match your current mood perfectly',
    icon: '😊',
  },
  {
    id: 'distract',
    title: 'I need a distraction',
    description: 'Get movies to take your mind off things',
    icon: '🎭',
  },
  {
    id: 'improve',
    title: 'I want to feel better',
    description: 'Movies to lift your spirits and improve your mood',
    icon: '💪',
  },
  {
    id: 'explore',
    title: 'Explore something different',
    description: 'Discover movies outside your usual preferences',
    icon: '🌍',
  },
];

interface ActionSelectorProps {
  selectedAction: string | null;
  onActionSelect: Dispatch<SetStateAction<string | null>>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ActionSelector({
  selectedAction,
  onActionSelect,
  onNext,
  onBack,
  isLoading = false,
}: ActionSelectorProps) {
  return (
    <div className='flex flex-col items-center gap-12'>
      <div className='text-center'>
        <h2 className='text-4xl font-bold mb-2'>What would you like?</h2>
        <p className='text-muted-foreground'>Choose what kind of movie experience you want</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl'>
        {ACTIONS.map(action => (
          <Card
            key={action.id}
            onClick={() => onActionSelect(action.id)}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedAction === action.id ? 'border-primary border-2 shadow-lg' : ''
            }`}
          >
            <CardHeader>
              <div className='flex items-start gap-3'>
                <span className='text-3xl'>{action.icon}</span>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{action.title}</CardTitle>
                  <CardDescription className='mt-1'>{action.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='flex gap-4 justify-center'>
        <Button onClick={onBack} variant='outline' size='lg' className='px-8' disabled={isLoading}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedAction || isLoading}
          size='lg'
          className='px-8 py-6 text-lg font-semibold'
        >
          {isLoading ? (
            <>
              <span className='inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></span>
              Loading...
            </>
          ) : (
            'Get Recommendations'
          )}
        </Button>
      </div>
    </div>
  );
}

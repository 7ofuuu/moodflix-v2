'use client';

import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MoreMoviesError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-black px-4'>
      <h2 className='mb-4 text-xl font-semibold text-white'>Something went wrong</h2>
      <p className='mb-6 max-w-md text-center text-sm text-white/50'>
        {error.message || 'An unexpected error occurred while loading movies.'}
      </p>
      <Button variant='outline' onClick={reset} className='rounded-full'>
        Try again
      </Button>
    </div>
  );
}

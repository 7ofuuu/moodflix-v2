'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MovieCard } from '@/components/ui/movie-card';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { MovieDetails } from '@/types/movie';

interface MovieRecommendationsProps {
  recommendations: MovieDetails[];
  error: string | null;
  source: 'gemini-hybrid' | 'tmdb-fallback' | null;
  onReset: () => void;
}

export function MovieRecommendations({
  recommendations,
  error,
  source,
  onReset,
}: MovieRecommendationsProps) {

  if (error) {
    return (
      <Card className='border-red-200 bg-red-50'>
        <CardHeader>
          <CardTitle className='text-red-900'>Something went wrong</CardTitle>
          <CardDescription className='text-red-800'>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onReset} variant='outline'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className='text-center'>
        <p className='text-muted-foreground mb-4'>No recommendations found</p>
        <Button onClick={onReset}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col items-center gap-12'>
      <div className='text-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <Film className='w-7 h-7 text-amber-400' strokeWidth={1.75} aria-hidden='true' />
          <h2 className='text-4xl font-bold'>Perfect movies for your mood!</h2>
        </div>
        <div className='mx-auto flex max-w-xl flex-col items-center gap-2'>
          <p className='text-muted-foreground'>
            Based on your mood and preference, here are personalized picks for tonight.
          </p>
          <span className='rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium dark:border-white/10 dark:bg-white/10'>
            {source === 'gemini-hybrid'
              ? 'Source: Gemini + TMDB hybrid ranking'
              : 'Source: TMDB fallback recommendations'}
          </span>
        </div>
      </div>

      <div className='mb-8 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5'>
        {recommendations.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className='flex gap-4 justify-center'>
        <Button onClick={onReset} variant='outline' size='lg'>
          Try Another Quiz
        </Button>
        <Button asChild size='lg' className='px-8'>
          <Link href='/?from=quiz'>Explore More</Link>
        </Button>
      </div>
    </div>
  );
}

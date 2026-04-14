'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MovieCard } from '@/components/ui/movie-card';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface MovieRecommendationsProps {
  recommendations: Movie[];
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

export function MovieRecommendations({
  recommendations,
  isLoading,
  error,
  onReset,
}: MovieRecommendationsProps) {
  if (isLoading) {
    return (
      <div className='flex flex-col items-center gap-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
        <div className='text-center'>
          <h3 className='text-xl font-semibold mb-2'>Finding perfect movies for you...</h3>
          <p className='text-muted-foreground'>Our AI is analyzing your mood and preferences</p>
        </div>
      </div>
    );
  }

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
    <div className='flex flex-col items-center gap-12'>
      <div className='text-center'>
        <h2 className='text-4xl font-bold mb-2'>Perfect movies for your mood! 🎬</h2>
        <p className='text-muted-foreground'>
          Based on your mood and preference, here are our AI-generated recommendations
        </p>
      </div>

      <div className='w-full grid grid-cols-1 md:grid-cols-5 gap-5 mb-8'>
        {recommendations.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className='flex gap-4 justify-center'>
        <Button onClick={onReset} variant='outline' size='lg'>
          Try Another Quiz
        </Button>
        <Button asChild size='lg' className='px-8'>
          <Link href='/popular'>Explore More</Link>
        </Button>
      </div>
    </div>
  );
}

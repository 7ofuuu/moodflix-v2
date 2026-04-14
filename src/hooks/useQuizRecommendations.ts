import { useState } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export function useQuizRecommendations() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (mood: string, action: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.movies || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching recommendations'
      );
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { recommendations, isLoading, error, getRecommendations };
}

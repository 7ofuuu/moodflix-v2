import { useState } from 'react';
import { MovieDetails } from '@/types/movie';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
} from '@/lib/mood';

interface RecommendationResponse {
  movies: MovieDetails[];
  source?: 'gemini-hybrid' | 'tmdb-fallback';
}

export function useQuizRecommendations() {
  const [recommendations, setRecommendations] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'gemini-hybrid' | 'tmdb-fallback' | null>(
    null
  );

  const getRecommendations = async (mood: string, action: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSource(null);
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

      const data = (await response.json()) as RecommendationResponse;
      setRecommendations(data.movies || []);
      setSource(data.source ?? null);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood);
        window.localStorage.setItem(LAST_ACTION_STORAGE_KEY, action);
        window.localStorage.setItem(LAST_MOOD_UPDATED_KEY, new Date().toISOString());
        window.dispatchEvent(
          new CustomEvent(LAST_MOOD_EVENT, {
            detail: {
              mood,
              action,
            },
          })
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching recommendations'
      );
      setRecommendations([]);
      setSource(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { recommendations, isLoading, error, source, getRecommendations };
}


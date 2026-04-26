import { useState } from 'react';
import { MovieDetails } from '@/types/movie';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
} from '@/lib/mood';
import { saveLastRecommendations } from '@/lib/last-recommendations';
import { supabase } from '@/lib/auth-client';
import { saveMoodHistory } from '@/lib/mood-history';
import { invalidateCache } from '@/lib/movie-cache';

interface RecommendationResponse {
  movies: MovieDetails[];
  source?: 'gemini-hybrid' | 'tmdb-fallback';
}

export function useQuizRecommendations() {
  const [recommendations, setRecommendations] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'gemini-hybrid' | 'tmdb-fallback' | null>(null);

  const getRecommendations = async (mood: string, action: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      setIsLoading(true);
      setError(null);
      setSource(null);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, action }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = (await response.json()) as RecommendationResponse;
      setRecommendations(data.movies || []);
      setSource(data.source ?? null);

      if (typeof globalThis.window !== 'undefined') {
        if ((data.movies ?? []).length > 0) {
          saveLastRecommendations({
            mood,
            action,
            movies: data.movies,
            source: 'quiz',
          });
        } else {
          globalThis.window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood);
          globalThis.window.localStorage.setItem(LAST_ACTION_STORAGE_KEY, action);
          globalThis.window.localStorage.setItem(LAST_MOOD_UPDATED_KEY, new Date().toISOString());
          globalThis.window.dispatchEvent(new CustomEvent(LAST_MOOD_EVENT, { detail: { mood, action } }));
        }
      }

      invalidateCache(mood);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        void saveMoodHistory(supabase, user.id, mood);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations');
      }
      setRecommendations([]);
      setSource(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return { recommendations, isLoading, error, source, getRecommendations };
}

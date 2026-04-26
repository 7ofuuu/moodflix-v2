import { MovieDetails } from '@/types/movie';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
  normalizeMood,
} from '@/lib/mood';

export const LAST_RECOMMENDATIONS_STORAGE_KEY = 'moodflix:lastRecommendations';

const MAX_STORED_RECOMMENDATIONS = 50;

export type RecommendationSource = 'quiz' | 'ai-chat';

export interface LastRecommendationsSnapshot {
  mood: string;
  action: string | null;
  movies: MovieDetails[];
  source: RecommendationSource;
  updatedAt: string;
}

interface SaveLastRecommendationsInput {
  mood: string;
  action?: string | null;
  movies: MovieDetails[];
  source: RecommendationSource;
}

function parseSnapshot(raw: string | null): LastRecommendationsSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as LastRecommendationsSnapshot;

    if (!parsed || !Array.isArray(parsed.movies) || typeof parsed.mood !== 'string') {
      return null;
    }

    return {
      mood: normalizeMood(parsed.mood),
      action: typeof parsed.action === 'string' ? parsed.action : null,
      movies: parsed.movies.slice(0, MAX_STORED_RECOMMENDATIONS),
      source: parsed.source === 'ai-chat' ? 'ai-chat' : 'quiz',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getLastRecommendations(): LastRecommendationsSnapshot | null {
  if (typeof globalThis.window === 'undefined') {
    return null;
  }

  return parseSnapshot(globalThis.window.localStorage.getItem(LAST_RECOMMENDATIONS_STORAGE_KEY));
}

export function saveLastRecommendations({
  mood,
  action = null,
  movies,
  source,
}: SaveLastRecommendationsInput): LastRecommendationsSnapshot | null {
  if (typeof globalThis.window === 'undefined') {
    return null;
  }

  if (!Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  const normalizedMood = normalizeMood(mood);
  const normalizedAction =
    typeof action === 'string' && action.trim().length > 0
      ? action.toLowerCase().trim()
      : null;

  const snapshot: LastRecommendationsSnapshot = {
    mood: normalizedMood,
    action: normalizedAction,
    movies: movies.slice(0, MAX_STORED_RECOMMENDATIONS),
    source,
    updatedAt: new Date().toISOString(),
  };

  globalThis.window.localStorage.setItem(
    LAST_RECOMMENDATIONS_STORAGE_KEY,
    JSON.stringify(snapshot)
  );
  globalThis.window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, normalizedMood);
  if (normalizedAction) {
    globalThis.window.localStorage.setItem(LAST_ACTION_STORAGE_KEY, normalizedAction);
  } else {
    globalThis.window.localStorage.removeItem(LAST_ACTION_STORAGE_KEY);
  }
  globalThis.window.localStorage.setItem(LAST_MOOD_UPDATED_KEY, snapshot.updatedAt);
  globalThis.window.dispatchEvent(
    new CustomEvent(LAST_MOOD_EVENT, {
      detail: {
        mood: normalizedMood,
        action: normalizedAction,
        source,
      },
    })
  );

  return snapshot;
}

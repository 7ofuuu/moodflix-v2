export const DEFAULT_MOOD = 'cozy' as const;

export const MOOD_GENRE_MAP: Record<string, number[]> = {
  happy: [35, 10751, 10402],
  sad: [18, 10749],
  excited: [28, 12, 53],
  cozy: [10751, 16, 35],
  nostalgic: [18, 10749, 36],
  scattered: [16, 35, 12],
  romantic: [10749, 35, 18],
  adventurous: [12, 28, 878],
};

export const VALID_ACTIONS = ['stay', 'distract', 'improve', 'explore'] as const;

export type ActionType = (typeof VALID_ACTIONS)[number];

export const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy',
  sad: 'Melancholic',
  excited: 'Thrilled',
  cozy: 'Cozy',
  nostalgic: 'Nostalgic',
  scattered: 'Scattered',
  romantic: 'Romantic',
  adventurous: 'Adventurous',
};

export const LAST_MOOD_STORAGE_KEY = 'moodflix:lastMood';
export const LAST_ACTION_STORAGE_KEY = 'moodflix:lastAction';
export const LAST_MOOD_UPDATED_KEY = 'moodflix:lastMoodUpdatedAt';
export const LAST_MOOD_EVENT = 'moodflix:lastMoodUpdated';

export function isMoodKey(mood: string | null | undefined): mood is keyof typeof MOOD_GENRE_MAP {
  if (!mood) {
    return false;
  }

  return mood in MOOD_GENRE_MAP;
}

export function normalizeMood(value: string | null | undefined) {
  const normalized = String(value ?? '').toLowerCase();
  return isMoodKey(normalized) ? normalized : DEFAULT_MOOD;
}

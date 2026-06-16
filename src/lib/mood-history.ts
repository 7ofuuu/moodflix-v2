import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import type { MoodHistoryRow } from '@/types/database';

export async function saveMoodHistory(
  supabase: SupabaseClient,
  userId: string,
  mood: string
): Promise<void> {
  const { error } = await supabase
    .from('user_mood_history')
    .insert({ user_id: userId, mood, movie_id: null });

  if (error) {
    logger.error('Failed to save mood history:', error);
  }
}

export async function fetchLastMood(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_mood_history')
    .select('mood')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<MoodHistoryRow>();

  if (error ?? !data) return null;
  return data.mood;
}

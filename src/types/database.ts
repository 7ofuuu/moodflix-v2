/**
 * Database schema types for Supabase
 */

export interface MoodHistoryRow {
  id: string;
  user_id: string;
  mood: string;
  action: string | null;
  timestamp: string;
  created_at: string;
}

export interface UserFavoriteRow {
  id: string;
  user_id: string;
  movie_id: number;
  created_at: string;
}

export interface UserWatchedMovieRow {
  id: string;
  user_id: string;
  movie_id: number;
  watched_at: string;
}

export interface UserWatchlistRow {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
}

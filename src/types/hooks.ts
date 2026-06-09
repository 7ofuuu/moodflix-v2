/**
 * Custom React hook types and parameters
 */

import type { MovieDetails, MovieReview } from './movie';

// useDiscoverMovies
export interface DiscoverParams {
  page: number;
  query?: string;
  sortBy?: string;
  genreId?: number;
  mood?: string;
  eraStart?: string;
  eraEnd?: string;
  watchProviders?: number[];
}

export interface DiscoverResult {
  movies: MovieDetails[];
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
}

// useMovieReviews
export interface ReviewParams {
  page: number;
  movieId?: number;
  sortBy?: string;
  genreId?: string;
  era?: string;
  minRating?: string;
}

export interface ReviewsResult {
  reviews: MovieReview[];
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
}

// useQuizRecommendations
export type RecommendationSource = 'quiz' | 'ai-chat';

export interface RecommendationResponse {
  movies: MovieDetails[];
  source: 'gemini-hybrid' | 'tmdb-fallback';
}

// useWatchlist
export interface WatchlistResult {
  watchlist: number[];
  isLoading: boolean;
  addMovie: (movieId: number) => Promise<void>;
  removeMovie: (movieId: number) => Promise<void>;
}

// useFavorites
export interface FavoritesResult {
  favorites: number[];
  isLoading: boolean;
  toggleFavorite: (movieId: number) => Promise<void>;
}

// useWatchedMovies
export interface WatchedMoviesResult {
  watchedMovies: number[];
  isLoading: boolean;
  markAsWatched: (movieId: number) => Promise<void>;
  removeFromWatched: (movieId: number) => Promise<void>;
}

// useWatchProviders
export interface WatchProvidersResult {
  providers: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

/**
 * API-related types for external services (TMDB, Gemini, etc.)
 */

export interface TmdbMovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genres?: Array<{ name: string }>;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TmdbVideo {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
}

export interface TmdbReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbReleaseDate {
  iso_3166_1: string;
  release_dates: { certification: string }[];
}

export interface TmdbMovieListItem {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}

export interface TmdbProviderResponse {
  [key: string]: unknown;
}

export interface TmdbMovieDetailResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  original_language: string;
  budget: number;
  revenue: number;
  credits: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
  videos: {
    results: TmdbVideo[];
  };
  reviews: {
    results: TmdbReview[];
  };
  keywords: {
    keywords: TmdbKeyword[];
  };
  release_dates: {
    results: TmdbReleaseDate[];
  };
}

export interface GeminiRecommendation {
  movieIds: number[];
  reasons: Array<{ id: number; reason: string }>;
}

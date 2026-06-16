/**
 * Component prop and internal types
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { MovieDetails, MovieReview } from './movie';
import type { SelectedMovie } from './page';

// Common component props
export interface HorizontalScrollSectionProps {
  readonly title: string;
  readonly href: string;
  readonly itemCount?: number;
  readonly children?: ReactNode;
}

// UI Components
export interface ComboboxOption {
  value: string;
  label: string;
}

export interface CircularGalleryItem {
  id: string | number;
  [key: string]: unknown;
}

export interface CircularGalleryProps {
  items: CircularGalleryItem[];
  onSelect?: (item: CircularGalleryItem) => void;
  autoRotate?: boolean;
}

// Component Props - Auth
export interface FormField {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text';
  placeholder: string;
}

export interface AuthFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
}

// Component Props - Features
export interface AddMovieSearchProps {
  onMovieSelect: (movie: MovieDetails) => void;
}

export interface WatchlistCardProps {
  movie: MovieDetails;
  onRemove?: (movieId: number) => void;
}

export interface WatchlistGridProps {
  movies: MovieDetails[];
  isLoading?: boolean;
  onRemove?: (movieId: number) => void;
}

export interface ReviewCardProps {
  review: MovieReview;
}

export interface ReviewsMovieSearchProps {
  onMovieSelect: (movie: SelectedMovie) => void;
}

export interface ReviewsFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedGenre: string;
  onGenreChange: (value: string) => void;
  selectedEra: string;
  onEraChange: (value: string) => void;
  minRating: string;
  onMinRatingChange: (value: string) => void;
}

export interface MoreMoviesFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedGenre: string;
  onGenreChange: (value: string) => void;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface MovieActionsProps {
  movieId: number;
  onAddToWatchlist?: () => void;
  onToggleFavorite?: (isFavorited: boolean) => void;
}

export interface MovieCastProps {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
}

export interface PopularPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Quiz Components
export interface Mood {
  id: string;
  name: string;
  Icon: LucideIcon;
  iconColor: string;
  description: string;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  iconColor: string;
}

export interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string | null) => void;
}

export interface ActionSelectorProps {
  selectedAction: string | null;
  onActionSelect: (action: string | null) => void;
}

export interface MovieRecommendationsProps {
  movies: MovieDetails[];
  isLoading: boolean;
}

// Error Components
export interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

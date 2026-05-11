/**
 * Page component types
 */

export interface MovieDetailParams {
  readonly id: string;
}

export interface SelectedMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

export type QuizStep = 'mood' | 'action' | 'results';

export type FavoriteMovie = {
  id: number;
  title: string;
  poster_path: string;
};

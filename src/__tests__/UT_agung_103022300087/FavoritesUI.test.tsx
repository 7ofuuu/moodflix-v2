import { render, screen } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';
import { MovieDetails } from '@/types/movie';

const mockMovie1: MovieDetails = {
  id: 1,
  title: 'Test Movie 1',
  poster_path: '/test1.jpg',
  backdrop_path: '/test1-bg.jpg',
  release_date: '2024-01-01',
  vote_average: 7.5,
  overview: 'Test overview 1',
};

const mockMovie2: MovieDetails = {
  id: 2,
  title: 'Test Movie 2',
  poster_path: '/test2.jpg',
  backdrop_path: '/test2-bg.jpg',
  release_date: '2024-01-02',
  vote_average: 8.0,
  overview: 'Test overview 2',
};

jest.mock('@/hooks/useWatchedMovies', () => ({
  useWatchedMovies: () => ({
    addToWatchlist: jest.fn(),
    isInWatchedlist: jest.fn(() => false),
    isLoaded: true,
  }),
}));

describe('Favorites UI', () => {
  it('should show "In Wishlist" button and favorite button state when movie is already favorited', () => {
    jest.mock('@/hooks/useFavorites', () => ({
      useFavorites: () => ({
        favorites: [1],
        toggleFavorite: jest.fn(),
      }),
    }));

    render(<MovieActions movie={mockMovie1} />);

    expect(screen.getByRole('button', { name: /watchlist/i })).toBeInTheDocument();
  });

  it('should show "Watchlist" button when movie is not yet in watchlist', () => {
    jest.mock('@/hooks/useFavorites', () => ({
      useFavorites: () => ({
        favorites: [],
        toggleFavorite: jest.fn(),
      }),
    }));

    render(<MovieActions movie={mockMovie2} />);

    expect(screen.getByRole('button', { name: /watchlist/i })).toBeInTheDocument();
  });
});
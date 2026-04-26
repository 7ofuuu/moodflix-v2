import { render, screen, fireEvent } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';
import { MovieDetails } from '@/types/movie';

// mock hook
const toggleFavoriteMock = jest.fn();

jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    toggleFavorite: toggleFavoriteMock,
  }),
}));

jest.mock('@/hooks/useWatchedMovies', () => ({
  useWatchedMovies: () => ({
    addToWatchlist: jest.fn(),
    isInWatchedlist: jest.fn(() => false),
    isLoaded: true,
  }),
}));

describe('Favorites Integration', () => {
  const mockMovie: MovieDetails = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test.jpg',
    backdrop_path: '/test-bg.jpg',
    release_date: '2024-01-01',
    vote_average: 7.5,
    overview: 'Test overview',
  };

  it('should call toggleFavorite when button clicked', () => {
    render(<MovieActions movie={mockMovie} />);

    // const button = screen.getByRole('button', { name: /watchlist/i });
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });

    fireEvent.click(favoriteButton);

    expect(toggleFavoriteMock).toHaveBeenCalledWith(1);
  });
});
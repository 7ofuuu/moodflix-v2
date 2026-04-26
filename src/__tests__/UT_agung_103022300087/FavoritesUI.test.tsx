import { render, screen } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';

// mock hook (favorited)
jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [1],
    toggleFavorite: jest.fn(),
  }),
}));

describe('Favorites UI', () => {
  it('should show "Favorited" when movie is already favorited', () => {
    render(<MovieActions movieId={1} />);

    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('should show "Favorite" when movie is not favorited', () => {
    render(<MovieActions movieId={2} />);

    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });
});
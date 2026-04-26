import { render, screen, fireEvent } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';

// mock hook
const toggleFavoriteMock = jest.fn();

jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    toggleFavorite: toggleFavoriteMock,
  }),
}));

describe('Favorites Integration', () => {
  it('should call toggleFavorite when button clicked', () => {
    render(<MovieActions movieId={1} />);

    const button = screen.getByText('Favorite');

    fireEvent.click(button);

    expect(toggleFavoriteMock).toHaveBeenCalledWith(1);
  });
});
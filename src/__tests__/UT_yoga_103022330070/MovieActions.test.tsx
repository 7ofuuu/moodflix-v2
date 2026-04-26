import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';
import { MovieDetails } from '@/types/movie';

const mockMovie: MovieDetails = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2024-01-01',
  vote_average: 7.5,
  overview: 'Test overview',
};

jest.mock('@/hooks/useFavorites', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  return {
    useFavorites: () => {
      const [favorites, setFavorites] = React.useState<number[]>([]);

      const toggleFavorite = (movieId: number) => {
        setFavorites((prev: number[]) => (prev.includes(movieId) ? prev.filter((id: number) => id !== movieId) : [...prev, movieId]));
      };

      return { favorites, isLoading: false, toggleFavorite };
    },
  };
});

jest.mock('@/hooks/useWatchedMovies', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  return {
    useWatchedMovies: () => {
      const [watchlist, setWatchlist] = React.useState<Array<{ id: number }>>([]);

      const addToWatchlist = (movie: MovieDetails) =>
        Promise.resolve().then(() => {
          setWatchlist(prev => (prev.some(item => item.id === movie.id) ? prev : [...prev, { id: movie.id }]));
        });

      const isInWatchedlist = (movieId: number) => watchlist.some(movie => movie.id === movieId);

      return { watchlist, addToWatchlist, isInWatchedlist, isLoaded: true };
    },
  };
});

jest.mock('lucide-react', () => {
  const icon = (name: string) => {
    const Icon = ({ className }: { className?: string }) => (
      <svg
        data-testid={`icon-${name}`}
        className={className}
      />
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    Bookmark: icon('Bookmark'),
    Heart: icon('Heart'),
    CheckCircle: icon('CheckCircle'),
  };
});

describe('MovieActions', () => {
  it('renders all three action buttons', () => {
    render(<MovieActions movie={mockMovie} />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Favorite')).toBeInTheDocument();
    expect(screen.getByText('Mark Watched')).toBeInTheDocument();
  });

  it('Watchlist button toggles to "In Wishlist" on click', () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Watchlist'));
    expect(screen.getByText('In Wishlist')).toBeInTheDocument();
  });

  it('Watchlist button toggles back to "Watchlist" on second click', () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Watchlist'));
    fireEvent.click(screen.getByText('In Wishlist'));
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('Favorite button toggles to "Favorited" on click', () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Favorite'));
    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('Favorite button toggles back to "Favorite" on second click', () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Favorite'));
    fireEvent.click(screen.getByText('Favorited'));
    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });

  it('Watched button toggles to "Watched" on click', async () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Mark Watched'));
    await waitFor(() => {
      expect(screen.getByText('Watched')).toBeInTheDocument();
    });
  });

  it('Watched button stays "Watched" on second click', async () => {
    render(<MovieActions movie={mockMovie} />);
    fireEvent.click(screen.getByText('Mark Watched'));
    await waitFor(() => {
      expect(screen.getByText('Watched')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Watched'));
    expect(screen.getByText('Watched')).toBeInTheDocument();
  });

  it('Watchlist button has amber styling when active', () => {
    render(<MovieActions movie={mockMovie} />);
    const btn = screen.getByText('Watchlist').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-amber-500');
  });

  it('Favorite button has rose styling when active', () => {
    render(<MovieActions movie={mockMovie} />);
    const btn = screen.getByText('Favorite').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-rose-500');
  });

  it('Watched button has emerald styling when active', async () => {
    render(<MovieActions movie={mockMovie} />);
    const btn = screen.getByText('Mark Watched').closest('button')!;
    fireEvent.click(btn);
    await waitFor(() => {
      expect(btn.className).toContain('bg-emerald-500');
    });
  });

  it('all three toggles work independently of each other', () => {
    render(<MovieActions movie={{ ...mockMovie, id: 99 }} />);
    fireEvent.click(screen.getByText('Watchlist'));
    fireEvent.click(screen.getByText('Favorite'));
    // Watched still not clicked
    expect(screen.getByText('In Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Favorited')).toBeInTheDocument();
    expect(screen.getByText('Mark Watched')).toBeInTheDocument();
  });
});
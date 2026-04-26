import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MovieActions } from '@/components/features/movie/MovieActions';

// Block the module-level throw in auth-client.ts by providing a mock supabase client.
// useAuth also imports auth-client, so mock it there too via useAuth mock.
jest.mock('@/lib/auth-client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

// Provide a fake authenticated user so useFavorites' toggleFavorite is not a no-op.
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, userProfile: null, isLoading: false }),
}));

jest.mock('lucide-react', () => {
  const icon = (name: string) => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className} />
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
    render(<MovieActions movieId={1} />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Favorite')).toBeInTheDocument();
    expect(screen.getByText('Mark Watched')).toBeInTheDocument();
  });

  it('Watchlist button toggles to "In Wishlist" on click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Watchlist'));
    expect(screen.getByText('In Wishlist')).toBeInTheDocument();
  });

  it('Watchlist button toggles back to "Watchlist" on second click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Watchlist'));
    fireEvent.click(screen.getByText('In Wishlist'));
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('Favorite button toggles to "Favorited" on click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Favorite'));
    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('Favorite button toggles back to "Favorite" on second click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Favorite'));
    fireEvent.click(screen.getByText('Favorited'));
    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });

  it('Watched button toggles to "Watched" on click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Mark Watched'));
    expect(screen.getByText('Watched')).toBeInTheDocument();
  });

  it('Watched button toggles back to "Mark Watched" on second click', () => {
    render(<MovieActions movieId={1} />);
    fireEvent.click(screen.getByText('Mark Watched'));
    fireEvent.click(screen.getByText('Watched'));
    expect(screen.getByText('Mark Watched')).toBeInTheDocument();
  });

  it('Watchlist button has amber styling when active', () => {
    render(<MovieActions movieId={1} />);
    const btn = screen.getByText('Watchlist').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-amber-500');
  });

  it('Favorite button has rose styling when active', () => {
    render(<MovieActions movieId={1} />);
    const btn = screen.getByText('Favorite').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-rose-500');
  });

  it('Watched button has emerald styling when active', () => {
    render(<MovieActions movieId={1} />);
    const btn = screen.getByText('Mark Watched').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-emerald-500');
  });

  it('all three toggles work independently of each other', () => {
    render(<MovieActions movieId={99} />);
    fireEvent.click(screen.getByText('Watchlist'));
    fireEvent.click(screen.getByText('Favorite'));
    // Watched still not clicked
    expect(screen.getByText('In Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Favorited')).toBeInTheDocument();
    expect(screen.getByText('Mark Watched')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import FavoritedMoviesPage from '@/app/(features)/favorited-movies/page';
import { supabase } from '@/lib/auth-client';

// ✅ MOCK SUPABASE
jest.mock('@/lib/auth-client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// ✅ MOCK NEXT NAVIGATION
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// ✅ MOCK UI COMPONENTS (FIX displayName)
jest.mock('@/components/ui/navbar', () => {
  const MockNavbar = () => <div>Navbar</div>;
  MockNavbar.displayName = 'MockNavbar';
  return MockNavbar;
});

jest.mock('@/components/ui/footer', () => {
  const MockFooter = () => <div>Footer</div>;
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});

jest.mock('@/components/ui/split-text', () => ({
  SplitText: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('@/components/ui/reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/movie-card', () => ({
  MovieCard: ({ movie }: { movie: { title: string } }) => (
    <div>{movie.title}</div>
  ),
}));

jest.mock('@/components/features/popular/PopularPagination', () => ({
  PopularPagination: () => <div>Pagination</div>,
}));

// ✅ MOCK FETCH
global.fetch = jest.fn();

describe('FavoritedMoviesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page title', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    render(<FavoritedMoviesPage />);

    expect(
      await screen.findByRole('heading', { name: /Favorite Movies/i })
    ).toBeInTheDocument();
  });

  it('should show login message when user is not logged in', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    render(<FavoritedMoviesPage />);

    expect(
      await screen.findByText(/You must be logged in/i)
    ).toBeInTheDocument();
  });

  it('should show empty state when no favorite movies', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [],
          error: null,
        }),
      }),
    });

    render(<FavoritedMoviesPage />);

    expect(
      await screen.findByText(/No favorite movies yet/i)
    ).toBeInTheDocument();
  });

  it('should render movies when favorites exist', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [{ movie_id: 1 }],
          error: null,
        }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        title: 'Test Movie',
        overview: 'test',
        poster_path: '/test.jpg',
      }),
    });

    render(<FavoritedMoviesPage />);

    expect(await screen.findByText(/Test Movie/i)).toBeInTheDocument();
  });
});
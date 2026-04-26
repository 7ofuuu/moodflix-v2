import { renderHook, act, waitFor } from '@testing-library/react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { MovieDetails } from '@/types/movie';

// Mock Supabase
jest.mock('@/lib/auth-client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      })),
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      }))
    }))
  }
}));

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
}));

// Mock fetchTmdb
jest.mock('@/lib/tmdb', () => ({
  fetchTmdb: jest.fn().mockResolvedValue({})
}));

const mockMovie: MovieDetails = {
  id: 1,
  title: 'Inception',
  poster_path: '/inception.jpg',
  backdrop_path: '/bg.jpg',
  release_date: '2010-07-15',
  vote_average: 8.8,
  overview: 'A thief who steals corporate secrets...',
};

describe('useWatchlist Hook with Supabase - UT_tubagus_103022300141', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with an empty watchlist', async () => {
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    expect(result.current.watchlist).toEqual([]);
  });

  it('should add a movie to the watchlist', async () => {
    const { result } = renderHook(() => useWatchlist());
    
    await act(async () => {
      await result.current.addToWatchlist(mockMovie);
    });

    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.watchlist[0].id).toBe(1);
  });

  it('should remove a movie from the watchlist', async () => {
    const { result } = renderHook(() => useWatchlist());
    
    await act(async () => {
      await result.current.addToWatchlist(mockMovie);
    });
    
    expect(result.current.watchlist).toHaveLength(1);

    await act(async () => {
      await result.current.removeFromWatchlist(1);
    });

    expect(result.current.watchlist).toHaveLength(0);
  });

  it('should check if a movie is in the watchlist', async () => {
    const { result } = renderHook(() => useWatchlist());
    
    await act(async () => {
      await result.current.addToWatchlist(mockMovie);
    });

    expect(result.current.isInWatchlist(1)).toBe(true);
    expect(result.current.isInWatchlist(2)).toBe(false);
  });
});

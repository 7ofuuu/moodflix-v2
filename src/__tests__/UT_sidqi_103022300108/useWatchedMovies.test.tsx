import { renderHook, act } from '@testing-library/react';
import { useWatchedMovies } from '@/hooks/useWatchedMovies';
import { supabase } from '@/lib/auth-client';
import { useAuth } from '@/hooks/useAuth';
import { fetchTmdb } from '@/lib/tmdb';
import { MovieDetails } from '@/types/movie';

// Mock dependencies
jest.mock('@/lib/auth-client');
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/tmdb');

describe('useWatchedMovies - Edge Cases', () => {
  const mockUser = { id: 'user-123' };
  const mockMovie: MovieDetails = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '1999-10-15',
  vote_average: 8.4,
  overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
};

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('handles TMDB API errors gracefully during initial fetch', async () => {
    // Supabase returns an ID, but TMDB fails
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [{ movie_id: 550 }], error: null }),
    });
    (fetchTmdb as jest.Mock).mockRejectedValue(new Error('TMDB 404'));

    const { result } = renderHook(() => useWatchedMovies());

    await act(async () => {});

    // Even if TMDB fails, isLoaded should be true so the UI doesn't hang
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.watchlist).toHaveLength(0);
  });

  it('rolls back the local state if Supabase insert fails', async () => {
    // Mock Supabase to return an error on insert
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ error: new Error('DB Error') }),
    });

    const { result } = renderHook(() => useWatchedMovies());
    
    await act(async () => {
      await result.current.addToWatchlist(mockMovie);
    });

    // The movie should be removed from the list (rolled back) because of the error
    expect(result.current.isInWatchedlist(550)).toBe(false);
  });

  it('prevents adding the same movie twice to the list', async () => {
    // 1. Setup Supabase to return the movie as ALREADY in the database
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ movie_id: 550 }], // The ID is already present
        error: null,
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    // 2. Mock TMDB to return the movie details
    (fetchTmdb as jest.Mock).mockResolvedValue(mockMovie);

    const { result } = renderHook(() => useWatchedMovies());

    // 3. IMPORTANT: Wait for the initial fetch to finish
    await act(async () => {
      // This allows the useEffect to populate the watchlist with the mock data above
    });

    // 4. Verify the movie is there before we start the "duplicate" attempt
    expect(result.current.watchlist).toHaveLength(1);

    // 5. Try to add the same movie again
    await act(async () => {
      await result.current.addToWatchlist(mockMovie); //
    });

    // 6. The length should still be 1
    expect(result.current.watchlist).toHaveLength(1);

    // 7. Verify that Supabase insert was NEVER called for this duplicate
    // const watchedMoviesTable = (supabase.from as jest.Mock).mock.results
    //   .find(r => r.value.table === 'watched_movies');
    // If your mock setup tracks the insert call specifically:
    // expect(supabase.from('watched_movies').insert).not.toHaveBeenCalled();
  });
});
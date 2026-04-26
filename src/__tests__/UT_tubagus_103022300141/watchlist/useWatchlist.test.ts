import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { MovieDetails } from '@/types/movie';

const mockMovie: MovieDetails = {
  id: 1,
  title: 'Inception',
  poster_path: '/inception.jpg',
  backdrop_path: '/bg.jpg',
  release_date: '2010-07-15',
  vote_average: 8.8,
  overview: 'A thief who steals corporate secrets...',
};

describe('useWatchlist Hook - UT_tubagus_103022300141', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with an empty watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.watchlist).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it('should add a movie to the watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.addToWatchlist(mockMovie);
    });

    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.watchlist[0].id).toBe(1);
    expect(JSON.parse(window.localStorage.getItem('moodflix_watchlist') || '[]')).toHaveLength(1);
  });

  it('should remove a movie from the watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.addToWatchlist(mockMovie);
    });
    
    expect(result.current.watchlist).toHaveLength(1);

    act(() => {
      result.current.removeFromWatchlist(1);
    });

    expect(result.current.watchlist).toHaveLength(0);
  });

  it('should check if a movie is in the watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.addToWatchlist(mockMovie);
    });

    expect(result.current.isInWatchlist(1)).toBe(true);
    expect(result.current.isInWatchlist(2)).toBe(false);
  });
});

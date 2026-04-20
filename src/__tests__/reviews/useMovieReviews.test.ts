import { renderHook, waitFor } from '@testing-library/react';
import { useMovieReviews } from '@/hooks/useMovieReviews';

const mockReviews = [
  {
    id: 'r1',
    author: 'Alice',
    author_details: { name: 'Alice', username: 'alice', avatar_path: null, rating: 8 },
    content: 'Great movie!',
    created_at: '2024-01-01T00:00:00.000Z',
    url: 'https://example.com/review/r1',
    movie_id: 1,
    movie_title: 'Test Movie',
    movie_poster_path: '/poster.jpg',
  },
];

function mockFetchSuccess(overrides: object = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reviews: mockReviews, totalPages: 3, ...overrides }),
  } as Response);
}

function mockFetchError(status = 500) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  } as Response);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useMovieReviews', () => {
  it('starts with isLoading true and resolves to reviews', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useMovieReviews({ page: 1 }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reviews).toEqual(mockReviews);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it('includes movie_id in query params when provided', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useMovieReviews({ page: 1, movieId: 42 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchCall).toContain('movie_id=42');
  });

  it('uses default sort_by when sortBy is omitted', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useMovieReviews({ page: 2 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchCall).toContain('sort_by=created_at.desc');
    expect(fetchCall).toContain('page=2');
  });

  it('sets error state when API returns a non-ok response', async () => {
    mockFetchError(404);
    const { result } = renderHook(() => useMovieReviews({ page: 1 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Failed to load reviews');
    expect(result.current.reviews).toEqual([]);
  });

  it('falls back to empty reviews and totalPages=1 when data fields are missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useMovieReviews({ page: 1 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reviews).toEqual([]);
    expect(result.current.totalPages).toBe(1);
  });
});

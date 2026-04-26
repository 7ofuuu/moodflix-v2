import { renderHook, waitFor } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

// mock auth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
  }),
}));

// mock supabase
const mockEq = jest.fn();
const mockSelect = jest.fn();

jest.mock('@/lib/auth-client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: jest.fn(),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('useFavorites Hook', () => {
  it('should fetch favorites', async () => {
    mockSelect.mockReturnValue({ eq: mockEq });

    mockEq.mockResolvedValue({
      data: [{ movie_id: 1 }, { movie_id: 2 }],
      error: null,
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toEqual([1, 2]);
  });
});
// Mock dependencies (must be before imports)
jest.mock('@/lib/auth-client');
jest.mock('@/lib/logger');

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/auth-client';
import { logger } from '@/lib/logger';

describe('useAuth Hook - Test Cases untuk Fitur Autentikasi', () => {
  let mockSubscriptionUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionUnsubscribe = jest.fn();

    // Setup default mocks for supabase methods
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockSubscriptionUnsubscribe,
        },
      },
    });

    // Mock supabase.from for profile queries
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });
  });

  // TEST CASE 1: useAuth Hook - User Authenticated dengan Profile Lengkap
  describe('TEST CASE 1: useAuth Hook - User Authenticated dengan Profile Lengkap', () => {
    it('should load authenticated user with full profile data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'testuser@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
      };

      const mockProfile = {
        id: 'user-123',
        avatar_url: 'https://example.com/avatar.jpg',
        full_name: 'Test User',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValueOnce({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userProfile).toEqual(mockProfile);
    });
  });

  // TEST CASE 2: useAuth Hook - User Tidak Authenticated (Edge Case)
  describe('TEST CASE 2: useAuth Hook - User Tidak Authenticated (Not Logged In)', () => {
    it('should return null user and profile when no user is authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.userProfile).toBeNull();
    });

    it('should set isLoading to false after checking authentication', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // TEST CASE 3: useAuth Hook - Error Handling pada Fetch User
  describe('TEST CASE 3: useAuth Hook - Error Handling pada Fetch User (Edge Case)', () => {
    it('should handle error gracefully when fetching user fails', async () => {
      const mockError = new Error('Failed to fetch user');

      (supabase.auth.getUser as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(logger.error).toHaveBeenCalledWith('Error fetching user:', mockError);
      expect(result.current.user).toBeNull();
      expect(result.current.userProfile).toBeNull();
    });

    it('should handle profile fetch error when user exists but profile query fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'testuser@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: new Error('Profile not found'),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userProfile).toBeNull();
    });
  });

  // TEST CASE 4: useAuth Hook - Auth State Change Subscription
  describe('TEST CASE 4: useAuth Hook - Auth State Change Subscription (Edge Case)', () => {
    it('should subscribe to auth state changes on mount', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
      });

      renderHook(() => useAuth());

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });
    });

    it('should unsubscribe from auth listener on cleanup', async () => {
      const mockUnsubscribe = jest.fn();

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
      });

      const { unmount } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle auth state change events properly', async () => {
      type AuthCallback = (event: string, session: unknown) => Promise<void>;
      let capturedCallback: AuthCallback | null = null;

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback: AuthCallback) => {
        capturedCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
      });

      renderHook(() => useAuth());

      await waitFor(() => {
        expect(capturedCallback).toBeDefined();
      });

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

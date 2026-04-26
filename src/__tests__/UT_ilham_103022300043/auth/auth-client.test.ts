// Mock must be at top level before imports
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  })),
}));

import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentUser,
  resetPassword,
  supabase,
} from '@/lib/auth-client';

describe('Auth Client - Test Cases untuk Fitur Autentikasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  // TEST CASE 1: Sign Up dengan Kredensial Valid
  describe('TEST CASE 1: Sign Up dengan Kredensial Valid', () => {
    it('should successfully sign up user dengan email, password, dan fullName yang valid', async () => {
      const mockUserData = {
        user: {
          id: 'user-123',
          email: 'testuser@example.com',
          user_metadata: {
            full_name: 'Test User',
          },
        },
        session: null,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
        error: null,
      });

      const result = await signUpWithEmail(
        'testuser@example.com',
        'SecurePassword123!',
        'Test User'
      );

      expect(result).toEqual(mockUserData);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });
  });

  // TEST CASE 2: Sign Up Edge Case - Email Format Tidak Valid
  describe('TEST CASE 2: Sign Up Edge Case - Email Format Tidak Valid dan Password Terlalu Pendek', () => {
    it('should throw error when email format is invalid', async () => {
      const errorMessage = 'Invalid email format';

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: errorMessage,
        },
      });

      await expect(
        signUpWithEmail('invalid-email', 'Password123!')
      ).rejects.toThrow(errorMessage);
    });

    it('should throw error when password is too short (edge case)', async () => {
      const errorMessage = 'Password should be at least 6 characters';

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: errorMessage,
        },
      });

      await expect(
        signUpWithEmail('user@example.com', '123')
      ).rejects.toThrow(errorMessage);
    });

    it('should allow sign up without fullName (edge case - optional parameter)', async () => {
      const mockUserData = {
        user: {
          id: 'user-456',
          email: 'testuser2@example.com',
        },
        session: null,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
        error: null,
      });

      const result = await signUpWithEmail(
        'testuser2@example.com',
        'SecurePassword123!'
      );

      expect(result).toEqual(mockUserData);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'testuser2@example.com',
        password: 'SecurePassword123!',
        options: {
          data: {
            full_name: undefined,
          },
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });
  });

  // TEST CASE 3: Sign In dengan Kredensial Tidak Valid
  describe('TEST CASE 3: Sign In dengan Kredensial Tidak Valid (Wrong Password & Non-existent User)', () => {
    it('should throw error when password is incorrect', async () => {
      const errorMessage = 'Invalid login credentials';

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: errorMessage,
        },
      });

      await expect(
        signInWithEmail('testuser@example.com', 'WrongPassword')
      ).rejects.toThrow(errorMessage);
    });

    it('should throw error when user does not exist (non-existent account)', async () => {
      const errorMessage = 'Invalid login credentials';

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: errorMessage,
        },
      });

      await expect(
        signInWithEmail('nonexistent@example.com', 'Password123!')
      ).rejects.toThrow(errorMessage);
    });

    it('should throw error when email is empty string (edge case)', async () => {
      const errorMessage = 'Email is required';

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: errorMessage,
        },
      });

      await expect(signInWithEmail('', 'Password123!')).rejects.toThrow(
        errorMessage
      );
    });

    it('should successfully sign in with valid credentials', async () => {
      const mockSessionData = {
        user: {
          id: 'user-123',
          email: 'testuser@example.com',
        },
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-123',
        },
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: mockSessionData,
        error: null,
      });

      const result = await signInWithEmail(
        'testuser@example.com',
        'CorrectPassword123!'
      );

      expect(result).toEqual(mockSessionData);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        password: 'CorrectPassword123!',
      });
    });
  });

  // TEST CASE 4: Get Current User - Ketika User Tidak Terautentikasi
  describe('TEST CASE 4: Get Current User - Edge Case Ketika User Tidak Terautentikasi', () => {
    it('should return null when no user is authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: {
          user: null,
        },
        error: null,
      });

      // Ini akan melempar error berdasarkan implementasi saat ini
      // Tapi kita perlu mock untuk menangani ini
      const mockGetUser = jest.fn().mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      (supabase.auth.getUser as jest.Mock) = mockGetUser;

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return authenticated user when session is valid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'testuser@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: {
          user: mockUser,
        },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should throw error when session expired or invalid', async () => {
      const errorMessage = 'Session expired';

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: {
          user: null,
        },
        error: {
          message: errorMessage,
        },
      });

      await expect(getCurrentUser()).rejects.toThrow(errorMessage);
    });
  });

  // Additional Tests: Sign Out dan Reset Password
  describe('Additional Tests: Sign Out dan Reset Password', () => {
    it('should successfully sign out user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const errorMessage = 'Sign out failed';

      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: {
          message: errorMessage,
        },
      });

      await expect(signOut()).rejects.toThrow(errorMessage);
    });

    it('should send reset password email to valid email', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await resetPassword('testuser@example.com');

      expect(
        supabase.auth.resetPasswordForEmail
      ).toHaveBeenCalledWith('testuser@example.com', {
        redirectTo: 'http://localhost:3000/auth/reset-password',
      });
    });

    it('should throw error when reset password email fails', async () => {
      const errorMessage = 'Email delivery failed';

      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
        error: {
          message: errorMessage,
        },
      });

      await expect(resetPassword('invalid@example.com')).rejects.toThrow(
        errorMessage
      );
    });
  });
});

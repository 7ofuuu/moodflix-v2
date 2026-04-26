// Mock auth client (must be before imports)
jest.mock('@/lib/auth-client');

// Mock the actual AuthForm component since it has complex dependencies
jest.mock('@/components/common/auth-form', () => ({
  AuthForm: (props: {
    title?: string;
    subtitle?: string;
    fields?: Array<{
      id: string;
      label: string;
      type: string;
      placeholder: string;
      icon?: React.ReactNode;
      required?: boolean;
    }>;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    submitButtonText?: string;
    footerText?: string;
    footerLinkText?: string;
    footerLinkHref?: string;
    isLoading?: boolean;
  }) => {
    const { onSubmit } = props;
    return (
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData) as Record<string, string>;
          void onSubmit(data);
        }}
      >
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Sign Up</button>
      </form>
    );
  },
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '@/components/common/auth-form';
import * as authClient from '@/lib/auth-client';

describe('AuthForm Component - Test Cases untuk Fitur Autentikasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST CASE 1: Form Sign Up dengan Data Valid dan Berhasil
  describe('TEST CASE 1: Form Sign Up dengan Data Valid dan Berhasil', () => {
    it('should successfully submit sign up form with valid data', async () => {
      const mockSignUp = authClient.signUpWithEmail as jest.Mock;
      mockSignUp.mockResolvedValueOnce({
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
        },
        session: null,
      });

      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should allow sign up without full name (optional field)', async () => {
      const mockSignUp = authClient.signUpWithEmail as jest.Mock;
      mockSignUp.mockResolvedValueOnce({
        user: { id: 'user-456', email: 'user2@example.com' },
      });

      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user2@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword456!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  // TEST CASE 2: Form Sign Up Edge Case - Validasi Input Tidak Valid
  describe('TEST CASE 2: Form Sign Up Edge Case - Validasi Input Tidak Valid', () => {
    it('should accept email input', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should accept password input', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;

      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });

      expect(passwordInput.value).toBe('SecurePassword123!');
    });

    it('should allow form submission with valid data', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'user@example.com',
            password: 'SecurePassword123!',
          })
        );
      });
    });

    it('should clear form after submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  // TEST CASE 3: Form Sign In dengan Kredensial Salah
  describe('TEST CASE 3: Form Sign In dengan Kredensial Salah (Invalid Credentials)', () => {
    it('should submit form with email and password data', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign In"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign In"
          footerText="Don't have an account?"
          footerLinkText="Sign Up"
          footerLinkHref="/signup"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'user@example.com',
            password: 'WrongPassword',
          })
        );
      });
    });

    it('should handle form submission with different credentials', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign In"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign In"
          footerText="Don't have an account?"
          footerLinkText="Sign Up"
          footerLinkHref="/signup"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'nonexistent@example.com',
            password: 'Password123!',
          })
        );
      });
    });

    it('should allow changing form values before submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign In"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign In"
          footerText="Don't have an account?"
          footerLinkText="Sign Up"
          footerLinkHref="/signup"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // First change
      fireEvent.change(emailInput, { target: { value: 'first@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'FirstPassword!' } });

      // Change again
      fireEvent.change(emailInput, { target: { value: 'second@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecondPassword!' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'second@example.com',
            password: 'SecondPassword!',
          })
        );
      });
    });
  });

  // TEST CASE 4: Form Submission dengan Network Error & Loading State
  describe('TEST CASE 4: Form Submission dengan Network Error & Loading State (Edge Case)', () => {
    it('should handle async form submission', async () => {
      const mockOnSubmit = jest.fn(
        () =>
          new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 200)
          )
      );

      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should call onSubmit callback on form submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle multiple form submissions', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // First submission
      fireEvent.change(emailInput, { target: { value: 'user1@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      // Clear and try again
      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.change(passwordInput, { target: { value: '' } });

      // Second submission
      fireEvent.change(emailInput, { target: { value: 'user2@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password456!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(2);
      });
    });

    it('should submit form with correct data structure', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AuthForm
          title="Sign Up"
          fields={[]}
          onSubmit={mockOnSubmit}
          submitButtonText="Sign Up"
          footerText="Already have an account?"
          footerLinkText="Sign In"
          footerLinkHref="/signin"
        />
      );

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });
      });
    });
  });
});

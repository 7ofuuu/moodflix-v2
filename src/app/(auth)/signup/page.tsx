'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/common/auth-form';
import { signUpWithEmail } from '@/lib/auth-client';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (data: Record<string, string>) => {
    setIsLoading(true);
    try {
      // Only send required fields to API
      await signUpWithEmail(data.email, data.password, data.fullName);
      // Redirect to confirmation pending page
      router.push('/confirmation-pending');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title='Join MoodFlix'
      subtitle='Create your account to discover movies based on your mood'
      fields={[
        {
          id: 'fullName',
          label: 'Full Name',
          type: 'text',
          placeholder: 'John Doe',
          required: true,
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
        },
        {
          id: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Create a strong password',
          required: true,
        },
        {
          id: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          placeholder: 'Confirm your password',
          required: true,
        },
      ]}
      onSubmit={handleSignUp}
      submitButtonText='Create Account'
      footerText='Already have an account?'
      footerLinkText='Sign in'
      footerLinkHref='/signin'
      isLoading={isLoading}
    />
  );
}

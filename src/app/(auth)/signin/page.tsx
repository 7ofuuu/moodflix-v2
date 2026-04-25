'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/common/auth-form';
import { signInWithEmail } from '@/lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (data: Record<string, string>) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title='Welcome Back'
      subtitle='Sign in to your MoodFlix account'
      fields={[
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
          placeholder: 'Enter your password',
          required: true,
        },
      ]}
      onSubmit={handleSignIn}
      submitButtonText='Sign In'
      footerText="Don't have an account?"
      footerLinkText='Sign up'
      footerLinkHref='/signup'
      isLoading={isLoading}
    />
  );
}

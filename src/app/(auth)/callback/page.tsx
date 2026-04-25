'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth-client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          setStatus('error');
          setMessage('No confirmation code found. Please check your email link.');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email');
          return;
        }

        setStatus('success');
        setMessage('Email confirmed successfully! Redirecting...');

        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const statusColorMap = { success: 'text-green-400', error: 'text-red-400', loading: 'text-white/60' } as const;
  const statusColor = statusColorMap[status];

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-purple-900/20 to-slate-950 px-4'>
      <div className='text-center'>
        <div className='mb-4 flex justify-center'>
          {status === 'loading' && (
            <div className='animate-spin'>
              <div className='w-12 h-12 border-4 border-white/20 border-t-amber-400 rounded-full' />
            </div>
          )}
          {status === 'success' && (
            <div className='w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center'>
              <span className='text-2xl text-green-400'>✓</span>
            </div>
          )}
          {status === 'error' && (
            <div className='w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center'>
              <span className='text-2xl text-red-400'>✕</span>
            </div>
          )}
        </div>

        <h1 className='text-2xl font-bold text-white mb-2'>Email Confirmation</h1>
        <p className={`text-lg ${statusColor}`}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}

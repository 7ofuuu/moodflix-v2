'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function ConfirmationPendingPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-purple-900/20 to-slate-950 px-4 py-12'>
      <Card className='w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10'>
        <div className='px-6 py-12 text-center'>
          {/* Icon */}
          <div className='mb-6 flex justify-center'>
            <div className='w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center'>
              <Mail className='w-8 h-8 text-amber-400' />
            </div>
          </div>

          {/* Content */}
          <h1 className='text-3xl font-bold text-white mb-3'>Check Your Email</h1>
          <p className='text-white/60 mb-6'>
            We&apos;ve sent a confirmation link to your email address. Click the link to verify your account and start using MoodFlix.
          </p>

          {/* Info box */}
          <div className='p-4 rounded-lg bg-white/5 border border-white/10 mb-6 text-left'>
            <p className='text-sm text-white/60 mb-2'>
              <span className='font-semibold text-white'>💡 Tip:</span>
            </p>
            <ul className='text-sm text-white/60 space-y-1'>
              <li>• Check your spam/junk folder if you don&apos;t see the email</li>
              <li>• The link expires in 24 hours</li>
              <li>• If you don&apos;t receive it, try signing up again</li>
            </ul>
          </div>

          {/* Actions */}
          <div className='space-y-3'>
            <Link href='/' className='block'>
              <Button className='w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold'>
                Go to Home
              </Button>
            </Link>
            <Link href='/signin' className='block'>
              <Button variant='outline' className='w-full'>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

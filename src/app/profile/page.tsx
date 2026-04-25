'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut, supabase } from '@/lib/auth-client';
import { Avatar } from '@/components/common/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';

interface HorizontalScrollSectionProps {
  title: string;
  href: string;
  itemCount?: number;
  children?: React.ReactNode;
}

function HorizontalScrollSection({ title, href, itemCount = 8, children }: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Generate unique IDs for placeholder cards
  const placeholderCards = useMemo(() => {
    return Array.from({ length: itemCount }, (_, index) => ({
      id: `card-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    }));
  }, [title, itemCount]);

  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h2 className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
            {title}
          </h2>
          <Link
            href={href}
            className='flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors'
          >
            See all
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => scroll('left')}
            className='p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors'
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className='p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors'
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className='flex gap-4 overflow-x-auto scrollbar-hide pb-2'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children || placeholderCards.map((card) => (
          <div
            key={card.id}
            className='flex-shrink-0 w-36 sm:w-40 md:w-44 aspect-[2/3] bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700/50 transition-colors'
          />
        ))}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (userProfile?.full_name) {
      setFullName(userProfile.full_name);
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto'></div>
          <p className='text-slate-400 mt-4'>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          bio: bio,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      logger.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout';
      setError(errorMessage);
      logger.error('Logout error:', err);
    }
  };

  return (
    <div className='min-h-screen bg-slate-950'>
      {/* Header Section */}
      <div className='bg-slate-950 border-b border-slate-800/50 sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between gap-6'>
            {/* Left: Avatar & Name */}
            <div className='flex items-center gap-4'>
              <div className='w-20 h-20 rounded-full ring-2 ring-slate-700 overflow-hidden flex-shrink-0'>
                <Avatar
                  avatarUrl={userProfile?.avatar_url}
                  fullName={userProfile?.full_name}
                  email={user?.email}
                  size='lg'
                  className='w-full h-full'
                />
              </div>
              <div>
                <h1 className='text-3xl font-black text-white'>
                  {fullName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className='text-slate-400 text-sm'>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className='flex gap-8 ml-auto'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-white'>0</div>
                <div className='text-xs text-slate-400 uppercase tracking-wider'>Films</div>
              </div>
            </div>

            {/* Right: Edit/Logout */}
            <div className='flex gap-2 ml-6'>
              <button
                onClick={() => setIsEditing(true)}
                className='p-2 hover:bg-slate-800/50 rounded-lg transition-colors'
                title='Edit profile'
              >
                <Edit2 size={20} className='text-slate-400 hover:text-amber-400' />
              </button>
              <button
                onClick={handleLogout}
                className='p-2 hover:bg-slate-800/50 rounded-lg transition-colors'
                title='Logout'
              >
                <LogOut size={20} className='text-slate-400 hover:text-red-400' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12'>
        {/* About Section */}
        <section>
          <h2 className='text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4'>
            About
          </h2>
          {isEditing ? (
            <div className='space-y-4'>
              <div>
                <label htmlFor='fullNameInput' className='block text-sm text-slate-300 mb-2'>
                  Name
                </label>
                <input
                  id='fullNameInput'
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder='Your name'
                  className='w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50'
                />
              </div>
              <div>
                <label htmlFor='bioInput' className='block text-sm text-slate-300 mb-2'>
                  Bio
                </label>
                <textarea
                  id='bioInput'
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder='Tell us about yourself...'
                  rows={4}
                  className='w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none'
                />
              </div>
              {error && (
                <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm'>
                  {error}
                </div>
              )}
              {successMessage && (
                <div className='p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm'>
                  {successMessage}
                </div>
              )}
              <div className='flex gap-3'>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className='bg-amber-500 hover:bg-amber-600 text-amber-950'
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(userProfile?.full_name || '');
                    setBio('');
                    setError('');
                  }}
                  variant='outline'
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-slate-300'>
              {bio || 'No bio added yet'}
            </div>
          )}
        </section>

        {/* Favorite Films */}
        <HorizontalScrollSection title='Favorite Films' href='/films' itemCount={8} />

        {/* Watched */}
        <HorizontalScrollSection title='Watched' href='/watched' itemCount={8} />

        {/* Watchlist */}
        <HorizontalScrollSection title='Watchlist' href='/watchlist' itemCount={8} />
      </div>
    </div>
  );
}


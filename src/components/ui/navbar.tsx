'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Film, LogOut, Settings } from 'lucide-react';
import { Button } from './button';
import { Avatar } from '@/components/common/avatar';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth-client';
import { logger } from '@/lib/logger';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/more-movies', label: 'More Movies' },
  { href: '/reviews', label: 'Reviews' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const router = useRouter();
  const { user, userProfile, isLoading } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => (globalThis.window === undefined ? 0 : globalThis.window.innerHeight));

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const scrolled = !isHome || scrollY > 60;
  const showBrand = !isHome || scrollY > viewportHeight * 0.55;

  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
      router.push('/');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const onScroll = () => {
      setScrollY(window.scrollY);
    };

    const onResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isHome]);

  const navBg = scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.04)]' : 'bg-transparent border-b border-transparent';
  const positionClass = isHome ? 'fixed' : 'sticky';

  return (
    <nav
        className={`${positionClass} top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
        role='navigation'
        aria-label='Main navigation'
      >
        <div className='container mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 md:px-7'>
          {/* Left: Brand */}
          <div className='flex items-center justify-self-start'>
            <Link
              href='/'
              className={`flex items-center gap-2 transition-all duration-500 ease-out ${showBrand ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
              aria-label='MoodFlix home'
            >
              <Film
                className='w-4 h-4 text-amber-400'
                aria-hidden='true'
              />
              <span className='text-base font-black tracking-[0.12em] uppercase text-white'>MoodFlix</span>
            </Link>
          </div>

          {/* Center: Desktop nav links */}
          <div className='hidden md:flex items-center gap-2 justify-self-center'>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative px-5 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                    isActive ? 'border-amber-400/50 text-white bg-white/10' : 'border-white/20 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/35'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span
                      className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400'
                      aria-hidden='true'
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Auth button / Avatar + Mobile menu */}
          <div className='flex items-center gap-3 justify-self-end'>
            {!isLoading && (
              <>
                {user && userProfile ? (
                  // Logged in - Desktop Avatar with dropdown
                  <div className='relative hidden md:block'>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className='flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-all'
                      aria-label='Profile menu'
                    >
                      <Avatar
                        avatarUrl={userProfile?.avatar_url}
                        fullName={userProfile?.full_name}
                        email={user?.email}
                        size='sm'
                      />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className='absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden'>
                        {/* Profile Info */}
                        <div className='px-4 py-3 border-b border-white/10'>
                          <div className='flex items-center gap-3'>
                            <Avatar
                              avatarUrl={userProfile?.avatar_url}
                              fullName={userProfile?.full_name}
                              email={user?.email}
                              size='md'
                            />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-white truncate'>{userProfile?.full_name || user?.email}</p>
                              <p className='text-xs text-white/60 truncate'>{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className='py-1'>
                          <Link
                            href='/profile'
                            onClick={() => setIsProfileOpen(false)}
                            className='flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors'
                          >
                            <Settings className='w-4 h-4' />
                            Profile Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className='w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors'
                          >
                            <LogOut className='w-4 h-4' />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Not logged in - Sign In button
                  <Link
                    href='/signin'
                    className='hidden md:flex'
                  >
                    <Button
                      variant='outline'
                      size='sm'
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className='inline-flex items-center justify-center rounded-full p-2 text-white/60 hover:bg-white/8 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 md:hidden'
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className='border-t border-white/8 bg-black/90 backdrop-blur-md px-4 py-3 space-y-1'>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/6 hover:text-white'}`}
                >
                  {label}
                </Link>
              );
            })}

            {!isLoading && (
              <>
                {user && userProfile ? (
                  // Logged in - Mobile profile menu
                  <div className='space-y-2 mt-3 pt-3 border-t border-white/10'>
                    <div className='px-4 py-3 flex items-center gap-3 bg-white/5 rounded-xl'>
                      <Avatar
                        avatarUrl={userProfile?.avatar_url}
                        fullName={userProfile?.full_name}
                        email={user?.email}
                        size='md'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-white truncate'>{userProfile?.full_name || user?.email}</p>
                        <p className='text-xs text-white/60 truncate'>{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href='/profile'
                      onClick={() => setIsMenuOpen(false)}
                      className='block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/6 rounded-xl transition-all'
                    >
                      <Settings className='w-4 h-4 inline mr-2' />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all'
                    >
                      <LogOut className='w-4 h-4 inline mr-2' />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  // Not logged in - Mobile sign in
                  <Link
                    href='/signin'
                    onClick={() => setIsMenuOpen(false)}
                    className='block w-full rounded-xl px-4 py-3 text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-all mt-2'
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
    </nav>
  );
}

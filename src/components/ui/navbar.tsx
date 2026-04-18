'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Film } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/more-movies', label: 'More Movies' },
  { href: '/reviews', label: 'Reviews' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerHeight
  );

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const scrolled = !isHome || scrollY > 60;
  const showBrand = !isHome || scrollY > viewportHeight * 0.55;

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

  const navBg = scrolled
    ? 'bg-black/85 backdrop-blur-md border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
    : 'bg-transparent border-b border-transparent';

  const positionClass = isHome ? 'fixed' : 'sticky';

  return (
    <>
      <nav
        className={`${positionClass} top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
        role='navigation'
        aria-label='Main navigation'
      >
        <div className='container mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 md:px-7'>

          {/* Left: Brand (appears on scroll on homepage, always on other pages) */}
          <div className='flex items-center justify-self-start'>
            <Link
              href='/'
              className={`flex items-center gap-2 transition-all duration-500 ease-out ${
                showBrand
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
              aria-label='MoodFlix home'
            >
              <Film className='w-4 h-4 text-amber-400' aria-hidden='true' />
              <span className='text-base font-black tracking-[0.12em] uppercase text-white'>
                MoodFlix
              </span>
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
                    isActive
                      ? 'border-amber-400/50 text-white bg-white/10'
                      : 'border-white/20 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/35'
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

          {/* Right: mobile menu button */}
          <div className='flex items-center justify-self-end md:hidden'>
            <button
              onClick={toggleMenu}
              className='inline-flex items-center justify-center rounded-full p-2 text-white/60 hover:bg-white/8 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60'
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>

          {/* Right placeholder for desktop */}
          <div className='hidden md:block h-8 justify-self-end' aria-hidden='true' />
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className='border-t border-white/8 bg-black/90 backdrop-blur-md px-4 py-3 space-y-1'>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

    </>
  );
}

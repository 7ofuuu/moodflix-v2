'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function isQuizPath(pathname: string) {
  return pathname === '/quiz' || pathname.startsWith('/quiz?') || pathname.startsWith('/quiz/');
}

export function ThemeController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const forceQuizDark = isQuizPath(pathname);
      const shouldUseDark = forceQuizDark || mediaQuery.matches;

      root.classList.toggle('dark', shouldUseDark);
      root.classList.toggle('quiz-dark-route', forceQuizDark);

      if (forceQuizDark) {
        root.dataset.themeMode = 'quiz-dark';
      } else if (mediaQuery.matches) {
        root.dataset.themeMode = 'system-dark';
      } else {
        root.dataset.themeMode = 'system-light';
      }
    };

    applyTheme();

    const onMediaChange = () => applyTheme();
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, [pathname]);

  return null;
}

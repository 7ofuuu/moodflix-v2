'use client';

import { LAST_MOOD_EVENT, LAST_MOOD_STORAGE_KEY, normalizeMood } from '@/lib/mood';
import { getCachedPosters, setCachedPosters } from '@/lib/movie-cache';
import { getLastRecommendations } from '@/lib/last-recommendations';
import { gsap } from 'gsap';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type GridItem = string | ReactNode;

interface TmdbMovieLite {
  id: number;
  poster_path: string | null;
}

interface GridMotionResponse {
  page: number;
  totalPages: number;
  movies: TmdbMovieLite[];
}

interface GridMotionProps {
  readonly items?: GridItem[];
  readonly gradientColor?: string;
  readonly onPostersReady?: () => void;
}

const ROW_COUNT = 6;
const COLUMN_COUNT = 10;
const TOTAL_ITEMS = ROW_COUNT * COLUMN_COUNT;
const MAX_FEED_PAGES = 6;
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';

const FALLBACK_ITEMS = Array.from({ length: TOTAL_ITEMS }, (_, index) => `Movie ${index + 1}`);

async function fetchMoodFeedPage(mood: string, page: number): Promise<GridMotionResponse | null> {
  try {
    const response = await fetch(`/api/movies/mood-feed?mood=${encodeURIComponent(mood)}&page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GridMotionResponse;
  } catch {
    return null;
  }
}

async function fetchNowPlayingPage(page: number): Promise<GridMotionResponse | null> {
  try {
    const response = await fetch(`/api/movies/now-playing?page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GridMotionResponse;
  } catch {
    return null;
  }
}

function extractPosterUrls(data: GridMotionResponse | null, dedupeSet: Set<string>) {
  if (!data) {
    return;
  }

  for (const movie of data.movies ?? []) {
    if (!movie.poster_path) {
      continue;
    }

    dedupeSet.add(`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`);
  }
}

function prependStoredRecommendationPosters(mood: string, dedupeSet: Set<string>) {
  const stored = getLastRecommendations();

  if (!stored || normalizeMood(stored.mood) !== mood) {
    return;
  }

  for (const movie of stored.movies) {
    if (!movie.poster_path) {
      continue;
    }

    dedupeSet.add(`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`);
  }
}

export default function GridMotion({ items = [], gradientColor = 'black', onPostersReady }: GridMotionProps) {
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mouseXRef = useRef(0);
  const [posterItems, setPosterItems] = useState<string[]>([]);
  const [activeMood, setActiveMood] = useState('cozy');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncMoodFromStorage = () => {
      const nextMood = normalizeMood(window.localStorage.getItem(LAST_MOOD_STORAGE_KEY));
      setActiveMood(nextMood);
      setRefreshTick(previous => previous + 1);
    };

    syncMoodFromStorage();

    window.addEventListener(LAST_MOOD_EVENT, syncMoodFromStorage as EventListener);
    window.addEventListener('storage', syncMoodFromStorage);

    return () => {
      window.removeEventListener(LAST_MOOD_EVENT, syncMoodFromStorage as EventListener);
      window.removeEventListener('storage', syncMoodFromStorage);
    };
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      return;
    }

    let cancelled = false;

    const loadPosters = async () => {
      const dedupedPosters = new Set<string>();
      prependStoredRecommendationPosters(activeMood, dedupedPosters);

      const cached = getCachedPosters(activeMood);
      if (cached && cached.length > 0) {
        for (const posterUrl of cached) {
          dedupedPosters.add(posterUrl);
        }

        if (dedupedPosters.size >= TOTAL_ITEMS) {
          if (!cancelled) {
            setPosterItems(Array.from(dedupedPosters).slice(0, TOTAL_ITEMS));
            onPostersReady?.();
          }
          return;
        }
      }

      let page = 1;
      let totalPages = 1;

      while (dedupedPosters.size < TOTAL_ITEMS && page <= totalPages && page <= MAX_FEED_PAGES) {
        const data = await fetchMoodFeedPage(activeMood, page);
        if (!data) {
          break;
        }
        totalPages = Math.max(1, data.totalPages ?? 1);
        extractPosterUrls(data, dedupedPosters);
        page += 1;
      }

      page = 1;
      totalPages = 1;

      while (dedupedPosters.size < TOTAL_ITEMS && page <= totalPages && page <= MAX_FEED_PAGES) {
        const data = await fetchNowPlayingPage(page);
        if (!data) {
          break;
        }
        totalPages = Math.max(1, data.totalPages ?? 1);
        extractPosterUrls(data, dedupedPosters);
        page += 1;
      }

      if (!cancelled) {
        const urls = Array.from(dedupedPosters).slice(0, TOTAL_ITEMS);
        setPosterItems(urls);
        setCachedPosters(activeMood, urls);
        onPostersReady?.();
      }
    };

    void loadPosters();

    return () => {
      cancelled = true;
    };
  }, [activeMood, items.length, onPostersReady, refreshTick]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    gsap.ticker.lagSmoothing(0);
    mouseXRef.current = window.innerWidth / 2;

    const handleMouseMove = (event: MouseEvent) => {
      mouseXRef.current = event.clientX;
    };

    const updateMotion = () => {
      const maxMoveAmount = window.innerWidth >= 1280 ? 90 : 55;
      const baseDuration = 0.7;
      const inertiaFactors = [0.38, 0.32, 0.26, 0.22, 0.18, 0.14];

      rowRefs.current.forEach((row, index) => {
        if (!row) {
          return;
        }

        const direction = index % 2 === 0 ? 1 : -1;
        const moveAmount =
          ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

        gsap.to(row, {
          x: moveAmount,
          duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    };

    gsap.ticker.add(updateMotion);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(updateMotion);
    };
  }, []);

  const combinedItems = useMemo(() => {
    const sourceItems = items.length > 0 ? items : posterItems.length > 0 ? posterItems : FALLBACK_ITEMS;

    if (sourceItems.length >= TOTAL_ITEMS) {
      return sourceItems.slice(0, TOTAL_ITEMS);
    }

    return [...sourceItems, ...FALLBACK_ITEMS].slice(0, TOTAL_ITEMS);
  }, [items, posterItems]);

  return (
    <div className='h-full w-full overflow-hidden'>
      <section
        className='relative flex h-full w-full items-center justify-center overflow-hidden'
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className='pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.12)_100%)]' />
        <div className='relative z-[2] grid h-full w-full grid-cols-1 grid-rows-6 gap-2 md:gap-3'>
          {[...Array(ROW_COUNT)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className='grid grid-cols-10 gap-2 md:gap-3'
              style={{ willChange: 'transform, filter' }}
              ref={element => {
                rowRefs.current[rowIndex] = element;
              }}
            >
              {[...Array(COLUMN_COUNT)].map((__, itemIndex) => {
                const content = combinedItems[rowIndex * COLUMN_COUNT + itemIndex];
                const cellKey = `cell-${rowIndex}-${itemIndex}`;
                const isImage = typeof content === 'string' && /^https?:\/\//.test(content);

                return (
                  <div key={cellKey} className='relative'>
                    <div className='relative h-full w-full overflow-hidden rounded-md bg-[#0a0a0a] md:rounded-lg'>
                      {isImage ? (
                        <>
                          <div
                            className='absolute left-0 top-0 h-full w-full bg-cover bg-center'
                            style={{ backgroundImage: `url(${content})` }}
                          />
                          <div className='absolute inset-0 bg-black/10' />
                        </>
                      ) : (
                        <div className='flex h-full w-full items-center justify-center p-3 text-center text-xs text-white'>
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

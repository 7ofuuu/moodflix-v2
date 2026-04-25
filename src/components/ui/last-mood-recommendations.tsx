'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { MovieDetails } from '@/types/movie';
import { GENRES } from '@/lib/constants';
import {
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  MOOD_LABELS,
  normalizeMood,
} from '@/lib/mood';
import CircularGallery, { CircularGalleryItem } from '@/components/ui/circular-gallery';

interface MoodFeedResponse {
  mood: string;
  page: number;
  totalPages: number;
  movies: MovieDetails[];
}

const AUTO_LOAD_LIMIT = 20;
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const FIXED_POSTER_WIDTH = 126;
const FIXED_POSTER_HEIGHT = 164;
const FIXED_GALLERY_STRIP_HEIGHT = 200;
const HIGHLIGHT_WIDTH = FIXED_POSTER_WIDTH + 1;
const HIGHLIGHT_HEIGHT = FIXED_POSTER_HEIGHT;
const HIGHLIGHT_RADIUS = 9;

const GENRE_ACCENT_RGB: Record<number, [number, number, number]> = {
  28: [255, 110, 95],
  35: [245, 192, 85],
  12: [98, 214, 160],
  16: [121, 202, 255],
  18: [146, 169, 255],
  27: [232, 94, 152],
  53: [255, 133, 109],
  878: [109, 190, 255],
  10749: [255, 138, 183],
  36: [206, 160, 255],
  10751: [130, 219, 176],
};

const posterAccentCache = new Map<string, [number, number, number]>();

function getFallbackAccent(movie: MovieDetails | null): [number, number, number] {
  if (!movie?.genre_ids || movie.genre_ids.length === 0) {
    return [251, 191, 36];
  }

  for (const genreId of movie.genre_ids) {
    if (GENRE_ACCENT_RGB[genreId]) {
      return GENRE_ACCENT_RGB[genreId];
    }
  }

  return [251, 191, 36];
}

function softenAccent([red, green, blue]: [number, number, number]): [number, number, number] {
  const blend = 0.22;
  return [
    Math.round(red * (1 - blend) + 255 * blend),
    Math.round(green * (1 - blend) + 208 * blend),
    Math.round(blue * (1 - blend) + 176 * blend),
  ];
}

async function extractPosterAccent(
  posterUrl: string,
  fallback: [number, number, number]
): Promise<[number, number, number]> {
  if (posterAccentCache.has(posterUrl)) {
    return posterAccentCache.get(posterUrl) ?? fallback;
  }

  const sampled = await new Promise<[number, number, number]>(resolve => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 36;
        canvas.height = 54;
        const context = canvas.getContext('2d');

        if (!context) {
          resolve(fallback);
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

        let red = 0;
        let green = 0;
        let blue = 0;
        let samples = 0;

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3];
          if (alpha < 140) {
            continue;
          }

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);

          if (maxChannel - minChannel < 28) {
            continue;
          }

          red += r;
          green += g;
          blue += b;
          samples += 1;
        }

        if (samples === 0) {
          resolve(fallback);
          return;
        }

        resolve([
          Math.round(red / samples),
          Math.round(green / samples),
          Math.round(blue / samples),
        ]);
      } catch {
        resolve(fallback);
      }
    };

    image.onerror = () => resolve(fallback);
    image.src = posterUrl;
  });

  posterAccentCache.set(posterUrl, sampled);
  return sampled;
}

async function fetchMoodFeedPage(mood: string, page: number): Promise<MoodFeedResponse> {
  const response = await fetch(`/api/movies/mood-feed?mood=${mood}&page=${page}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to load mood feed');
  return (await response.json()) as MoodFeedResponse;
}

export function LastMoodRecommendations() {
  // Start with default so SSR and initial client render match (hydration-safe)
  const [mood, setMood] = useState('cozy');
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayBackdrop, setDisplayBackdrop] = useState<string | null>(null);
  const [isBackdropReady, setIsBackdropReady] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [accentRgb, setAccentRgb] = useState<[number, number, number]>([251, 191, 36]);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);

  const moodLabel = useMemo(() => MOOD_LABELS[mood] ?? mood, [mood]);
  const canLoadMore = currentPage < totalPages && !isLoading;

  const galleryMovies = useMemo(() => movies.filter(movie => movie.poster_path), [movies]);

  const activeMovie = useMemo(
    () => (galleryMovies.length > 0 ? (galleryMovies[activeIndex % galleryMovies.length] ?? null) : null),
    [galleryMovies, activeIndex]
  );

  const genres = useMemo(() => {
    if (!activeMovie?.genre_ids) return [];
    return activeMovie.genre_ids
      .map(id => GENRES.find(g => g.id === id)?.name)
      .filter((n): n is string => Boolean(n))
      .slice(0, 3);
  }, [activeMovie]);

  const releaseYear = useMemo(() => {
    if (!activeMovie?.release_date) return null;
    const y = new Date(activeMovie.release_date).getFullYear();
    return Number.isNaN(y) ? null : y;
  }, [activeMovie]);

  // Viewport detection — slide-up on enter
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.06 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (!append) { setIsLoading(true); setError(null); }
      try {
        const data = await fetchMoodFeedPage(mood, page);
        setCurrentPage(data.page ?? page);
        setTotalPages(data.totalPages ?? 1);

        if (append) {
          setMovies(prev => {
            const merged = [...prev, ...(data.movies ?? [])];
            const deduped = new Map<number, MovieDetails>();
            for (const m of merged) deduped.set(m.id, m);
            return Array.from(deduped.values()).slice(0, AUTO_LOAD_LIMIT);
          });
        } else {
          const fetched = (data.movies ?? []).slice(0, AUTO_LOAD_LIMIT);
          setMovies(fetched);
          setActiveIndex(0);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load mood feed');
      } finally {
        setIsLoading(false);
      }
    },
    [mood]
  );

  useEffect(() => { void loadPage(1, false); }, [loadPage]);

  // Read localStorage after mount (SSR-safe)
  useEffect(() => {
    const syncMood = () => {
      const next = normalizeMood(window.localStorage.getItem(LAST_MOOD_STORAGE_KEY));
      setMood(prev => (prev === next ? prev : next));
    };
    syncMood(); // initial sync
    window.addEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
    window.addEventListener('storage', syncMood);
    return () => {
      window.removeEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
      window.removeEventListener('storage', syncMood);
    };
  }, []);

  useEffect(() => {
    if (galleryMovies.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(previous => ((previous % galleryMovies.length) + galleryMovies.length) % galleryMovies.length);
  }, [galleryMovies.length]);

  // Wait for selected backdrop to be fully loaded before enabling highlight
  useEffect(() => {
    if (!activeMovie?.backdrop_path) {
      setDisplayBackdrop(null);
      setIsBackdropReady(false);
      return;
    }

    setIsBackdropReady(false);
    const nextBackdrop = `${TMDB_BACKDROP_BASE}${activeMovie.backdrop_path}`;
    let cancelled = false;

    const image = new Image();
    image.onload = () => {
      if (cancelled) {
        return;
      }
      setDisplayBackdrop(nextBackdrop);
      requestAnimationFrame(() => setIsBackdropReady(true));
    };
    image.onerror = () => {
      if (cancelled) {
        return;
      }
      setDisplayBackdrop(nextBackdrop);
      requestAnimationFrame(() => setIsBackdropReady(true));
    };
    image.src = nextBackdrop;

    return () => {
      cancelled = true;
    };
  }, [activeMovie?.id, activeMovie?.backdrop_path]);

  // Derive reactive accent from poster palette (with genre fallback)
  useEffect(() => {
    if (!activeMovie?.poster_path) {
      setAccentRgb(softenAccent(getFallbackAccent(activeMovie)));
      return;
    }

    let cancelled = false;
    const fallback = getFallbackAccent(activeMovie);
    const posterUrl = `${TMDB_POSTER_BASE}${activeMovie.poster_path}`;

    void extractPosterAccent(posterUrl, fallback).then(sampled => {
      if (!cancelled) {
        setAccentRgb(softenAccent(sampled));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeMovie]);

  const handleActiveIndexChange = useCallback((index: number) => {
    setIsBackdropReady(false);
    setActiveIndex(index);
    // Load more when near end
    if (galleryMovies.length > 0 && index >= galleryMovies.length - 3 && canLoadMore) {
      void loadPage(currentPage + 1, true);
    }
  }, [galleryMovies.length, canLoadMore, currentPage, loadPage]);

  const galleryItems = useMemo((): CircularGalleryItem[] =>
    galleryMovies
      .map(m => ({
        image: `${TMDB_POSTER_BASE}${m.poster_path}`,
        text: m.title,
      })),
    [galleryMovies]
  );

  const showReactiveBacklight = isBackdropReady && !isInteracting && Boolean(activeMovie);

  return (
    <section
      ref={sectionRef}
      className='relative w-full min-h-[90vh] overflow-hidden'
      aria-labelledby='mood-rec-title'
    >
      {/* ── Dynamic backdrop background ── */}
      <div className='absolute inset-0 z-0' aria-hidden='true'>
        {displayBackdrop ? (
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: `url(${displayBackdrop})`,
              transition: 'opacity 1s ease',
            }}
          />
        ) : (
          <div className='absolute inset-0 bg-zinc-950' />
        )}
        {/* Layered dark overlays */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/58 via-black/48 to-black/22' />
        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/14 to-black/72' />
        <div className='absolute inset-0 film-grain opacity-20' />
      </div>

      {/* Top/bottom black blur for section transition */}
      <div className='pointer-events-none absolute inset-x-0 top-0 z-[5] h-8 bg-gradient-to-b from-black/28 via-black/8 to-transparent' aria-hidden='true' />
      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-8 bg-gradient-to-t from-black/28 via-black/8 to-transparent' aria-hidden='true' />

      {/* ── Content ── */}
      <div
        className={`relative z-10 flex flex-col min-h-[90vh] py-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ── Header + Active movie info ── */}
        <div className='px-6 md:px-14 lg:px-20 flex-1'>
          {/* Section label */}
          <div className='flex items-center gap-3 mb-6'>
            <span className='w-8 h-px bg-amber-400/60' />
            <span
              id='mood-rec-title'
              className='text-xs font-bold uppercase tracking-[0.22em] text-amber-400/80'
            >
              Based on Your Last Mood
            </span>
            <span className='px-2.5 py-0.5 rounded-full bg-white/8 text-white/60 text-xs font-medium border border-white/10 backdrop-blur-sm'>
              {moodLabel}
            </span>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className='space-y-3 max-w-xl'>
              <div className='h-10 w-80 bg-white/8 rounded-lg animate-pulse' />
              <div className='h-4 w-48 bg-white/6 rounded animate-pulse' />
              <div className='h-4 w-full max-w-md bg-white/5 rounded animate-pulse' />
              <div className='h-4 w-3/4 bg-white/4 rounded animate-pulse' />
            </div>
          )}

          {/* Active movie info */}
          {!isLoading && activeMovie && (
            <div className='max-w-2xl'>
              <h2 className='text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 line-clamp-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]'>
                {activeMovie.title}
              </h2>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60 mb-4'>
                {activeMovie.vote_average > 0 && (
                  <span className='flex items-center gap-1 text-amber-400'>
                    <Star className='w-3.5 h-3.5 fill-current' />
                    <span className='text-white/80 font-semibold'>
                      {activeMovie.vote_average.toFixed(1)}
                    </span>
                  </span>
                )}
                {releaseYear && (
                  <>
                    <span className='text-white/30'>•</span>
                    <span>{releaseYear}</span>
                  </>
                )}
                {genres.length > 0 && (
                  <>
                    <span className='text-white/30'>•</span>
                    <span>{genres.join(' / ')}</span>
                  </>
                )}
              </div>
              <p className='text-white/65 text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl'>
                {activeMovie.recommendation_reason || activeMovie.overview}
              </p>

              <div className='mt-5'>
                <a
                  href={`https://www.themoviedb.org/movie/${activeMovie.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center rounded-full border border-white/18 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white/14 hover:text-white'
                >
                  Film details on TMDB
                </a>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className='text-red-400/80 text-sm mt-4'>{error}</p>
          )}

          {!isLoading && movies.length === 0 && !error && (
            <p className='text-white/40 text-sm mt-4'>No mood-based recommendations yet.</p>
          )}
        </div>

        {/* ── CircularGallery strip ── */}
        {!isLoading && galleryItems.length > 0 && (
          <div
            className='relative mt-10 md:mt-12'
            style={{
              height: `${FIXED_GALLERY_STRIP_HEIGHT}px`,
              minHeight: `${FIXED_GALLERY_STRIP_HEIGHT}px`,
            }}
          >
            {/* Center spotlight frame — indicates the selected card */}
            <div
              className={`absolute top-1/2 left-1/2 z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 border border-white/45 transition-opacity duration-250 ${
                showReactiveBacklight ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                width: `${HIGHLIGHT_WIDTH}px`,
                height: `${HIGHLIGHT_HEIGHT}px`,
                borderRadius: `${HIGHLIGHT_RADIUS}px`,
                boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
              }}
              aria-hidden='true'
            />
            <div
              className={`absolute top-1/2 left-1/2 z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                showReactiveBacklight ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                width: `${HIGHLIGHT_WIDTH}px`,
                height: `${HIGHLIGHT_HEIGHT}px`,
                borderRadius: `${HIGHLIGHT_RADIUS}px`,
                border: `1.4px solid rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.86)`,
                background: `linear-gradient(180deg, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.14) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.04) 100%)`,
                boxShadow: `0 0 24px rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.3), 0 0 52px rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.18), inset 0 0 16px rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.14)`,
              }}
              aria-hidden='true'
            />

            <div
              className='h-full w-full'
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 8%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.65) 92%, transparent 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 8%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.65) 92%, transparent 100%)',
              }}
            >
              <CircularGallery
                items={galleryItems}
                bend={0.55}
                textColor='rgba(255,255,255,0.65)'
                borderRadius={0.06}
                font='bold 22px Sora, sans-serif'
                scrollSpeed={3}
                scrollEase={0.06}
                posterWidthPx={FIXED_POSTER_WIDTH}
                posterHeightPx={FIXED_POSTER_HEIGHT}
                onActiveIndexChange={handleActiveIndexChange}
                onInteractionChange={setIsInteracting}
              />
            </div>
          </div>
        )}

        {/* Skeleton gallery placeholder */}
        {isLoading && (
          <div
            className='relative mt-4 flex items-center justify-center gap-4 overflow-hidden px-6'
            style={{
              height: `${FIXED_GALLERY_STRIP_HEIGHT}px`,
              minHeight: `${FIXED_GALLERY_STRIP_HEIGHT}px`,
            }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className='flex-shrink-0 rounded-xl bg-white/6 animate-pulse'
                style={{
                  width: `${100 + Math.abs(3 - i) * -8}px`,
                  height: `${160 + Math.abs(3 - i) * -12}px`,
                  animationDelay: `${i * 80}ms`,
                  opacity: 1 - Math.abs(3 - i) * 0.15,
                }}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

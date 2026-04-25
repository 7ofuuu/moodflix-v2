# Mood History, Session Cache & Post-Quiz Loading Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist user mood to Supabase on quiz completion, cache poster URLs in localStorage for the active session, and show an animated loading screen (dots → "moodflix") after the quiz while the hero section hydrates.

**Architecture:** New `src/lib/mood-history.ts` owns all Supabase read/write for `user_mood_history`. New `src/lib/movie-cache.ts` owns localStorage TTL logic for poster URL caching. Both are called from existing hooks (`useQuizRecommendations`, `useAuth`) keeping changes minimal and testable.

**Tech Stack:** Next.js 16, React 19, Supabase JS v2, motion/react (new), TypeScript 5, Jest 30, @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| CREATE | `src/lib/mood-history.ts` | `saveMoodHistory`, `fetchLastMood` — Supabase helpers |
| CREATE | `src/lib/movie-cache.ts` | `getCachedPosters`, `setCachedPosters`, `invalidateCache`, `setSessionExpiry`, `clearMoodCache` |
| CREATE | `src/components/ui/quiz-loading-screen.tsx` | Animated overlay: bouncing dots → "moodflix" morph |
| CREATE | `src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts` | Unit tests for mood-history lib |
| CREATE | `src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx` | Tests for loading screen |
| MODIFY | `src/hooks/useQuizRecommendations.ts` | Call `saveMoodHistory` + `invalidateCache` on success |
| MODIFY | `src/hooks/useAuth.ts` | Restore mood + set session expiry on SIGNED_IN; clear cache on SIGNED_OUT |
| MODIFY | `src/components/ui/grid-motion.tsx` | Add `onPostersReady` prop + cache read/write + image size `w342` |
| MODIFY | `src/components/features/quiz/MovieRecommendations.tsx` | Change "Explore More" href to `/?from=quiz` |
| MODIFY | `src/app/page.tsx` | Mount `<QuizLoadingScreen>` when `?from=quiz` param is present |

---

## Task 1 — Install motion

**Files:** `package.json` (modified by npm)

- [ ] **Step 1: Install the package**

```bash
npm i motion
```

Expected: motion added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify import works**

```bash
node -e "require('motion/react'); console.log('ok')"
```

Expected: prints `ok` with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install motion for animated loading screen"
```

---

## Task 2 — Create `src/lib/movie-cache.ts`

**Files:**
- Create: `src/lib/movie-cache.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/movie-cache.ts
const CACHE_KEY_PREFIX = 'moodflix:movieCache:';
const SESSION_KEY = 'moodflix:movieCacheSession';
const ANON_TTL_MS = 30 * 60 * 1000;

interface MovieCacheEntry {
  urls: string[];
  cachedAt: number;
}

function parseEntry(raw: string | null): MovieCacheEntry | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MovieCacheEntry;
  } catch {
    return null;
  }
}

export function getCachedPosters(mood: string): string[] | null {
  if (typeof window === 'undefined') return null;
  const entry = parseEntry(window.localStorage.getItem(`${CACHE_KEY_PREFIX}${mood}`));
  if (!entry) return null;
  const sessionExpiry = window.localStorage.getItem(SESSION_KEY);
  if (sessionExpiry && Date.now() < Number(sessionExpiry)) return entry.urls;
  if (Date.now() < entry.cachedAt + ANON_TTL_MS) return entry.urls;
  return null;
}

export function setCachedPosters(mood: string, urls: string[]): void {
  if (typeof window === 'undefined') return;
  const entry: MovieCacheEntry = { urls, cachedAt: Date.now() };
  window.localStorage.setItem(`${CACHE_KEY_PREFIX}${mood}`, JSON.stringify(entry));
}

export function invalidateCache(mood: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${CACHE_KEY_PREFIX}${mood}`);
}

export function setSessionExpiry(expiresAtEpochSeconds: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, String(expiresAtEpochSeconds * 1000));
}

export function clearMoodCache(): void {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(window.localStorage).filter(k =>
    k.startsWith(CACHE_KEY_PREFIX)
  );
  keys.forEach(k => window.localStorage.removeItem(k));
  window.localStorage.removeItem(SESSION_KEY);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/movie-cache.ts
git commit -m "feat: add movie-cache lib for session-scoped poster URL caching"
```

---

## Task 3 — Create `src/lib/mood-history.ts`

**Files:**
- Create: `src/lib/mood-history.ts`

- [ ] **Step 1: Write failing test first**

Create `src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts`:

```typescript
// src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts
import { saveMoodHistory, fetchLastMood } from '@/lib/mood-history';
import type { SupabaseClient } from '@supabase/supabase-js';

function makeSupabase(overrides: Partial<{
  insertError: object | null;
  selectData: { mood: string } | null;
  selectError: object | null;
}> = {}) {
  const { insertError = null, selectData = null, selectError = null } = overrides;
  return {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: insertError }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: selectData, error: selectError }),
            }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe('saveMoodHistory', () => {
  it('inserts with correct user_id and mood', async () => {
    const sb = makeSupabase();
    await saveMoodHistory(sb, 'user-1', 'happy');
    expect(sb.from).toHaveBeenCalledWith('user_mood_history');
    const fromResult = (sb.from as jest.Mock).mock.results[0].value;
    expect(fromResult.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', mood: 'happy' })
    );
  });

  it('does not throw when Supabase returns an error', async () => {
    const sb = makeSupabase({ insertError: { message: 'db error' } });
    await expect(saveMoodHistory(sb, 'user-1', 'sad')).resolves.toBeUndefined();
  });
});

describe('fetchLastMood', () => {
  it('returns mood string from the first row', async () => {
    const sb = makeSupabase({ selectData: { mood: 'cozy' } });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBe('cozy');
  });

  it('returns null when no rows exist', async () => {
    const sb = makeSupabase({ selectError: { code: 'PGRST116' } });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBeNull();
  });

  it('returns null when data is null', async () => {
    const sb = makeSupabase({ selectData: null });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/mood-history'`

- [ ] **Step 3: Create `src/lib/mood-history.ts`**

```typescript
// src/lib/mood-history.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface MoodHistoryRow {
  mood: string;
}

export async function saveMoodHistory(
  supabase: SupabaseClient,
  userId: string,
  mood: string
): Promise<void> {
  const { error } = await supabase
    .from('user_mood_history')
    .insert({ user_id: userId, mood, movie_id: null });

  if (error) {
    logger.error('Failed to save mood history:', error);
  }
}

export async function fetchLastMood(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_mood_history')
    .select('mood')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<MoodHistoryRow>();

  if (error ?? !data) return null;
  return data.mood;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts --no-coverage
```

Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mood-history.ts src/__tests__/UT_gumi_103022300137/mood/mood-history.test.ts
git commit -m "feat: add mood-history lib with Supabase insert/fetch + tests"
```

---

## Task 4 — Modify `useQuizRecommendations.ts`

**Files:**
- Modify: `src/hooks/useQuizRecommendations.ts`

- [ ] **Step 1: Apply changes**

Replace the entire file with:

```typescript
// src/hooks/useQuizRecommendations.ts
import { useState } from 'react';
import { MovieDetails } from '@/types/movie';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
} from '@/lib/mood';
import { supabase } from '@/lib/auth-client';
import { saveMoodHistory } from '@/lib/mood-history';
import { invalidateCache } from '@/lib/movie-cache';

interface RecommendationResponse {
  movies: MovieDetails[];
  source?: 'gemini-hybrid' | 'tmdb-fallback';
}

export function useQuizRecommendations() {
  const [recommendations, setRecommendations] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'gemini-hybrid' | 'tmdb-fallback' | null>(null);

  const getRecommendations = async (mood: string, action: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSource(null);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = (await response.json()) as RecommendationResponse;
      setRecommendations(data.movies || []);
      setSource(data.source ?? null);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood);
        window.localStorage.setItem(LAST_ACTION_STORAGE_KEY, action);
        window.localStorage.setItem(LAST_MOOD_UPDATED_KEY, new Date().toISOString());
        window.dispatchEvent(new CustomEvent(LAST_MOOD_EVENT, { detail: { mood, action } }));
      }

      invalidateCache(mood);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        void saveMoodHistory(supabase, user.id, mood);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching recommendations'
      );
      setRecommendations([]);
      setSource(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { recommendations, isLoading, error, source, getRecommendations };
}
```

- [ ] **Step 2: Run existing quiz tests to confirm no regressions**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --no-coverage
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuizRecommendations.ts
git commit -m "feat: save mood to Supabase and invalidate poster cache on quiz completion"
```

---

## Task 5 — Modify `useAuth.ts`

**Files:**
- Modify: `src/hooks/useAuth.ts`

- [ ] **Step 1: Apply changes**

Replace the entire file with:

```typescript
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/auth-client';
import { logger } from '@/lib/logger';
import { fetchLastMood } from '@/lib/mood-history';
import { setSessionExpiry, clearMoodCache } from '@/lib/movie-cache';
import { LAST_MOOD_EVENT, LAST_MOOD_STORAGE_KEY } from '@/lib/mood';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setUserProfile(data);
        }
      } catch (error) {
        logger.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUserProfile(data);
        } else {
          setUserProfile(null);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          if (session.expires_at) {
            setSessionExpiry(session.expires_at);
          }
          const mood = await fetchLastMood(supabase, session.user.id);
          if (mood !== null && typeof window !== 'undefined') {
            window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood);
            window.dispatchEvent(new CustomEvent(LAST_MOOD_EVENT, { detail: { mood } }));
          }
        }

        if (event === 'SIGNED_OUT') {
          clearMoodCache();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, userProfile, isLoading };
}
```

- [ ] **Step 2: Run all tests to confirm no regressions**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: restore last mood from DB on login, sync session expiry and clear cache on logout"
```

---

## Task 6 — Modify `src/components/ui/grid-motion.tsx`

**Files:**
- Modify: `src/components/ui/grid-motion.tsx`

- [ ] **Step 1: Update TMDB image URL constant (line 29) and add prop + cache logic**

Change line 29:
```typescript
// BEFORE
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

// AFTER
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
```

Change the `GridMotionProps` interface (add `onPostersReady`):
```typescript
// BEFORE
interface GridMotionProps {
  items?: GridItem[];
  gradientColor?: string;
}

// AFTER
interface GridMotionProps {
  items?: GridItem[];
  gradientColor?: string;
  onPostersReady?: () => void;
}
```

Change the function signature:
```typescript
// BEFORE
export default function GridMotion({ items = [], gradientColor = 'black' }: GridMotionProps) {

// AFTER
export default function GridMotion({ items = [], gradientColor = 'black', onPostersReady }: GridMotionProps) {
```

Add imports at top of file (after existing imports):
```typescript
import { getCachedPosters, setCachedPosters } from '@/lib/movie-cache';
```

Replace the `loadPosters` function body inside the second `useEffect` (the one that depends on `[activeMood, items.length]`):
```typescript
// BEFORE
const loadPosters = async () => {
  const dedupedPosters = new Set<string>();
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
    setPosterItems(Array.from(dedupedPosters).slice(0, TOTAL_ITEMS));
  }
};

// AFTER
const loadPosters = async () => {
  const cached = getCachedPosters(activeMood);
  if (cached && cached.length > 0) {
    if (!cancelled) {
      setPosterItems(cached.slice(0, TOTAL_ITEMS));
      onPostersReady?.();
    }
    return;
  }

  const dedupedPosters = new Set<string>();
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
```

- [ ] **Step 2: Run all tests**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/grid-motion.tsx
git commit -m "feat: add poster URL session cache and onPostersReady callback to GridMotion"
```

---

## Task 7 — Create `src/components/ui/quiz-loading-screen.tsx`

**Files:**
- Create: `src/components/ui/quiz-loading-screen.tsx`

- [ ] **Step 1: Write failing test first**

Create directory and file `src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx`:

```typescript
// src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { QuizLoadingScreen } from '@/components/ui/quiz-loading-screen';

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...rest}>{children}</div>
    ),
    span: ({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...rest}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('QuizLoadingScreen', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders 8 dot elements on mount', () => {
    render(<QuizLoadingScreen isReady={false} onDismiss={jest.fn()} />);
    const dots = screen.getAllByTestId('loader-dot');
    expect(dots).toHaveLength(8);
  });

  it('renders moodflix characters', () => {
    render(<QuizLoadingScreen isReady={false} onDismiss={jest.fn()} />);
    expect(screen.getByLabelText('Loading your recommendations')).toBeInTheDocument();
  });

  it('does not call onDismiss before 800ms even when isReady is true', () => {
    const onDismiss = jest.fn();
    render(<QuizLoadingScreen isReady={true} onDismiss={onDismiss} />);
    act(() => { jest.advanceTimersByTime(500); });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss after 800ms when isReady is true', () => {
    const onDismiss = jest.fn();
    render(<QuizLoadingScreen isReady={true} onDismiss={onDismiss} />);
    act(() => { jest.advanceTimersByTime(900); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/ui/quiz-loading-screen'`

- [ ] **Step 3: Create the component**

```typescript
// src/components/ui/quiz-loading-screen.tsx
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const LETTERS = 'moodflix'.split('');
const MIN_DISPLAY_MS = 800;
const PHASE_TRANSITION_MS = 1200;

export interface QuizLoadingScreenProps {
  isReady: boolean;
  onDismiss: () => void;
}

function LoaderDots() {
  return (
    <div className="flex items-center gap-3">
      {LETTERS.map((_, i) => (
        <motion.div
          key={i}
          data-testid="loader-dot"
          className="h-3 w-3 rounded-full bg-neutral-400"
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'loop',
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function LoaderText() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center"
    >
      {LETTERS.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block text-4xl font-black tracking-tight text-white select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            opacity: { delay: i * 0.05 + 0.1, duration: 0.3 },
            scale: {
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'loop',
              delay: i * 0.05,
              ease: 'easeInOut',
              repeatDelay: 1.5,
            },
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function QuizLoadingScreen({ isReady, onDismiss }: QuizLoadingScreenProps) {
  const [phase, setPhase] = useState<'dots' | 'text'>('dots');
  const [visible, setVisible] = useState(true);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const phaseTimer = setTimeout(() => setPhase('text'), PHASE_TRANSITION_MS);
    const dismissTimer = setTimeout(() => setCanDismiss(true), MIN_DISPLAY_MS);
    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  useEffect(() => {
    if (isReady && canDismiss) {
      setVisible(false);
    }
  }, [isReady, canDismiss]);

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {visible && (
        <motion.div
          key="quiz-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          aria-live="polite"
          aria-label="Loading your recommendations"
        >
          <AnimatePresence mode="wait">
            {phase === 'dots' ? (
              <motion.div key="dots" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <LoaderDots />
              </motion.div>
            ) : (
              <motion.div key="text">
                <LoaderText />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx --no-coverage
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/quiz-loading-screen.tsx src/__tests__/UT_gumi_103022300137/ui/quiz-loading-screen.test.tsx
git commit -m "feat: add QuizLoadingScreen with dot-to-moodflix morph animation"
```

---

## Task 8 — Modify `MovieRecommendations.tsx` (trigger navigation)

**Files:**
- Modify: `src/components/features/quiz/MovieRecommendations.tsx`

- [ ] **Step 1: Change "Explore More" link to navigate with `?from=quiz`**

In `src/components/features/quiz/MovieRecommendations.tsx`, find the "Explore More" button block (lines 91–93):

```tsx
// BEFORE
<Button asChild size='lg' className='px-8'>
  <Link href='/#last-mood-recommendations'>Explore More</Link>
</Button>

// AFTER
<Button asChild size='lg' className='px-8'>
  <Link href='/?from=quiz'>Explore More</Link>
</Button>
```

- [ ] **Step 2: Run all tests**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/quiz/MovieRecommendations.tsx
git commit -m "feat: navigate to homepage with ?from=quiz on Explore More click"
```

---

## Task 9 — Modify `src/app/page.tsx` (mount loading screen)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports and loading screen state**

Add these imports at the top of `src/app/page.tsx` (after existing imports):

```tsx
import { useSearchParams, useRouter } from 'next/navigation';
import { QuizLoadingScreen } from '@/components/ui/quiz-loading-screen';
```

- [ ] **Step 2: Add state and handlers inside the `Home` component**

Add after `const [isMoodDropdownExpanded, setIsMoodDropdownExpanded] = useState(false);`:

```tsx
const searchParams = useSearchParams();
const router = useRouter();
const [showLoader, setShowLoader] = useState(
  () => searchParams.get('from') === 'quiz'
);
const [postersReady, setPostersReady] = useState(false);
```

- [ ] **Step 3: Update GridMotion to pass `onPostersReady`**

Find the GridMotion usage (inside the hero section):

```tsx
// BEFORE
<GridMotion gradientColor='rgb(0 0 0 / 0.14)' />

// AFTER
<GridMotion
  gradientColor='rgb(0 0 0 / 0.14)'
  onPostersReady={() => setPostersReady(true)}
/>
```

- [ ] **Step 4: Add loading screen JSX before `</>` closing tag**

Just before the closing `</>` at the end of the component return (after `<AiChat />`):

```tsx
{showLoader && (
  <QuizLoadingScreen
    isReady={postersReady}
    onDismiss={() => {
      setShowLoader(false);
      router.replace('/');
    }}
  />
)}
```

- [ ] **Step 5: Wrap `Home` export in Suspense (required for `useSearchParams`)**

`useSearchParams` requires a Suspense boundary. Wrap the default export:

```tsx
// BEFORE
export default function Home() {
  ...
}

// AFTER
function HomeContent() {
  // (rename the existing Home function body to HomeContent — same code)
  ...
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
```

Add `Suspense` to the React import:
```tsx
// BEFORE
import { useEffect, useRef, useState } from 'react';

// AFTER
import { Suspense, useEffect, useRef, useState } from 'react';
```

- [ ] **Step 6: Run all tests**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: show QuizLoadingScreen on homepage when navigating from quiz"
```

---

## Task 10 — Full test suite verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests with coverage**

```bash
npx jest src/__tests__/UT_gumi_103022300137 --coverage --coverageReporters=text
```

Expected: all tests pass. `src/lib/mood-history.ts` line coverage ≥ 80%.

- [ ] **Step 2: Check TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete mood history, session cache and post-quiz loading screen"
```

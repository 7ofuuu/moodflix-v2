# Design: Mood History, Session Cache & Post-Quiz Loading Screen

**Date:** 2026-04-25  
**Branch:** dev_gumi  
**Author:** gmii

---

## Overview

Three coordinated features:
1. **Mood History** — persist the user's last mood to `user_mood_history` (Supabase) when they complete the quiz while logged in; restore it on next login.
2. **Session Cache** — cache movie poster URLs per-mood in localStorage for the duration of the Supabase auth session, so GridMotion hero renders instantly on repeat visits. Invalidated on every quiz completion and on logout.
3. **Post-Quiz Loading Screen** — full-screen overlay shown after quiz redirects to homepage, while GridMotion fetches/validates its poster cache. Animated: 8 bouncing dots morph into the word "moodflix" using `motion/react`.

---

## Architecture

### Approach: Extend existing hook + new lib module (Opsi A)

All Supabase mood-history calls are isolated in a new lib module. Hooks call that module — they never import Supabase directly for this feature.

```
src/
├── lib/
│   └── mood-history.ts          NEW — Supabase read/write for user_mood_history
├── hooks/
│   └── useQuizRecommendations.ts  MODIFIED — save mood to DB + invalidate cache
│   └── useAuth.ts                 MODIFIED — restore mood from DB on SIGNED_IN
├── components/ui/
│   └── quiz-loading-screen.tsx  NEW — animated overlay component
│   └── grid-motion.tsx          MODIFIED — read/write session cache
├── app/
│   └── page.tsx                 MODIFIED — detect ?from=quiz, mount overlay
└── __tests__/UT_gumi_103022300137/
    └── mood/
    │   └── mood-history.test.ts   NEW
    └── ui/
        └── quiz-loading-screen.test.tsx  NEW
```

---

## Section 1: Mood History (Supabase)

### `src/lib/mood-history.ts`

Two exported functions, no side-effects:

```ts
saveMoodHistory(supabase: SupabaseClient, userId: string, mood: string): Promise<void>
fetchLastMood(supabase: SupabaseClient, userId: string): Promise<string | null>
```

**`saveMoodHistory`:**
- INSERT into `user_mood_history` (`user_id`, `mood`, `movie_id: null`)
- On Supabase error: log via `logger.ts`, do NOT throw (silent-fail to avoid breaking quiz flow)

**`fetchLastMood`:**
- SELECT `mood` FROM `user_mood_history` WHERE `user_id = userId` ORDER BY `created_at DESC` LIMIT 1
- Returns `mood` string or `null` if no rows

### `useQuizRecommendations.ts` changes

After existing `localStorage.setItem(mood)` on successful fetch:
```
if (user is logged in)
  → await saveMoodHistory(supabase, user.id, mood)
→ invalidateCache(mood)   ← always, regardless of login state
```

`invalidateCache(mood)` removes `moodflix:movieCache:{mood}` from localStorage.

### `useAuth.ts` changes

In the `SIGNED_IN` branch of `onAuthStateChange`:
```
mood = await fetchLastMood(supabase, user.id)
if (mood !== null)
  → localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood)
  → window.dispatchEvent(new CustomEvent(LAST_MOOD_EVENT, { detail: { mood } }))
```

---

## Section 2: Session Cache (GridMotion)

### Cache key schema

| Key | Value |
|-----|-------|
| `moodflix:movieCache:{mood}` | `{ urls: string[], cachedAt: number }` |
| `moodflix:movieCacheSession` | `session_expires_at` (epoch ms) |

### TTL logic

```
isValid(mood):
  entry = localStorage.getItem('moodflix:movieCache:{mood}')
  if (!entry) return false
  sessionExpiry = localStorage.getItem('moodflix:movieCacheSession')
  if (sessionExpiry && Date.now() < Number(sessionExpiry))
    return true           // logged-in session still active
  return Date.now() < entry.cachedAt + 1_800_000  // 30-min fallback for anon
```

### `grid-motion.tsx` changes

In `loadPosters()`:
1. Check `isValid(activeMood)` → if true, use cached URLs, skip all fetch calls
2. After all pages fetched → write to `moodflix:movieCache:{activeMood}`
3. Add `onPostersReady?: () => void` prop — called when `setPosterItems` completes

### Session expiry sync

In `useAuth.ts`, after `SIGNED_IN`:
```
session.expires_at → localStorage.setItem('moodflix:movieCacheSession', expires_at * 1000)
```

After `SIGNED_OUT`:
```
clearMoodCache() — removes all keys matching /^moodflix:movieCache/
localStorage.removeItem('moodflix:movieCacheSession')
```

`clearMoodCache` iterates `localStorage` keys and removes matching ones.

---

## Section 3: Post-Quiz Loading Screen

### Component: `src/components/ui/quiz-loading-screen.tsx`

**Props:**
```ts
interface QuizLoadingScreenProps {
  isReady: boolean        // when true → trigger fade-out and call onDismiss
  onDismiss: () => void   // called after fade-out completes
}
```

**Animation sequence (motion/react):**

| Phase | Duration | Description |
|-------|----------|-------------|
| Enter | 0–0.3s | Full-screen overlay fades in (`opacity 0→1`, `ease-in`) |
| Phase 1 | 0.3–1.1s | 8 dots appear, bounce vertically (staggered delay) |
| Phase 2 | 1.1–2.0s | Each dot expands horizontally + border-radius 50%→4px, revealing a letter |
| Phase 3 | ongoing | Each letter pulses (scale + opacity, staggered, like LoaderFive) |
| Exit | on `isReady` | Overlay fades out (`opacity 1→0`, `ease-out`, 0.5s), then `onDismiss()` |

**Morph technique:**
- 8 `motion.div` elements in a flex row, each representing one character of `"moodflix"`
- Each div starts as: `{ width: 12, height: 12, borderRadius: '50%' }`
- Each div animates to: `{ width: charWidth, height: 28, borderRadius: 4 }` containing the letter
- Text opacity animates `0→1` during phase 2, so letters appear as dots expand
- Uses `LayoutGroup` from `motion/react` for smooth layout recalculation

**Minimum display time:** 800ms — even on cache HIT, loading screen stays visible for at least 800ms to avoid a flash.

### Homepage (`app/page.tsx`) changes

```tsx
// Detect ?from=quiz param
const searchParams = useSearchParams()
const [showLoader, setShowLoader] = useState(searchParams.get('from') === 'quiz')
const [postersReady, setPostersReady] = useState(false)

// Pass to GridMotion
<GridMotion onPostersReady={() => setPostersReady(true)} />

// Render
{showLoader && (
  <QuizLoadingScreen
    isReady={postersReady}
    onDismiss={() => {
      setShowLoader(false)
      router.replace('/')   // clean URL
    }}
  />
)}
```

### `quiz/page.tsx` changes

After `onComplete()` (quiz results shown), navigate:
```ts
router.push('/?from=quiz')
```

---

## Section 4: Testing (UT_gumi) & SonarCloud

### New test files

**`mood/mood-history.test.ts`**
- `saveMoodHistory` inserts correct `user_id` and `mood`
- `saveMoodHistory` silent-fails on Supabase error (no throw)
- `fetchLastMood` returns mood string from first row
- `fetchLastMood` returns `null` when no rows

**`ui/quiz-loading-screen.test.tsx`**
- Renders 8 dot elements on mount
- Renders "moodflix" text characters
- `onDismiss` is called when `isReady` becomes true
- Does not call `onDismiss` before minimum 800ms

### SonarCloud compliance rules applied

- No `any` types — Supabase calls typed with explicit generics
- Errors logged via `logger.ts`, not `console.log`
- Cognitive complexity < 15 per function (helpers extracted where needed)
- `motion/react` used via named imports only (no default-import aliasing)
- Line coverage target ≥ 80% for `lib/mood-history.ts`

---

## Dependencies

```bash
npm i motion clsx tailwind-merge
```

- `motion` — `motion/react` animation library (replaces framer-motion)
- `clsx` + `tailwind-merge` — `cn()` utility (add to `src/lib/utils.ts` if not present)

---

## Data Flow Summary

```
Quiz completes
  ├─ localStorage mood updated          (existing)
  ├─ saveMoodHistory(DB)                (new, if logged in)
  ├─ invalidateCache(mood)              (new)
  └─ router.push('/?from=quiz')         (new)

Homepage mounts (?from=quiz)
  ├─ QuizLoadingScreen visible
  └─ GridMotion loads posters
        ├─ cache HIT  → onPostersReady() immediately
        └─ cache MISS → fetch → write cache → onPostersReady()

onPostersReady fires
  └─ QuizLoadingScreen fades out → onDismiss → URL cleaned

User logs in (SIGNED_IN)
  ├─ fetchLastMood(DB) → localStorage sync
  ├─ LAST_MOOD_EVENT dispatched
  └─ session_expires_at written to localStorage

User logs out (SIGNED_OUT)
  └─ clearMoodCache() + remove session key
```

'use client';

import { useEffect, useRef, useState } from 'react';
import { QuizTransitionButton } from '@/components/ui/water-drop-transition';
import { SplitText } from '@/components/ui/split-text';
import { Reveal } from '@/components/ui/reveal';
import Link from 'next/link';
import FooterComponent from '@/components/ui/footer';
import Navbar from '@/components/ui/navbar';
import { LastMoodRecommendations } from '@/components/ui/last-mood-recommendations';
import NowPlayingPage from '@/components/ui/now-playing';
import GridMotion from '@/components/ui/grid-motion';
import { AiChat } from '@/components/ui/ai-chat';
import { MoodPicksDropdown } from '../components/ui/mood-picks-dropdown';
import {
  Smile,
  CloudRain,
  Zap,
  Coffee,
  Sparkles,
  Wind,
  Heart,
  Compass,
  ChevronDown,
} from 'lucide-react';
import {
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  MOOD_LABELS,
  normalizeMood,
} from '@/lib/mood';

const MOODS = [
  {
    id: 'happy',
    name: 'Happy',
    vibe: 'Bright and playful',
    Icon: Smile,
    iconColor: 'text-amber-400',
    accent: 'from-amber-400/15 to-yellow-300/8',
    border: 'border-amber-300/25',
  },
  {
    id: 'sad',
    name: 'Melancholic',
    vibe: 'Quiet and reflective',
    Icon: CloudRain,
    iconColor: 'text-sky-400',
    accent: 'from-sky-400/15 to-blue-300/8',
    border: 'border-sky-300/25',
  },
  {
    id: 'excited',
    name: 'Thrilled',
    vibe: 'Fast and energetic',
    Icon: Zap,
    iconColor: 'text-rose-400',
    accent: 'from-rose-400/15 to-orange-300/8',
    border: 'border-rose-300/25',
  },
  {
    id: 'cozy',
    name: 'Cozy',
    vibe: 'Warm and calm',
    Icon: Coffee,
    iconColor: 'text-orange-400',
    accent: 'from-orange-400/15 to-amber-300/8',
    border: 'border-orange-300/25',
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    vibe: 'Classic and dreamy',
    Icon: Sparkles,
    iconColor: 'text-violet-400',
    accent: 'from-violet-400/15 to-fuchsia-300/8',
    border: 'border-violet-300/25',
  },
  {
    id: 'scattered',
    name: 'Scattered',
    vibe: 'Grounded and refocused',
    Icon: Wind,
    iconColor: 'text-slate-400',
    accent: 'from-slate-400/15 to-zinc-300/8',
    border: 'border-slate-300/25',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    vibe: 'Tender and intimate',
    Icon: Heart,
    iconColor: 'text-pink-400',
    accent: 'from-pink-400/15 to-rose-300/8',
    border: 'border-pink-300/25',
  },
  {
    id: 'adventurous',
    name: 'Adventurous',
    vibe: 'Bold and exploratory',
    Icon: Compass,
    iconColor: 'text-emerald-400',
    accent: 'from-emerald-400/15 to-green-300/8',
    border: 'border-emerald-300/25',
  },
];

/** Banner shown above the NowPlaying section showing current stored mood */
interface LastMoodBannerProps {
  mood: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function LastMoodBanner({ mood, isExpanded, onToggle }: LastMoodBannerProps) {
  const label = MOOD_LABELS[mood] ?? mood;

  return (
    <div className='relative py-8 px-4 text-center border-y border-white/6 bg-black'>
      <div className='flex items-center justify-center gap-3 flex-wrap'>
        <span className='text-xs font-bold uppercase tracking-[0.2em] text-white/35'>
          Your last mood is
        </span>
        <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-400'>
          {label}
        </span>
        <button
          type='button'
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls='mood-picks-dropdown'
          className='inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/65 transition-colors hover:bg-white/10 hover:text-white'
        >
          {isExpanded ? 'Hide all picks' : 'Show all picks'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [mood, setMood] = useState('cozy');
  const [isMoodDropdownExpanded, setIsMoodDropdownExpanded] = useState(false);
  const moodRef = useRef(mood);

  useEffect(() => {
    const syncMood = () => {
      const next = normalizeMood(window.localStorage.getItem(LAST_MOOD_STORAGE_KEY));

      if (moodRef.current !== next) {
        moodRef.current = next;
        setMood(next);
        setIsMoodDropdownExpanded(false);
      }
    };

    syncMood();
    window.addEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
    window.addEventListener('storage', syncMood);

    return () => {
      window.removeEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
      window.removeEventListener('storage', syncMood);
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className='relative overflow-x-hidden bg-black page-enter'>

        {/* ═══════════════════════════════════════════════════ */}
        {/* HERO SECTION                                        */}
        {/* ═══════════════════════════════════════════════════ */}
        <section
          id='hero'
          className='sticky top-0 h-screen w-full overflow-hidden'
          style={{ zIndex: 0 }}
          aria-labelledby='hero-heading'
        >
          {/* Animated poster grid background */}
          <div className='absolute inset-0 -z-30'>
            <GridMotion gradientColor='rgb(0 0 0 / 0.14)' />
          </div>

          {/* Layered atmospheric overlays */}
          <div className='absolute inset-0 -z-20 bg-gradient-to-b from-black/44 via-black/16 to-black/62' />
          <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.15),transparent)]' />
          <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.42)_75%)]' />

          {/* Ambient glow orbs */}
          <div
            className='hero-orb absolute left-[8%] top-[18%] w-[38vw] h-[38vw] max-w-[600px] max-h-[600px] opacity-25 -z-10'
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(249,115,22,0.3) 50%, transparent 70%)',
              animation: 'orb-drift-a 18s ease-in-out infinite',
            }}
            aria-hidden='true'
          />
          <div
            className='hero-orb absolute right-[6%] bottom-[20%] w-[32vw] h-[32vw] max-w-[500px] max-h-[500px] opacity-20 -z-10'
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(99,102,241,0.25) 55%, transparent 70%)',
              animation: 'orb-drift-b 22s ease-in-out infinite',
            }}
            aria-hidden='true'
          />
          <div
            className='hero-orb absolute left-[45%] bottom-[10%] w-[28vw] h-[28vw] max-w-[400px] max-h-[400px] opacity-15 -z-10'
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(249,115,22,0.2) 60%, transparent 75%)',
              animation: 'orb-drift-c 26s ease-in-out infinite',
            }}
            aria-hidden='true'
          />

          {/* Film grain */}
          <div className='absolute inset-0 -z-10 film-grain opacity-16' aria-hidden='true' />

          {/* Cinematic letterbox bars */}
          <div className='absolute top-0 left-0 right-0 h-2 bg-black z-20' aria-hidden='true' />
          <div className='absolute bottom-0 left-0 right-0 h-2 bg-black z-20' aria-hidden='true' />

          {/* Hero content */}
          <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 md:px-8 md:py-24'>
            <Reveal className='w-full max-w-5xl text-center mx-auto'>
              {/* MOODFLIX wordmark */}
              <div id='hero-brand' className='mb-6 flex justify-center'>
                <span className='text-sm font-black tracking-[0.55em] uppercase text-white/35 select-none border-b border-white/10 pb-1.5'>
                  MoodFlix
                </span>
              </div>

              {/* Badge */}
              <div className='mb-8 flex justify-center'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm'>
                  <span className='h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]' />
                  Mood-Driven Cinema
                </span>
              </div>

              <h1
                id='hero-heading'
                className='flex flex-col items-center gap-2 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]'
                style={{ textShadow: '0 8px 40px rgba(0,0,0,0.75)' }}
              >
                <SplitText text='Tonight your cinema mood' className='justify-center text-white' />
                <SplitText
                  text='is ready to be discovered'
                  className='justify-center'
                  wordClassName='bg-gradient-to-r from-amber-100 via-orange-200 to-rose-200 bg-clip-text text-transparent'
                />
              </h1>

              <p className='mx-auto mt-2 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl md:leading-8'>
                Tell us how you feel. We&apos;ll find the perfect movie to match your vibe — every single time.
              </p>

              <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4'>
                <QuizTransitionButton
                  size='lg'
                  className='card-lift rounded-full px-8 py-6 text-lg font-semibold shadow-[0_0_30px_rgba(249,115,22,0.25)]'
                  ariaLabel='Take the mood quiz'
                >
                  Take the Mood Quiz
                </QuizTransitionButton>
                <Link
                  href='/watched-movies'
                  className='inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/6 px-7 py-3.5 text-base font-medium text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/30'
                >
                  Discover Movies
                </Link>
              </div>
            </Reveal>

            {/* Scroll cue */}
            <div className='absolute bottom-10 left-1/2 -translate-x-1/2' aria-hidden='true'>
              <div className='flex flex-col items-center gap-2 opacity-40'>
                <span className='text-[10px] uppercase tracking-widest text-white/60'>Scroll</span>
                <div className='h-8 w-px bg-gradient-to-b from-white/50 to-transparent' />
              </div>
            </div>
          </div>
        </section>

        {/* Section blur separator */}
        <div className='pointer-events-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' aria-hidden='true' />
        <div className='pointer-events-none h-16 bg-gradient-to-b from-black to-transparent' aria-hidden='true' />

        {/* ═══════════════════════════════════════════════════ */}
        {/* MOOD CATEGORIES                                     */}
        {/* ═══════════════════════════════════════════════════ */}
        <section
          id='mood-categories'
          className='section-categories relative -mt-14 px-4 py-20 md:-mt-20 md:py-24'
          style={{ zIndex: 8, boxShadow: '0 -16px 60px rgba(0,0,0,0.92)' }}
          aria-labelledby='mood-categories-title'
        >
          <div className='pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent' aria-hidden='true' />

          <div className='container mx-auto'>
            <Reveal>
              <div className='mb-12 text-center'>
                <span className='mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-violet-400/70'>
                  Pick your aura
                </span>
                <h2
                  id='mood-categories-title'
                  className='text-3xl font-black text-white md:text-4xl lg:text-5xl'
                >
                  <SplitText text='Choose Your Movie Aura' className='justify-center' />
                </h2>
              </div>
            </Reveal>

            <div
              className='grid grid-cols-1 gap-4 px-1 pb-3 sm:grid-cols-2 lg:grid-cols-4'
              role='group'
              aria-label='Mood categories'
            >
              {MOODS.map((mood, index) => (
                <Reveal key={mood.id} delayMs={index * 70} className='h-full'>
                  <Link
                    href={`/quiz?mood=${mood.id}`}
                    aria-label={`Browse ${mood.name} movies`}
                    className={`
                      card-lift group relative flex h-full min-h-48 w-full flex-col items-center justify-center
                      gap-3 overflow-hidden rounded-2xl border ${mood.border}
                      bg-gradient-to-b ${mood.accent} p-4 text-center
                      backdrop-blur-sm transition-all duration-300
                      hover:border-white/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                    `}
                  >
                    <div className='relative flex h-16 w-16 items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300'>
                      <mood.Icon
                        className={`h-8 w-8 ${mood.iconColor} transition-transform duration-300 group-hover:scale-110`}
                        aria-hidden='true'
                        strokeWidth={1.75}
                      />
                    </div>
                    <div>
                      <span className='block text-sm font-bold text-white sm:text-base'>
                        {mood.name}
                      </span>
                      <span className='block text-xs text-white/50 mt-0.5'>{mood.vibe}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <div className='pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent' aria-hidden='true' />
        </section>

        {/* Section blur separator */}
        <div className='pointer-events-none h-px bg-gradient-to-r from-transparent via-white/8 to-transparent' aria-hidden='true' />
        <div className='pointer-events-none h-4 bg-gradient-to-b from-black/22 via-black/8 to-transparent' aria-hidden='true' />

        {/* ═══════════════════════════════════════════════════ */}
        {/* LAST MOOD RECOMMENDATIONS                           */}
        {/* ═══════════════════════════════════════════════════ */}
        <section
          id='last-mood-recommendations'
          aria-label='Recommendations from last mood'
          className='relative'
          style={{ zIndex: 9, boxShadow: '0 -12px 48px rgba(0,0,0,0.9)' }}
        >
          <LastMoodRecommendations />
        </section>

        <div className='pointer-events-none h-4 bg-gradient-to-t from-black/22 via-black/8 to-transparent' aria-hidden='true' />

        {/* ═══════════════════════════════════════════════════ */}
        {/* LAST MOOD BANNER                                    */}
        {/* ═══════════════════════════════════════════════════ */}
        <LastMoodBanner
          mood={mood}
          isExpanded={isMoodDropdownExpanded}
          onToggle={() => setIsMoodDropdownExpanded(prev => !prev)}
        />

        <MoodPicksDropdown mood={mood} isOpen={isMoodDropdownExpanded} />

        {/* Section blur separator */}
        <div className='pointer-events-none h-px bg-gradient-to-r from-transparent via-white/8 to-transparent' aria-hidden='true' />

        {/* ═══════════════════════════════════════════════════ */}
        {/* NOW PLAYING                                         */}
        {/* ═══════════════════════════════════════════════════ */}
        <section
          aria-label='Now playing movies'
          className='section-now-playing relative'
          style={{ zIndex: 10, boxShadow: '0 -12px 48px rgba(0,0,0,0.9)' }}
        >
          <div className='pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black to-transparent' aria-hidden='true' />
          <NowPlayingPage />
          <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent' aria-hidden='true' />
        </section>

      </main>

      <FooterComponent />

      {/* Floating AI Chat */}
      <AiChat />
    </>
  );
}

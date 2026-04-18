'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LAST_MOOD_EVENT, LAST_MOOD_STORAGE_KEY, normalizeMood } from '@/lib/mood';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😄',
  sad: '🥲',
  excited: '🤩',
  cozy: '😌',
  nostalgic: '🥹',
  scattered: '😵‍💫',
  romantic: '😍',
  adventurous: '🤠',
};

const MOOD_GLOW: Record<string, string> = {
  happy: 'rgba(250, 204, 21, 0.45)',
  sad: 'rgba(56, 189, 248, 0.42)',
  excited: 'rgba(251, 113, 133, 0.42)',
  cozy: 'rgba(251, 146, 60, 0.42)',
  nostalgic: 'rgba(192, 132, 252, 0.42)',
  scattered: 'rgba(148, 163, 184, 0.42)',
  romantic: 'rgba(244, 114, 182, 0.42)',
  adventurous: 'rgba(52, 211, 153, 0.42)',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function CursorEmojiHero() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mood, setMood] = useState('cozy');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const syncMood = () => {
      const nextMood = normalizeMood(window.localStorage.getItem(LAST_MOOD_STORAGE_KEY));
      setMood(nextMood);
    };

    syncMood();
    window.addEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
    window.addEventListener('storage', syncMood);

    return () => {
      window.removeEventListener(LAST_MOOD_EVENT, syncMood as EventListener);
      window.removeEventListener('storage', syncMood);
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const node = rootRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const nx = clamp((event.clientX - centerX) / (rect.width / 2), -1, 1);
      const ny = clamp((event.clientY - centerY) / (rect.height / 2), -1, 1);

      setTilt({
        x: ny * -9,
        y: nx * 11,
      });

      setLook({
        x: nx * 6,
        y: ny * 5,
      });
    };

    const onPointerLeave = () => {
      setTilt({ x: 0, y: 0 });
      setLook({ x: 0, y: 0 });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const glow = useMemo(() => MOOD_GLOW[mood] ?? MOOD_GLOW.cozy, [mood]);
  const emoji = useMemo(() => MOOD_EMOJI[mood] ?? MOOD_EMOJI.cozy, [mood]);

  return (
    <div className='relative mx-auto mb-8 flex w-full max-w-sm items-center justify-center'>
      <div
        className='pointer-events-none absolute h-40 w-40 rounded-full blur-2xl'
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          transform: `translate3d(${tilt.y * 0.6}px, ${tilt.x * 0.6}px, 0)`,
          transition: 'transform 120ms ease-out',
        }}
        aria-hidden='true'
      />

      <div
        ref={rootRef}
        className='relative h-36 w-36 select-none rounded-full border border-white/25 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.45),rgba(255,255,255,0.12)_45%,rgba(255,255,255,0.06)_100%)] shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-sm'
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 110ms ease-out',
        }}
        aria-label='Animated mood emoji'
      >
        <div className='absolute inset-0 grid place-items-center text-6xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.42)]'>
          <span style={{ transform: `translate3d(${tilt.y * 0.15}px, ${tilt.x * 0.15}px, 8px)` }}>
            {emoji}
          </span>
        </div>

        <div className='pointer-events-none absolute left-[35%] top-[40%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/42'>
          <div
            className='h-2.5 w-2.5 rounded-full bg-white'
            style={{
              transform: `translate3d(${look.x}px, ${look.y}px, 0)`,
              transition: 'transform 80ms linear',
            }}
          />
        </div>

        <div className='pointer-events-none absolute left-[65%] top-[40%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/42'>
          <div
            className='h-2.5 w-2.5 rounded-full bg-white'
            style={{
              transform: `translate3d(${look.x}px, ${look.y}px, 0)`,
              transition: 'transform 80ms linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}

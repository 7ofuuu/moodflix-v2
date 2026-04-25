'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const LETTERS = 'moodflix'.split('');
const DOT_COUNT = 3;
const MIN_DISPLAY_MS = 800;
const PHASE_TRANSITION_MS = 1200;

export interface QuizLoadingScreenProps {
  isReady: boolean;
  onDismiss: () => void;
}

function LoaderDots() {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <motion.div
          key={i}
          data-testid="loader-dot"
          className="h-3 w-3 rounded-full bg-neutral-500"
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'loop',
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function LoaderText() {
  return (
    <div className="flex items-center gap-[2px]">
      {LETTERS.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block text-4xl font-black tracking-tight text-white select-none"
          initial={{ opacity: 0, scale: 0.3, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: i * 0.06,
            duration: 0.45,
            scale: { ease: [0.34, 1.56, 0.64, 1], duration: 0.45 },
            opacity: { ease: 'easeOut', duration: 0.25 },
            y: { ease: 'easeOut', duration: 0.3 },
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          aria-live="polite"
          aria-label="Loading your recommendations"
        >
          <AnimatePresence mode="wait">
            {phase === 'dots' ? (
              <motion.div
                key="dots"
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.3, ease: 'easeIn' }}
              >
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

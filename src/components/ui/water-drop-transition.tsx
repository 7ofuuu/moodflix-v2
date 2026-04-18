'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  type CSSProperties,
  type ComponentProps,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface WaterDropState {
  active: boolean;
  reveal: boolean;
  x: number;
  y: number;
  targetPath: string | null;
}

interface WaterDropContextValue {
  isTransitioning: boolean;
  playTransition: (x: number, y: number, targetPath: string) => Promise<void>;
}

const initialState: WaterDropState = {
  active: false,
  reveal: false,
  x: 0,
  y: 0,
  targetPath: null,
};

const WaterDropContext = createContext<WaterDropContextValue | null>(null);

export function WaterDropTransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [state, setState] = useState<WaterDropState>(initialState);

  const playTransition = useCallback((x: number, y: number, targetPath: string) => {
    setState({
      active: true,
      reveal: false,
      x,
      y,
      targetPath,
    });

    document.body.classList.add('overflow-hidden');

    return new Promise<void>(resolve => {
      window.setTimeout(resolve, 900);
    });
  }, []);

  useEffect(() => {
    if (!state.active || !state.targetPath || pathname !== state.targetPath) {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setState(previous => ({ ...previous, reveal: true }));
    }, 40);

    const endTimer = window.setTimeout(() => {
      setState(initialState);
      document.body.classList.remove('overflow-hidden');
    }, 680);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(endTimer);
    };
  }, [pathname, state.active, state.targetPath]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const contextValue = useMemo<WaterDropContextValue>(
    () => ({
      isTransitioning: state.active,
      playTransition,
    }),
    [playTransition, state.active]
  );

  return (
    <WaterDropContext.Provider value={contextValue}>
      {children}
      <div
        aria-hidden='true'
        className={cn(
          'water-drop-overlay',
          state.active && 'water-drop-overlay-active',
          state.reveal && 'water-drop-overlay-reveal'
        )}
        style={
          {
            '--drop-x': `${state.x}px`,
            '--drop-y': `${state.y}px`,
          } as CSSProperties
        }
      >
        <div className='water-drop-wave water-drop-wave-primary' />
        <div className='water-drop-wave water-drop-wave-secondary' />
      </div>
    </WaterDropContext.Provider>
  );
}

function useWaterDropTransition() {
  const context = useContext(WaterDropContext);
  if (!context) {
    throw new Error('useWaterDropTransition must be used inside WaterDropTransitionProvider');
  }

  return context;
}

type QuizButtonVariant = ComponentProps<typeof Button>['variant'];
type QuizButtonSize = ComponentProps<typeof Button>['size'];

interface QuizTransitionButtonProps {
  children: ReactNode;
  className?: string;
  targetPath?: string;
  disabled?: boolean;
  ariaLabel?: string;
  size?: QuizButtonSize;
  variant?: QuizButtonVariant;
}

export function QuizTransitionButton({
  children,
  className,
  targetPath = '/quiz',
  disabled,
  ariaLabel,
  size,
  variant,
}: QuizTransitionButtonProps) {
  const router = useRouter();
  const { playTransition, isTransitioning } = useWaterDropTransition();

  useEffect(() => {
    router.prefetch(targetPath);
  }, [router, targetPath]);

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      if (isTransitioning || disabled) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;

      await playTransition(x, y, targetPath);
      router.push(targetPath);
    },
    [disabled, isTransitioning, playTransition, router, targetPath]
  );

  return (
    <Button
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={disabled || isTransitioning}
      size={size}
      variant={variant}
      className={cn(className)}
    >
      {children}
    </Button>
  );
}

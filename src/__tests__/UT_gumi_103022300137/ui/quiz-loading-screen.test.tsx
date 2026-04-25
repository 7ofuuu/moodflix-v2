import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { QuizLoadingScreen } from '@/components/ui/quiz-loading-screen';

jest.mock('motion/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react') as typeof import('react');
  return {
    motion: {
      div: ({ children, className, 'aria-live': ariaLive, 'aria-label': ariaLabel, ...rest }: React.HTMLAttributes<HTMLDivElement>) =>
        R.createElement('div', { className, 'aria-live': ariaLive, 'aria-label': ariaLabel, ...rest }, children),
      span: ({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) =>
        R.createElement('span', { className, ...rest }, children),
    },
    AnimatePresence: ({ children, onExitComplete }: { children: React.ReactNode; onExitComplete?: () => void }) => {
      const ref = R.useRef<boolean>(Boolean(children));
      R.useEffect(() => {
        const wasPresent = ref.current;
        const isNowPresent = Boolean(children);
        ref.current = isNowPresent;
        if (wasPresent && !isNowPresent) {
          onExitComplete?.();
        }
      });
      return R.createElement(R.Fragment, null, children);
    },
  };
});

describe('QuizLoadingScreen', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders 3 dot elements on mount', () => {
    render(<QuizLoadingScreen isReady={false} onDismiss={jest.fn()} />);
    const dots = screen.getAllByTestId('loader-dot');
    expect(dots).toHaveLength(3);
  });

  it('renders accessible loading label', () => {
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

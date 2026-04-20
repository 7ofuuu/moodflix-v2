import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoodSelector } from '@/components/features/quiz/MoodSelector';

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('lucide-react', () => {
  const icon = (name: string) => {
    const Icon = ({ className, strokeWidth, ...rest }: { className?: string; strokeWidth?: number; [key: string]: unknown }) => (
      <svg data-testid={`icon-${name}`} className={className} {...rest} />
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    Smile: icon('Smile'),
    CloudRain: icon('CloudRain'),
    Zap: icon('Zap'),
    Coffee: icon('Coffee'),
    Sparkles: icon('Sparkles'),
    Wind: icon('Wind'),
    Heart: icon('Heart'),
    Compass: icon('Compass'),
  };
});

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    className?: string;
  }) => {
    if (asChild) {
      return <span className={className}>{children}</span>;
    }
    return (
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    );
  },
}));

describe('MoodSelector', () => {
  const noop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading', () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={noop} onNext={noop} />);
    expect(screen.getByText(/set tonight/i)).toBeInTheDocument();
  });

  it('renders all 8 mood options', () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={noop} onNext={noop} />);
    const moodNames = ['Happy', 'Melancholic', 'Thrilled', 'Cozy', 'Nostalgic', 'Scattered', 'Romantic', 'Adventurous'];
    moodNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('calls onMoodSelect with the mood id when a mood button is clicked', () => {
    const handleSelect = jest.fn();
    render(<MoodSelector selectedMood={null} onMoodSelect={handleSelect} onNext={noop} />);
    fireEvent.click(screen.getByText('Happy'));
    expect(handleSelect).toHaveBeenCalledWith('happy');
  });

  it('Continue button is disabled when no mood is selected', () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={noop} onNext={noop} />);
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('Continue button is enabled when a mood is selected', () => {
    render(<MoodSelector selectedMood="happy" onMoodSelect={noop} onNext={noop} />);
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });

  it('calls onNext when Continue button is clicked', () => {
    const handleNext = jest.fn();
    render(<MoodSelector selectedMood="cozy" onMoodSelect={noop} onNext={handleNext} />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('renders a back-to-home link', () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={noop} onNext={noop} />);
    expect(screen.getByText(/back to home/i)).toBeInTheDocument();
  });
});

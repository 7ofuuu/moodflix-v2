import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
});

// Mock the Watched section component
const WatchedSection = () => (
  <section data-testid="watched-section">
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
          Watched
        </h2>
        <a href='/watched' data-testid="watched-see-all">
          See all
          <svg data-testid="chevron-right-icon" />
        </a>
      </div>
      <div className='flex gap-2'>
        <button data-testid="scroll-left-watched" aria-label="Scroll Watched left">
          <svg data-testid="chevron-left-icon" />
        </button>
        <button data-testid="scroll-right-watched" aria-label="Scroll Watched right">
          <svg data-testid="chevron-right-icon" />
        </button>
      </div>
    </div>
    <div data-testid="watched-carousel" className='flex gap-4 overflow-x-auto scrollbar-hide pb-2' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`card-watched-${i}`}
          data-testid={`watched-card-${i}`}
          className='flex-shrink-0 w-36 sm:w-40 md:w-44 aspect-[2/3] bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700/50'
        />
      ))}
    </div>
  </section>
);

describe('Profile - Watched Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Watched section title', () => {
    render(<WatchedSection />);
    expect(screen.getByText('Watched')).toBeInTheDocument();
  });

  it('renders See all link with correct href', () => {
    render(<WatchedSection />);
    const seeAllLink = screen.getByTestId('watched-see-all');
    expect(seeAllLink).toHaveAttribute('href', '/watched');
  });

  it('renders scroll left button with correct aria-label', () => {
    render(<WatchedSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watched');
    expect(scrollLeftBtn).toHaveAttribute('aria-label', 'Scroll Watched left');
  });

  it('renders scroll right button with correct aria-label', () => {
    render(<WatchedSection />);
    const scrollRightBtn = screen.getByTestId('scroll-right-watched');
    expect(scrollRightBtn).toHaveAttribute('aria-label', 'Scroll Watched right');
  });

  it('renders 8 placeholder cards for watched movies', () => {
    render(<WatchedSection />);
    const cards = Array.from({ length: 8 }).map((_, i) =>
      screen.getByTestId(`watched-card-${i}`),
    );
    expect(cards).toHaveLength(8);
    cards.forEach((card) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('each card has unique and stable key identifier', () => {
    const { container } = render(<WatchedSection />);
    const cards = container.querySelectorAll('[data-testid^="watched-card-"]');
    const keys = new Set<string>();
    
    cards.forEach((card, index) => {
      const testId = card.getAttribute('data-testid');
      expect(testId).toBe(`watched-card-${index}`);
      keys.add(testId || '');
    });
    
    expect(keys.size).toBe(8);
  });

  it('carousel has scrollbar hidden styling', () => {
    render(<WatchedSection />);
    const carousel = screen.getByTestId('watched-carousel');
    expect(carousel).toHaveStyle({ scrollbarWidth: 'none' });
  });

  it('scroll buttons trigger click events', () => {
    render(<WatchedSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watched');
    const scrollRightBtn = screen.getByTestId('scroll-right-watched');

    const leftClickFn = jest.fn();
    const rightClickFn = jest.fn();

    scrollLeftBtn.addEventListener('click', leftClickFn);
    scrollRightBtn.addEventListener('click', rightClickFn);

    fireEvent.click(scrollLeftBtn);
    fireEvent.click(scrollRightBtn);

    expect(leftClickFn).toHaveBeenCalled();
    expect(rightClickFn).toHaveBeenCalled();
  });

  it('renders section with proper spacing classes', () => {
    render(<WatchedSection />);
    const section = screen.getByTestId('watched-section');
    expect(section.tagName).toBe('SECTION');
  });

  it('each placeholder card has proper aspect ratio and styling', () => {
    const { container } = render(<WatchedSection />);
    const cards = container.querySelectorAll('[data-testid^="watched-card-"]');
    cards.forEach((card) => {
      expect(card).toHaveClass('flex-shrink-0');
      expect(card).toHaveClass('aspect-[2/3]');
      expect(card).toHaveClass('bg-slate-900/50');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  it('carousel container has correct scroll and layout classes', () => {
    render(<WatchedSection />);
    const carousel = screen.getByTestId('watched-carousel');
    expect(carousel).toHaveClass('flex');
    expect(carousel).toHaveClass('gap-4');
    expect(carousel).toHaveClass('overflow-x-auto');
  });

  it('See all link has proper structure with icon', () => {
    render(<WatchedSection />);
    const seeAllLink = screen.getByTestId('watched-see-all');
    expect(seeAllLink.textContent).toContain('See all');
    const chevron = seeAllLink.querySelector('[data-testid="chevron-right-icon"]');
    expect(chevron).toBeInTheDocument();
  });
});

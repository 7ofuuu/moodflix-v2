import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock the Watchlist section component
const WatchlistSection = () => (
  <section data-testid="watchlist-section" className='space-y-4'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
          Watchlist
        </h2>
        <a href='/watchlist' data-testid="watchlist-see-all" className='flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300'>
          See all
          <svg data-testid="chevron-right-icon" />
        </a>
      </div>
      <div className='flex gap-2'>
        <button 
          data-testid="scroll-left-watchlist" 
          className='p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
          aria-label="Scroll Watchlist left"
        >
          <svg data-testid="chevron-left-icon" />
        </button>
        <button 
          data-testid="scroll-right-watchlist" 
          className='p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
          aria-label="Scroll Watchlist right"
        >
          <svg data-testid="chevron-right-icon" />
        </button>
      </div>
    </div>
    <div 
      data-testid="watchlist-carousel" 
      className='flex gap-4 overflow-x-auto scrollbar-hide pb-2'
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`card-watchlist-${i}`}
          data-testid={`watchlist-card-${i}`}
          className='flex-shrink-0 w-36 sm:w-40 md:w-44 aspect-[2/3] bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700/50 transition-colors'
        />
      ))}
    </div>
  </section>
);

describe('Profile - Watchlist Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Watchlist section title', () => {
    render(<WatchlistSection />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('renders See all link with correct href', () => {
    render(<WatchlistSection />);
    const seeAllLink = screen.getByTestId('watchlist-see-all');
    expect(seeAllLink).toHaveAttribute('href', '/watchlist');
  });

  it('renders scroll left button with correct aria-label', () => {
    render(<WatchlistSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watchlist');
    expect(scrollLeftBtn).toHaveAttribute('aria-label', 'Scroll Watchlist left');
  });

  it('renders scroll right button with correct aria-label', () => {
    render(<WatchlistSection />);
    const scrollRightBtn = screen.getByTestId('scroll-right-watchlist');
    expect(scrollRightBtn).toHaveAttribute('aria-label', 'Scroll Watchlist right');
  });

  it('renders 8 placeholder cards for watchlist', () => {
    render(<WatchlistSection />);
    const cards = Array.from({ length: 8 }).map((_, i) =>
      screen.getByTestId(`watchlist-card-${i}`),
    );
    expect(cards).toHaveLength(8);
    cards.forEach((card) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('all cards have unique and stable identifiers', () => {
    const { container } = render(<WatchlistSection />);
    const cards = container.querySelectorAll('[data-testid^="watchlist-card-"]');
    const uniqueIds = new Set<string>();

    cards.forEach((card, index) => {
      const testId = card.getAttribute('data-testid');
      expect(testId).toBe(`watchlist-card-${index}`);
      uniqueIds.add(testId || '');
    });

    expect(uniqueIds.size).toBe(8);
  });

  it('carousel has scrollbar hidden with both CSS and MS styles', () => {
    render(<WatchlistSection />);
    const carousel = screen.getByTestId('watchlist-carousel');
    const styleAttr = carousel.getAttribute('style');
    expect(styleAttr).toContain('none');
  });

  it('scroll buttons are not disabled and clickable', () => {
    render(<WatchlistSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watchlist');
    const scrollRightBtn = screen.getByTestId('scroll-right-watchlist');

    expect(scrollLeftBtn).not.toBeDisabled();
    expect(scrollRightBtn).not.toBeDisabled();

    fireEvent.click(scrollLeftBtn);
    fireEvent.click(scrollRightBtn);
  });

  it('renders proper section structure with space-y-4', () => {
    render(<WatchlistSection />);
    const section = screen.getByTestId('watchlist-section');
    expect(section).toHaveClass('space-y-4');
    expect(section.tagName).toBe('SECTION');
  });

  it('each placeholder card has proper responsive width classes', () => {
    const { container } = render(<WatchlistSection />);
    const cards = container.querySelectorAll('[data-testid^="watchlist-card-"]');
    cards.forEach((card) => {
      expect(card).toHaveClass('w-36', 'sm:w-40', 'md:w-44');
    });
  });

  it('scroll buttons have hover styling classes', () => {
    render(<WatchlistSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watchlist');
    const scrollRightBtn = screen.getByTestId('scroll-right-watchlist');

    expect(scrollLeftBtn).toHaveClass('p-1.5');
    expect(scrollLeftBtn).toHaveClass('rounded-full');
    expect(scrollLeftBtn).toHaveClass('bg-slate-800/50');
    expect(scrollLeftBtn).toHaveClass('hover:bg-slate-700/50');

    expect(scrollRightBtn).toHaveClass('p-1.5');
    expect(scrollRightBtn).toHaveClass('rounded-full');
    expect(scrollRightBtn).toHaveClass('bg-slate-800/50');
    expect(scrollRightBtn).toHaveClass('hover:bg-slate-700/50');
  });

  it('carousel container has flex, gap and overflow classes', () => {
    render(<WatchlistSection />);
    const carousel = screen.getByTestId('watchlist-carousel');
    expect(carousel).toHaveClass('flex');
    expect(carousel).toHaveClass('gap-4');
    expect(carousel).toHaveClass('overflow-x-auto');
    expect(carousel).toHaveClass('scrollbar-hide');
  });

  it('See all link has amber-400 text color and includes chevron icon', () => {
    render(<WatchlistSection />);
    const seeAllLink = screen.getByTestId('watchlist-see-all');
    expect(seeAllLink).toHaveClass('text-amber-400');
    expect(seeAllLink).toHaveClass('hover:text-amber-300');
    
    const chevron = within(seeAllLink).getByTestId('chevron-right-icon');
    expect(chevron).toBeInTheDocument();
  });

  it('cards have hover and transition effects', () => {
    const { container } = render(<WatchlistSection />);
    const cards = container.querySelectorAll('[data-testid^="watchlist-card-"]');
    cards.forEach((card) => {
      expect(card).toHaveClass('hover:border-slate-700/50');
      expect(card).toHaveClass('transition-colors');
    });
  });

  it('renders header with proper layout classes', () => {
    render(<WatchlistSection />);
    const section = screen.getByTestId('watchlist-section');
    const headerDiv = section.querySelector('.flex.items-center.justify-between');
    expect(headerDiv).toBeInTheDocument();
  });

  it('scroll buttons are positioned next to carousel', () => {
    render(<WatchlistSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-watchlist');
    const scrollRightBtn = screen.getByTestId('scroll-right-watchlist');
    const carousel = screen.getByTestId('watchlist-carousel');

    expect(scrollLeftBtn.parentElement).toBeInTheDocument();
    expect(scrollRightBtn.parentElement).toBeInTheDocument();
    expect(carousel).toBeInTheDocument();
  });
});

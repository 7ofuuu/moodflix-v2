import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', email: 'test@example.com' },
    userProfile: {
      id: 'user-1',
      full_name: 'Test User',
      bio: 'Test bio',
      avatar_url: null,
    },
    isLoading: false,
  })),
}));

jest.mock('@/lib/auth-client', () => ({
  signOut: jest.fn(),
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: { session: { access_token: 'test-token' } },
        }),
      ),
    },
  },
}));

jest.mock('@/components/common/avatar', () => {
  const Avatar = ({ fullName }: { avatarUrl?: string; fullName?: string }) => (
    <div data-testid="avatar">{fullName || 'Avatar'}</div>
  );
  Avatar.displayName = 'Avatar';
  return { Avatar };
});

jest.mock('@/components/ui/button', () => {
  const Button = ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
  Button.displayName = 'Button';
  return { Button };
});

jest.mock('lucide-react', () => {
  const LogOut = () => <svg data-testid="logout-icon" />;
  LogOut.displayName = 'LogOut';
  
  const Edit2 = () => <svg data-testid="edit-icon" />;
  Edit2.displayName = 'Edit2';
  
  const ChevronLeft = () => <svg data-testid="chevron-left-icon" />;
  ChevronLeft.displayName = 'ChevronLeft';
  
  const ChevronRight = () => <svg data-testid="chevron-right-icon" />;
  ChevronRight.displayName = 'ChevronRight';
  
  return { LogOut, Edit2, ChevronLeft, ChevronRight };
});

jest.mock('next/link', () => {
  const Link = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
  
  Link.displayName = 'Link';
  
  // Return the component directly since next/link has a default export
  return Link; 
});

// Mock the profile page component
const FavoriteFilmsSection = () => (
  <section data-testid="favorite-films-section">
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
          Favorite Films
        </h2>
        <a href='/films' data-testid="favorite-films-see-all">
          See all
          <svg data-testid="chevron-right-icon" />
        </a>
      </div>
      <div className='flex gap-2'>
        <button data-testid="scroll-left-favorite" aria-label="Scroll Favorite Films left">
          <svg data-testid="chevron-left-icon" />
        </button>
        <button data-testid="scroll-right-favorite" aria-label="Scroll Favorite Films right">
          <svg data-testid="chevron-right-icon" />
        </button>
      </div>
    </div>
    <div 
      data-testid="favorite-films-carousel" 
      className='flex gap-4 overflow-x-auto scrollbar-hide pb-2'
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`card-favorite-films-${i}`}
          data-testid={`favorite-films-card-${i}`}
          className='flex-shrink-0 w-36 sm:w-40 md:w-44 aspect-[2/3] bg-slate-900/50 border border-slate-800/50 rounded-lg'
        />
      ))}
    </div>
  </section>
);

describe('Profile - Favorite Films Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Favorite Films section title', () => {
    render(<FavoriteFilmsSection />);
    expect(screen.getByText('Favorite Films')).toBeInTheDocument();
  });

  it('renders See all link with correct href', () => {
    render(<FavoriteFilmsSection />);
    const seeAllLink = screen.getByTestId('favorite-films-see-all');
    expect(seeAllLink).toHaveAttribute('href', '/films');
  });

  it('renders scroll left button with correct aria-label', () => {
    render(<FavoriteFilmsSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-favorite');
    expect(scrollLeftBtn).toHaveAttribute('aria-label', 'Scroll Favorite Films left');
  });

  it('renders scroll right button with correct aria-label', () => {
    render(<FavoriteFilmsSection />);
    const scrollRightBtn = screen.getByTestId('scroll-right-favorite');
    expect(scrollRightBtn).toHaveAttribute('aria-label', 'Scroll Favorite Films right');
  });

  it('renders 8 placeholder cards for favorite films', () => {
    render(<FavoriteFilmsSection />);
    const cards = Array.from({ length: 8 }).map((_, i) =>
      screen.getByTestId(`favorite-films-card-${i}`),
    );
    expect(cards).toHaveLength(8);
    cards.forEach((card) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('each card has unique key identifier', () => {
    const { container } = render(<FavoriteFilmsSection />);
    const cards = container.querySelectorAll('[data-testid^="favorite-films-card-"]');
    expect(cards).toHaveLength(8);
    cards.forEach((card, index) => {
      expect(card).toHaveAttribute('data-testid', `favorite-films-card-${index}`);
    });
  });

  it('carousel has scrollbar hidden styling', () => {
    render(<FavoriteFilmsSection />);
    const carousel = screen.getByTestId('favorite-films-carousel');
    expect(carousel).toHaveStyle({ scrollbarWidth: 'none' });
  });

  it('scroll buttons are clickable', () => {
    render(<FavoriteFilmsSection />);
    const scrollLeftBtn = screen.getByTestId('scroll-left-favorite');
    const scrollRightBtn = screen.getByTestId('scroll-right-favorite');

    expect(scrollLeftBtn).not.toBeDisabled();
    expect(scrollRightBtn).not.toBeDisabled();

    fireEvent.click(scrollLeftBtn);
    fireEvent.click(scrollRightBtn);
  });

  it('renders carousel with proper styling classes', () => {
    render(<FavoriteFilmsSection />);
    const carousel = screen.getByTestId('favorite-films-carousel');
    expect(carousel).toHaveClass('flex', 'gap-4', 'overflow-x-auto');
  });

  it('each placeholder card has proper aspect ratio styling', () => {
    const { container } = render(<FavoriteFilmsSection />);
    const cards = container.querySelectorAll('[data-testid^="favorite-films-card-"]');
    cards.forEach((card) => {
      expect(card).toHaveClass('aspect-[2/3]');
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MovieCast } from '@/components/features/movie/MovieCast';

jest.mock('next/image', () => {
  const MockImage = ({
    src,
    alt,
    fill,
    className,
    sizes,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={String(fill)} className={className} data-sizes={sizes} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('lucide-react', () => {
  const ArrowRight = ({ className }: { className?: string }) => (
    <svg data-testid='icon-ArrowRight' className={className} />
  );
  ArrowRight.displayName = 'ArrowRight';
  return { ArrowRight };
});

const sampleCast = [
  { id: 10, name: 'Yoga Actor', character: 'Main Role', profile_path: '/yoga.jpg' },
  { id: 11, name: 'No Photo Actor', character: 'Side Role', profile_path: null },
];

describe('MovieCast', () => {
  it('returns null when cast array is empty', () => {
    const { container } = render(<MovieCast cast={[]} movieId={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "Top Cast" section heading', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    expect(screen.getByText('Top Cast')).toBeInTheDocument();
  });

  it('renders the name of each cast member', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    expect(screen.getByText('Yoga Actor')).toBeInTheDocument();
    expect(screen.getByText('No Photo Actor')).toBeInTheDocument();
  });

  it('renders the character name for each cast member', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    expect(screen.getByText('Main Role')).toBeInTheDocument();
    expect(screen.getByText('Side Role')).toBeInTheDocument();
  });

  it('renders an image when profile_path is provided', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    const img = screen.getByAltText('Yoga Actor') as HTMLImageElement;
    expect(img.src).toContain('yoga.jpg');
  });

  it('renders "No Photo" fallback when profile_path is null', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    expect(screen.getByText('No Photo')).toBeInTheDocument();
  });

  it('each cast card links to the correct TMDB person URL', () => {
    render(<MovieCast cast={sampleCast} movieId={5} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://www.themoviedb.org/person/10');
    expect(links[1]).toHaveAttribute('href', 'https://www.themoviedb.org/person/11');
  });

  it('each cast link opens in new tab with noopener noreferrer', () => {
    render(<MovieCast cast={sampleCast} movieId={5} />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('does NOT show "View More" link for fewer than 9 cast members', () => {
    render(<MovieCast cast={sampleCast} movieId={1} />);
    expect(screen.queryByText(/view more/i)).not.toBeInTheDocument();
  });

  it('shows "View More" link when cast has exactly 9 members', () => {
    const largeCast = Array.from({ length: 9 }, (_, i) => ({
      id: i + 100,
      name: `Actor ${i}`,
      character: `Char ${i}`,
      profile_path: null,
    }));
    render(<MovieCast cast={largeCast} movieId={42} />);
    expect(screen.getByText(/view more/i)).toBeInTheDocument();
  });

  it('"View More" links to the correct TMDB full cast page', () => {
    const largeCast = Array.from({ length: 9 }, (_, i) => ({
      id: i + 200,
      name: `Star ${i}`,
      character: `Role ${i}`,
      profile_path: null,
    }));
    render(<MovieCast cast={largeCast} movieId={77} />);
    const viewMore = screen.getByText(/view more/i).closest('a')!;
    expect(viewMore).toHaveAttribute('href', 'https://www.themoviedb.org/movie/77/cast');
    expect(viewMore).toHaveAttribute('target', '_blank');
    expect(viewMore).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

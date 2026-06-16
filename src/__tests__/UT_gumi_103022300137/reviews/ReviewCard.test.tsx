import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewCard } from '@/components/features/reviews/ReviewCard';
import { MovieReview } from '@/types/movie';

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('lucide-react', () => ({
  Star: ({ className }: { className?: string }) => <svg data-testid="star-icon" className={className} />,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

const baseReview: MovieReview = {
  id: 'rev-1',
  author: 'Bob',
  author_details: {
    name: 'Bob',
    username: 'bob99',
    avatar_path: null,
    rating: 7,
  },
  content: 'A solid film with great performances.',
  created_at: '2024-06-15T12:00:00.000Z',
  url: 'https://example.com/review/rev-1',
  movie_id: 10,
  movie_title: 'Awesome Movie',
  movie_poster_path: '/awesome.jpg',
};

describe('ReviewCard', () => {
  it('renders movie title and author name', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText('Awesome Movie')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders star icon and rating when rating is provided', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('truncates long content and shows Read more / Show less button', () => {
    const longContent = 'x'.repeat(400);
    const longReview: MovieReview = { ...baseReview, content: longContent };
    render(<ReviewCard review={longReview} />);

    const readMoreBtn = screen.getByRole('button', { name: /read more/i });
    expect(readMoreBtn).toBeInTheDocument();

    fireEvent.click(readMoreBtn);
    expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
  });

  it('does not show Read more button when content is short', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
  });

  it('does not render star icon or rating when rating is null', () => {
    const noRating: MovieReview = {
      ...baseReview,
      author_details: { ...baseReview.author_details, rating: null },
    };
    render(<ReviewCard review={noRating} />);
    expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
  });

  it('renders author initial badge when avatar_path is null', () => {
    render(<ReviewCard review={baseReview} />);
    // baseReview has avatar_path: null, so fallback initial 'B' is shown
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByAltText('Bob')).not.toBeInTheDocument();
  });

  it('renders avatar image when avatar_path is provided', () => {
    const withAvatar: MovieReview = {
      ...baseReview,
      author_details: { ...baseReview.author_details, avatar_path: '/avatars/bob.jpg' },
    };
    render(<ReviewCard review={withAvatar} />);
    const avatarImg = screen.getByAltText('Bob') as HTMLImageElement;
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg.src).toContain('bob.jpg');
  });

  it('does not render movie poster when movie_poster_path is null', () => {
    const noPoster: MovieReview = { ...baseReview, movie_poster_path: null };
    render(<ReviewCard review={noPoster} />);
    expect(screen.queryByAltText('Awesome Movie')).not.toBeInTheDocument();
  });
});

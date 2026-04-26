import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchlistGrid } from '@/components/features/watchlist/WatchlistGrid';

const mockMovies = [
  {
    id: 1,
    title: 'Inception',
    poster_path: '/inception.jpg',
    backdrop_path: null,
    release_date: '2010-07-15',
    vote_average: 8.8,
    overview: 'A thief who steals corporate secrets...',
  },
  {
    id: 2,
    title: 'Interstellar',
    poster_path: '/interstellar.jpg',
    backdrop_path: null,
    release_date: '2014-11-05',
    vote_average: 8.6,
    overview: 'A team of explorers travel through a wormhole...',
  }
];

describe('Watchlist UI Components - UT_tubagus_103022300141', () => {
  const onRemoveMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the empty state when no movies are provided', () => {
    render(<WatchlistGrid movies={[]} onRemove={onRemoveMock} />);
    expect(screen.getByText('Your Watchlist is Empty')).toBeInTheDocument();
  });

  it('renders a grid of watchlist cards', () => {
    render(<WatchlistGrid movies={mockMovies} onRemove={onRemoveMock} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
    
    // Check if the remove buttons exist
    const removeButtons = screen.getAllByRole('button', { name: /Remove from Watchlist/i });
    expect(removeButtons).toHaveLength(2);
  });

  it('calls onRemove with correct ID when remove button is clicked', () => {
    jest.useFakeTimers();
    render(<WatchlistGrid movies={mockMovies} onRemove={onRemoveMock} />);
    
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    
    jest.advanceTimersByTime(300);
    
    expect(onRemoveMock).toHaveBeenCalledTimes(1);
    expect(onRemoveMock).toHaveBeenCalledWith(1); // Inception ID
    jest.useRealTimers();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WatchlistPage from '@/app/(features)/watchlist/page';

// Mock next/navigation for Navbar
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/watchlist',
}));

// Mock useAuth since Navbar needs it
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, userProfile: null, isLoading: false })
}));

// Mock fetch for the search API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      movies: [
        {
          id: 555,
          title: 'Mocked Search Result Movie',
          poster_path: null,
          release_date: '2025-01-01',
          vote_average: 9.0,
        }
      ]
    }),
  })
) as jest.Mock;

describe('Watchlist Integration - UT_tubagus_103022300141', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows searching and adding a movie to the watchlist', async () => {
    render(<WatchlistPage />);
    
    // Wait for the hook to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Empty state
    expect(screen.getByText('Your Watchlist is Empty')).toBeInTheDocument();

    // Click Add Movie button to open modal
    const addButton = screen.getByRole('button', { name: /Add Movie/i });
    fireEvent.click(addButton);

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Type a movie name...');
    fireEvent.change(searchInput, { target: { value: 'Mocked' } });

    // Wait for debounce and fetch
    jest.advanceTimersByTime(500);

    // Wait for the API mock to respond and show the result
    await waitFor(() => {
      expect(screen.getByText('Mocked Search Result Movie')).toBeInTheDocument();
    });

    // Click the result to add it
    const addResultButton = screen.getAllByRole('button', { name: /Add/i })[1]; 
    fireEvent.click(addResultButton);

    // The movie should appear in the grid
    expect(screen.getByText('Mocked Search Result Movie')).toBeInTheDocument();
    
    // Test removal
    const removeButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeButton);
    
    // Fast-forward removal animation timeout
    jest.advanceTimersByTime(300);

    // Should be empty again
    await waitFor(() => {
      expect(screen.getByText('Your Watchlist is Empty')).toBeInTheDocument();
    });
  });
});

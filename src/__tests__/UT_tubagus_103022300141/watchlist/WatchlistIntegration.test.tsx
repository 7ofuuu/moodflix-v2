import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WatchlistPage from '@/app/(features)/watchlist/page';

// Mock next/navigation for Navbar
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/watchlist',
}));

// Mock useAuth since Navbar needs it
const mockIntegrationUser = { id: 'test-user-id' };
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockIntegrationUser, userProfile: null, isLoading: false })
}));

// Mock Supabase
jest.mock('@/lib/auth-client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      })),
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      }))
    }))
  }
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
    jest.clearAllMocks();
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

    // Wait for the API mock to respond and show the result (debounce might take a moment, use waitFor)
    await waitFor(() => {
      expect(screen.getByText('Mocked Search Result Movie')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click the result to add it
    const addResultButton = screen.getAllByRole('button', { name: /Add/i })[1]; 
    fireEvent.click(addResultButton);

    // The movie should appear in the grid
    expect(screen.getByText('Mocked Search Result Movie')).toBeInTheDocument();
    
    // Test removal
    const removeButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeButton);

    // Should be empty again
    await waitFor(() => {
      expect(screen.getByText('Your Watchlist is Empty')).toBeInTheDocument();
    });
  });
});

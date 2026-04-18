import { useState, useEffect } from 'react';
import { WatchProvider } from '@/types/movie';

interface WatchProvidersResult {
  providers: WatchProvider[];
  isLoading: boolean;
  error: string | null;
}

export function useWatchProviders(): WatchProvidersResult {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/movies/watch-providers');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setProviders(data.providers ?? []);
        setError(null);
      } catch (err) {
        setError('Failed to load watch providers');
        console.error('Error loading watch providers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, isLoading, error };
}

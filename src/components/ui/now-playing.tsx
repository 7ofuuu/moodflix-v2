'use client';

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/ui/movie-card";
import { MovieDetails } from "@/types/movie";

async function fetchNowPlayingMovies(): Promise<MovieDetails[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_TMDB_API_BASE_URL}/movie/now_playing?language=en-US&page=1`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_TOKEN}`,
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error);
    return [];
  }
}

export default function NowPlaying() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const movies = await fetchNowPlayingMovies();
        setNowPlayingMovies(movies);
      } catch (err) {
        setError("Failed to load movies");
        console.error("Error loading movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <section id="now-playing" className="container py-12 px-7">
      <h2 className="mb-12 text-center text-3xl font-bold">Now Playing Movies</h2>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && nowPlayingMovies.length === 0 && !error && (
        <div className="text-center text-gray-500">No movies found</div>
      )}

      {!isLoading && nowPlayingMovies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          {nowPlayingMovies.slice(0, 20).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

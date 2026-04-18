'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from 'react';
import { MovieDetails } from "@/types/movie";
import { GENRES } from '@/lib/constants';

interface MovieCardProps {
  movie: MovieDetails;
}

function compactDescription(text: string | null | undefined): string {
  const normalized = text?.trim();
  if (!normalized) {
    return 'No description available.';
  }
  return normalized;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const genreNames = useMemo(() => {
    if (movie.genre_names && movie.genre_names.length > 0) {
      return movie.genre_names.slice(0, 2);
    }

    if (!movie.genre_ids || movie.genre_ids.length === 0) {
      return [];
    }

    return movie.genre_ids
      .map(id => GENRES.find(genre => genre.id === id)?.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 2);
  }, [movie.genre_ids, movie.genre_names]);

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  const popupDescription = useMemo(
    () => compactDescription(movie.recommendation_reason || movie.overview),
    [movie.recommendation_reason, movie.overview]
  );

  const cardDescription = useMemo(
    () => compactDescription(movie.overview),
    [movie.overview]
  );

  return (
    <div ref={wrapperRef} className={`reveal ${isVisible ? 'reveal-visible' : ''}`}>
      <Card className="group/card card-lift h-full flex flex-col overflow-hidden border border-border/70 bg-linear-to-b from-white/95 to-white/85 py-0 shadow-sm dark:from-slate-900/95 dark:to-slate-800/80">
        <div className="relative h-[270px] w-full bg-gray-200 sm:h-[300px] lg:h-[320px]">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              quality={92}
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          <div className="movie-popup p-3 group-hover/card:movie-popup-visible group-focus-within/card:movie-popup-visible">
            <div className="rounded-xl border border-white/15 bg-black/82 p-3 text-white shadow-xl backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium">{releaseYear}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                  <span className="text-yellow-300">★</span>
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
              </div>
              {genreNames.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {genreNames.map(name => (
                    <span
                      key={name}
                      className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              <p className="line-clamp-3 text-xs text-white/90">
                {popupDescription}
              </p>
            </div>
          </div>
        </div>
        <CardHeader className="px-5">
          <CardTitle className="truncate text-base">{movie.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>{releaseYear}</span>
            <span>•</span>
            <span className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grow px-5 pb-1">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {cardDescription}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <a
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Details
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

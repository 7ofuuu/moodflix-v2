import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from 'react';
import { MovieDetails } from "@/types/movie";
import { Trash2, CheckCircle } from "lucide-react";

interface WatchlistCardProps {
  movie: MovieDetails;
  onRemove: (id: number) => void;
}

export function WatchlistCard({ movie, onRemove }: WatchlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  const cardDescription = useMemo(() => {
    return movie.overview?.trim() || 'No description available.';
  }, [movie.overview]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(movie.id);
    }, 300); // Wait for the transition to finish before actually removing
  };

  return (
    <div className={`transition-all duration-300 ease-in-out h-full ${isRemoving ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
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
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
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
        <CardFooter className="flex flex-col gap-2 w-full mt-auto">
          <Button className="w-full" variant="outline" asChild>
            <Link href={`/movie/${movie.id}`}>
              Details
            </Link>
          </Button>
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            onClick={() => alert("Watched list feature coming soon! (Waiting for backend integration)")}
            aria-label="Mark as Watched"
          >
            <CheckCircle className="h-4 w-4" /> Watched
          </Button>
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label="Remove from Watchlist"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

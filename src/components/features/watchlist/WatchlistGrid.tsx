import { MovieDetails } from "@/types/movie";
import { WatchlistCard } from "./WatchlistCard";
import { Film } from "lucide-react";

interface WatchlistGridProps {
  movies: MovieDetails[];
  onRemove: (id: number) => void;
}

export function WatchlistGrid({ movies, onRemove }: WatchlistGridProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Film className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Your Watchlist is Empty</h3>
        <p className="text-muted-foreground mt-2 max-w-[400px]">
          Looks like you haven&apos;t added any movies to your watchlist yet. Go discover some movies to watch!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
      {movies.map((movie) => (
        <WatchlistCard 
          key={movie.id} 
          movie={movie} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
}

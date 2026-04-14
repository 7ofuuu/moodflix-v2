'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MovieDetails } from "@/types/movie";

interface MovieCardProps {
  movie: MovieDetails;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden py-0">
      <div className="relative w-full aspect-2/3 bg-gray-200">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            className="object-cover py-0"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="truncate text-base">{movie.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <span>
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            {movie.vote_average
              ? movie.vote_average.toFixed(1)
              : "N/A"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {movie.overview || "No description available."}
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
  );
}

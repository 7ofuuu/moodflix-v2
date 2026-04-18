'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { MovieReview } from '@/types/movie';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: MovieReview;
}

const TRUNCATE_LENGTH = 300;

export function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLong = review.content.length > TRUNCATE_LENGTH;
  const displayContent = expanded || !isLong
    ? review.content
    : review.content.slice(0, TRUNCATE_LENGTH) + '...';

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const avatarUrl = review.author_details.avatar_path
    ? review.author_details.avatar_path.startsWith('/http')
      ? review.author_details.avatar_path.slice(1)
      : `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
    : null;

  return (
    <Card className='border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden'>
      <CardContent className='p-5'>
        <div className='flex gap-4'>
          {/* Movie poster */}
          {review.movie_poster_path && (
            <div className='hidden sm:block flex-shrink-0'>
              <Image
                src={`https://image.tmdb.org/t/p/w92${review.movie_poster_path}`}
                alt={review.movie_title}
                width={60}
                height={90}
                className='rounded-lg object-cover'
              />
            </div>
          )}

          <div className='flex-1 min-w-0'>
            {/* Movie title */}
            <h3 className='text-sm font-semibold text-white truncate'>
              {review.movie_title}
            </h3>

            {/* Author and rating */}
            <div className='mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/50'>
              <span className='flex items-center gap-1.5'>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={review.author}
                    width={18}
                    height={18}
                    className='rounded-full'
                  />
                ) : (
                  <span className='flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/10 text-[10px] text-white/60'>
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className='text-white/70'>{review.author}</span>
              </span>

              {review.author_details.rating != null && (
                <span className='flex items-center gap-1'>
                  <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                  <span className='text-amber-400/80'>{review.author_details.rating}/10</span>
                </span>
              )}

              <span>{formattedDate}</span>
            </div>

            {/* Content */}
            <p className='mt-3 text-sm leading-relaxed text-white/60 whitespace-pre-line break-words'>
              {displayContent}
            </p>

            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className='mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors'
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

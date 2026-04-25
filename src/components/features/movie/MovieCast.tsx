'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export function MovieCast({ cast, movieId }: { cast: CastMember[], movieId: number }) {
  if (!cast || cast.length === 0) return null;

  return (
    <section className="relative w-full">
      <h3 className="text-2xl font-black text-white mb-6">Top Cast</h3>

      <div 
        className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x scroll-smooth"
        style={{ scrollbarColor: '#334155 transparent', scrollbarWidth: 'thin' }}
      >
        {cast.map(c => (
          <a 
            key={c.id}
            href={`https://www.themoviedb.org/person/${c.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start flex-shrink-0 w-[140px] rounded-xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-xl flex flex-col transition-all hover:-translate-y-2 hover:bg-slate-800/80 cursor-pointer group"
          >
            <div className="w-full aspect-[2/3] bg-slate-800 relative">
              {c.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-semibold">No Photo</div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 justify-start">
              <span className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">{c.name}</span>
              <span className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-snug">{c.character}</span>
            </div>
          </a>
        ))}
        {cast.length >= 9 && (
          <a
            href={`https://www.themoviedb.org/movie/${movieId}/cast`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[140px] flex items-center justify-center snap-start group bg-slate-900/30 rounded-xl border border-white/5 hover:border-white/20 transition-all hover:bg-slate-800/50"
          >
            <span className="font-bold text-sm text-slate-300 group-hover:text-white flex items-center gap-2">
              View More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

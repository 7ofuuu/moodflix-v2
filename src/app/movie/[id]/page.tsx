import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Star, Calendar, Clock, Play, PenTool } from 'lucide-react';
import { MovieActions } from '@/components/features/movie/MovieActions';
import { MovieCast } from '@/components/features/movie/MovieCast';

interface MovieDetailParams {
  readonly id: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

interface Video {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface Keyword {
  id: number;
  name: string;
}

interface ReleaseDate {
  iso_3166_1: string;
  release_dates: { certification: string }[];
}

interface MovieDetailsData {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  original_language: string;
  budget: number;
  revenue: number;
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: {
    results: Video[];
  };
  reviews: {
    results: Review[];
  };
  keywords: {
    keywords: Keyword[];
  };
  release_dates: {
    results: ReleaseDate[];
  };
}

async function getMovieDetails(id: string): Promise<MovieDetailsData | null> {
  const TMDB_API_BASE_URL = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
  const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

  if (!TMDB_API_TOKEN) {
    throw new Error('TMDB API token is missing');
  }

  const res = await fetch(`${TMDB_API_BASE_URL}/movie/${id}?language=en-US&append_to_response=credits,videos,reviews,keywords,release_dates`, {
    headers: {
      Authorization: `Bearer ${TMDB_API_TOKEN}`,
      accept: 'application/json',
    },
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch movie details from TMDB');
  }

  return res.json();
}

export default async function MovieDetailPage({ params }: { params: Promise<MovieDetailParams> | MovieDetailParams }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  if (!movie) {
    notFound();
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const hoursDisplay = hours > 0 ? `${hours}h ` : '';
  const formattedRuntime = `${hoursDisplay}${minutes}m`;

  const topCast = movie.credits?.cast?.slice(0, 9) || [];
  const trailer = movie.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  const topReviews = movie.reviews?.results?.slice(0, 2) || [];
  const directors = movie.credits?.crew?.filter(c => c.job === 'Director') || [];

  const formatMoney = (amount: number) => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <main className="min-h-screen bg-slate-950 pb-20 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Dynamic Backdrop Background */}
      <div className="relative w-full h-[55vh] md:h-[65vh] lg:h-[75vh]">
        {movie.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={`${movie.title} Backdrop`}
            fill
            className="object-cover object-top opacity-60"
            priority
          />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        {/* Core Moodflix Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent md:via-slate-950/40 z-0" />
        <div className="absolute inset-0 bg-slate-950/20 z-0" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            href="/" 
            className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/50 hover:bg-amber-500 backdrop-blur-md text-white border border-white/10 hover:border-amber-400 transition-all shadow-xl group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Content Area Overlapping */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 relative z-10">
        
        {/* HERO GRID */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Poster Section (Left) */}
          <div className="flex-shrink-0 w-48 mx-auto md:mx-0 md:w-72 lg:w-80">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-800 group">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 192px, 288px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">No Hero</div>
              )}
            </div>
            
            {/* Play Trailer Box */}
            {trailer && (
              <a 
                href="#trailer-section"
                className="mt-6 flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-amber-500 text-white hover:text-amber-950 border border-white/10 hover:border-amber-500 font-bold py-4 rounded-xl transition-all shadow-lg backdrop-blur-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-amber-950/20 flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                Watch Trailer
              </a>
            )}
          </div>

          {/* Core Details Section (Right) */}
          <div className="flex flex-col justify-end pt-4 md:pt-16 pb-2">
            {movie.tagline && (
              <p className="text-amber-400 font-medium tracking-widest text-xs md:text-sm uppercase mb-3 drop-shadow-md">
                {movie.tagline}
              </p>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-xl">
              {movie.title}
            </h1>

            {/* Pill Badges (Moodflix specific design) */}
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold mb-8">
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 py-1.5 px-4 rounded-full border border-amber-500/20 shadow-sm backdrop-blur-md">
                <Star className="w-4 h-4 fill-current" />
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 text-slate-300 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-md">
                <Calendar className="w-4 h-4" />
                <span>{releaseYear}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 text-slate-300 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-md">
                <Clock className="w-4 h-4" />
                <span>{formattedRuntime}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 text-slate-300 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-md uppercase tracking-wider text-xs">
                {movie.original_language}
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {movie.genres.map((genre) => (
                  <span 
                    key={genre.id} 
                    className="px-3 py-1 text-xs md:text-sm font-medium rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700/50 shadow-sm backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                Synopsis
              </h3>
              <p className="text-slate-300 leading-relaxed md:text-lg max-w-3xl font-medium opacity-90">
                {movie.overview || 'No overview available for this movie.'}
              </p>
            </div>
            
            {/* Directors Row */}
            {directors.length > 0 && (
               <div className="mb-8 pb-8 flex gap-8 border-b border-white/10">
                 <div>
                   <p className="text-slate-400 text-sm font-medium mb-1">Directed by</p>
                   <p className="text-white font-bold text-lg">{directors.map(d => d.name).join(', ')}</p>
                 </div>
               </div>
            )}

            {/* Interactivity Buttons */}
            <div>
              <MovieActions movieId={movie.id} />
            </div>

          </div>
        </div>
        
        {/* LOWER CONTENT SECTIONS */}
        <div className="mt-20 flex flex-col gap-16 max-w-5xl">
          
          {/* Top Billed Cast */}
          {topCast.length > 0 && (
            <MovieCast cast={topCast} movieId={movie.id} />
          )}

          {/* Media Player */}
          {trailer && (
            <section id="trailer-section" className="scroll-mt-8">
              <h3 className="text-2xl font-black text-white mb-6">Official Trailer</h3>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}

          {/* Reviews Area */}
          <section>
             <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-black text-white">Audience Reviews</h3>
                  <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-sm mb-1">
                    {movie.reviews?.results?.length || 0}
                  </span>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-slate-800 text-white rounded-xl text-sm font-bold border border-white/10 transition-all hover:border-slate-500">
                   <PenTool className="w-4 h-4 text-slate-400" />
                   Write Review
                </button>
             </div>
             
             {topReviews.length > 0 ? (
                <div className="grid gap-6">
                  {topReviews.map((review) => (
                    <div key={`review-${review.id}`} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-500 text-amber-950 rounded-full flex items-center justify-center font-black text-xl shadow-md">
                            {review.author[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-lg">{review.author}</span>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-loose text-sm md:text-base opacity-90 line-clamp-6">
                        &ldquo;{review.content}&rdquo;
                      </p>
                    </div>
                  ))}
                  <div className="mt-4 flex justify-center">
                    <a 
                      href={`https://www.themoviedb.org/movie/${movie.id}/reviews`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 font-bold text-sm hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
                    >
                      Read all {movie.reviews?.results?.length} reviews on TMDB
                    </a>
                  </div>
                </div>
             ) : (
                <div className="py-12 text-center border border-white/5 bg-slate-900/30 rounded-2xl">
                   <p className="text-slate-400 font-medium">No reviews have been written yet.</p>
                </div>
             )}
          </section>

          {/* Footer Metadata Facts */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900/50 p-8 rounded-2xl border border-white/5 mb-10">
             <div>
               <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</span>
               <span className="text-white font-medium">{movie.status}</span>
             </div>
             <div>
               <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Language</span>
               <span className="text-white font-medium uppercase">{movie.original_language}</span>
             </div>
             <div>
               <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Budget</span>
               <span className="text-white font-medium">{formatMoney(movie.budget)}</span>
             </div>
             <div>
               <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Revenue</span>
               <span className="text-white font-medium">{formatMoney(movie.revenue)}</span>
             </div>
          </section>

        </div>
      </div>
    </main>
  );
}

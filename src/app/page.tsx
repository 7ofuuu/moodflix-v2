import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import FooterComponent from '@/components/ui/footer';
import Navbar from '@/components/ui/navbar';
import NowPlayingPage from '@/components/ui/now-playing';

const MOODS = [
  { id: 'happy', name: 'Happy', emoji: '😊', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { id: 'sad', name: 'Melancholic', emoji: '😔', color: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'excited', name: 'Thrilled', emoji: '🤩', color: 'bg-red-100 hover:bg-red-200' },
  { id: 'cozy', name: 'Cozy', emoji: '☕', color: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'nostalgic', name: 'Nostalgic', emoji: '🕰️', color: 'bg-purple-100 hover:bg-purple-200' },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section
          className='relative container mx-auto px-4 py-16 md:py-32 overflow-hidden'
          aria-labelledby='hero-heading'
        >
          <div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-3xl' />
          <div className='mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 text-center'>
            <h1
              id='hero-heading'
              className='text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-tight'
            >
              What&apos;s your <span className='bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent'>mood</span> today?
            </h1>
            <p className='max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-8'>Discover movies that match your emotions. Get personalized recommendations based on exactly how you feel right now.</p>
            <div className='flex gap-4 pt-4'>
              <Button
                asChild
                size='lg'
                className='rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg'
              >
                <Link href='/quiz'>Take the Mood Quiz</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mood Selection Grid */}
        <section
          className='container mx-auto px-4 py-16 md:py-20'
          aria-labelledby='mood-categories'
        >
          <h2
            id='mood-categories'
            className='mb-12 text-center text-4xl font-bold'
          >
            Popular Mood Categories
          </h2>
          <div
            className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5'
            role='group'
            aria-label='Mood categories'
          >
            {MOODS.map(mood => (
              <Button
                key={mood.id}
                variant='outline'
                className={`group relative h-40 flex-col gap-3 rounded-2xl border-2 text-base font-semibold transition-all duration-300 hover:scale-110 hover:shadow-xl overflow-hidden ${mood.color} border-transparent hover:border-primary/30`}
                asChild
              >
                <Link
                  href={`/results?mood=${mood.id}`}
                  aria-label={`Browse ${mood.name} movies`}
                  className='flex flex-col items-center justify-center'
                >
                  <span
                    className='text-5xl transition-transform group-hover:scale-125'
                    role='img'
                    aria-label={mood.name}
                  >
                    {mood.emoji}
                  </span>
                  <span className='font-semibold text-sm sm:text-base'>{mood.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </section>

        {/* Now Playing Section */}
        <section aria-labelledby='now-playing'>
          <NowPlayingPage />
        </section>

        {/* CTA Section */}
        <section
          className='container mx-auto px-4 py-16 md:py-20'
          aria-labelledby='cta-section'
        >
          <Card className='relative overflow-hidden border-0 shadow-2xl'>
            <div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/20 via-secondary/10 to-primary/5' />
            <CardHeader className='text-center pb-8 pt-12'>
              <h2
                id='cta-section'
                className='text-4xl font-bold sm:text-5xl bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent'
              >
                Ready to find your perfect movie match?
              </h2>
            </CardHeader>
            <CardContent className='flex justify-center pb-12'>
              <Button
                size='lg'
                asChild
                className='rounded-full px-10 py-7 text-lg font-semibold transition-all hover:scale-105 hover:shadow-xl'
              >
                <Link
                  href='/quiz'
                  className='flex items-center gap-2'
                >
                  Start Mood Quiz Now
                  <span
                    className='text-2xl transition-transform group-hover:scale-110'
                    role='img'
                    aria-label='Movie camera'
                  >
                    🎬
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <FooterComponent />
    </>
  );
}

import Link from 'next/link';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { ArrowLeft, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — MoodFlix',
  description: 'Terms and conditions for using MoodFlix.',
};

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing and using MoodFlix, you accept and agree to be bound by these terms. If you do not agree to these terms, please do not use the service.',
  },
  {
    title: 'Use of Service',
    body: 'MoodFlix is provided for personal, non-commercial use. You may not use the service in any way that could damage, disable, overburden, or impair the service or interfere with any other party\'s use.',
  },
  {
    title: 'Movie Content & Data',
    body: 'All movie information, posters, and backdrop images are provided by The Movie Database (TMDB). MoodFlix is not affiliated with TMDB. Movie recommendations are AI-generated and may not always be accurate or appropriate for every viewer.',
  },
  {
    title: 'AI-Generated Recommendations',
    body: 'The quiz feature uses Google Gemini AI to generate movie recommendations based on your mood responses. These recommendations are generated automatically and should be treated as suggestions only. We make no guarantee of their accuracy or suitability.',
  },
  {
    title: 'Intellectual Property',
    body: 'The MoodFlix application code, design, and branding are the property of the project contributors. Third-party content (movie data, images) belongs to their respective owners.',
  },
  {
    title: 'Disclaimer of Warranties',
    body: 'MoodFlix is provided "as is" without warranty of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. Use the service at your own risk.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by law, MoodFlix shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use the service.',
  },
  {
    title: 'Changes to Terms',
    body: 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-black text-white page-enter'>
        {/* Subtle hero gradient */}
        <div className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-950/15 to-transparent pointer-events-none' aria-hidden='true' />

        <div className='container mx-auto max-w-2xl px-4 py-16 md:py-24 relative'>
          {/* Back link */}
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm text-white/45 hover:text-white/80 transition-colors mb-10'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to home
          </Link>

          {/* Header */}
          <div className='mb-12'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/20'>
                <ScrollText className='w-5 h-5 text-amber-400' />
              </div>
              <span className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400/70'>
                Legal
              </span>
            </div>
            <h1 className='text-4xl font-black text-white mb-3'>Terms of Service</h1>
            <p className='text-white/45 text-sm'>Last updated: April 2026</p>
          </div>

          {/* Intro */}
          <p className='text-white/70 leading-relaxed mb-10'>
            Welcome to MoodFlix. These terms govern your use of our movie recommendation service.
            Please read them carefully before using the platform.
          </p>

          {/* Sections */}
          <div className='space-y-8'>
            {SECTIONS.map((section, i) => (
              <div key={i} className='border-l-2 border-white/8 pl-6'>
                <h2 className='text-lg font-bold text-white mb-2'>{section.title}</h2>
                <p className='text-white/60 leading-relaxed text-sm md:text-base'>{section.body}</p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className='mt-14 pt-8 border-t border-white/8'>
            <p className='text-white/30 text-xs'>
              © 2026 MoodFlix. Built for educational purposes as part of a university DevOps course.
            </p>
          </div>
        </div>
      </main>
      <FooterComponent />
    </>
  );
}

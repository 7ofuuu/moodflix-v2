import Link from 'next/link';
import Navbar from '@/components/ui/navbar';
import FooterComponent from '@/components/ui/footer';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MoodFlix',
  description: 'How MoodFlix handles your data and privacy.',
};

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'MoodFlix collects minimal information to function. Your mood selections are stored locally in your browser (localStorage) and are never transmitted to our servers. We do not require account creation or personal information to use the service.',
  },
  {
    title: 'Third-Party Services',
    body: 'Movie data is fetched from The Movie Database (TMDB) API. Movie recommendations on the quiz page are powered by Google Gemini AI. Both services operate under their own privacy policies. Images are served directly from TMDB\'s CDN.',
  },
  {
    title: 'Local Storage',
    body: 'We use your browser\'s localStorage to remember your last mood selection so we can show personalised recommendations on the homepage. You can clear this at any time by clearing your browser\'s site data for MoodFlix.',
  },
  {
    title: 'Analytics & Tracking',
    body: 'MoodFlix does not use advertising trackers, third-party analytics, or cookies beyond what is strictly necessary to deliver the service.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this privacy policy from time to time. Changes will be reflected on this page with the updated date shown below.',
  },
  {
    title: 'Contact',
    body: 'This project is built as part of a university DevOps course (Semester 6 RPL). For questions, reach out via the project repository.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-black text-white page-enter'>
        {/* Subtle hero gradient */}
        <div className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none' aria-hidden='true' />

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
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-400/20'>
                <ShieldCheck className='w-5 h-5 text-violet-400' />
              </div>
              <span className='text-xs font-bold uppercase tracking-[0.2em] text-violet-400/70'>
                Legal
              </span>
            </div>
            <h1 className='text-4xl font-black text-white mb-3'>Privacy Policy</h1>
            <p className='text-white/45 text-sm'>Last updated: April 2026</p>
          </div>

          {/* Intro */}
          <p className='text-white/70 leading-relaxed mb-10'>
            MoodFlix is committed to protecting your privacy. This policy explains what information
            we collect (very little), how we use it, and your rights regarding that information.
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

import type { Metadata } from "next";
import { Sora } from 'next/font/google';
import { ScrollProgressBar } from '@/components/ui/scroll-progress';
import { ThemeController } from '@/components/ui/theme-controller';
import { WaterDropTransitionProvider } from '@/components/ui/water-drop-transition';
import "./globals.css";

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MoodFlix',
  description: 'Find movie recommendations based on your mood with cinematic interactions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <WaterDropTransitionProvider>
          <ThemeController />
          <ScrollProgressBar />
          {children}
        </WaterDropTransitionProvider>
      </body>
    </html>
  );
}

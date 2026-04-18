import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FooterComponent() {
  return (
    <footer className='bg-zinc-950 border-t border-white/6'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-7'>
        <div className='flex flex-col items-center gap-1 md:items-start'>
          <span className='text-base font-bold text-white/80'>MoodFlix</span>
          <p className='text-xs text-white/35'>© 2026 MoodFlix. All rights reserved.</p>
        </div>
        <div className='flex gap-1'>
          <Button variant='ghost' size='sm' className='text-white/40 hover:text-white/70 hover:bg-white/5' asChild>
            <Link href='/privacy'>Privacy</Link>
          </Button>
          <Button variant='ghost' size='sm' className='text-white/40 hover:text-white/70 hover:bg-white/5' asChild>
            <Link href='/terms'>Terms</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}

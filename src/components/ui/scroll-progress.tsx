'use client';

import { useScrollProgress } from '../../hooks/useScrollProgress';

export function ScrollProgressBar() {
	const progress = useScrollProgress();

	return (
		<div className='pointer-events-none fixed left-0 top-0 z-[90] h-2 w-screen overflow-hidden bg-black/30 shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:bg-white/15 md:h-2.5'>
			<div className='absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-black/20 dark:from-white/20 dark:to-black/10' />
			<div
				className='relative h-full origin-left bg-linear-to-r from-amber-300 via-orange-500 to-red-500 shadow-[0_0_20px_rgba(249,115,22,0.85)] transition-transform duration-150 ease-[var(--ease-out-soft)]'
				style={{ transform: `scaleX(${progress})` }}
			/>
		</div>
	);
}


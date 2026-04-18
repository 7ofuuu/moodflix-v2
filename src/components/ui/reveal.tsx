'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface RevealProps {
	children: ReactNode;
	className?: string;
	delayMs?: number;
	threshold?: number;
}

export function Reveal({
	children,
	className,
	delayMs = 0,
	threshold = 0.2,
}: RevealProps) {
	const [isVisible, setIsVisible] = useState(false);
	const elementRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const node = elementRef.current;
		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				const [entry] = entries;
				setIsVisible(entry.isIntersecting);
			},
			{ threshold }
		);

		observer.observe(node);

		return () => observer.disconnect();
	}, [threshold]);

	return (
		<div
			ref={elementRef}
			className={`reveal ${isVisible ? 'reveal-visible' : ''} ${className ?? ''}`.trim()}
			style={{ transitionDelay: `${delayMs}ms` }}
		>
			{children}
		</div>
	);
}


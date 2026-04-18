'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delayStepMs?: number;
  leadingContent?: ReactNode;
  trailingContent?: ReactNode;
}

export function SplitText({
  text,
  className,
  wordClassName,
  delayStepMs = 70,
  leadingContent,
  trailingContent,
}: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const words = text.split(' ').filter(Boolean);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={rootRef}
      className={`split-text ${isVisible ? 'split-text-visible' : ''} ${className ?? ''}`.trim()}
    >
      {leadingContent}
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`split-word ${wordClassName ?? ''}`.trim()}
          style={{ transitionDelay: `${index * delayStepMs}ms` }}
        >
          {word}
        </span>
      ))}
      {trailingContent}
    </span>
  );
}

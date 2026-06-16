/**
 * UI utility and shared component types
 */

import type { ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: ReactNode;
  [key: string]: unknown;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  [key: string]: unknown;
}

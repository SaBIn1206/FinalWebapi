import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual tone: light surfaces (default) or the dark admin console. */
  tone?: 'light' | 'dark';
  hoverable?: boolean;
}

/**
 * Standard content surface. Uses the design-system radius and border tokens.
 */
export function Card({ tone = 'light', hoverable = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border',
        tone === 'light'
          ? 'bg-surface border-border'
          : 'bg-night-elevated border-night-border text-night-ink',
        hoverable && 'hover-card',
        className
      )}
      {...props}
    />
  );
}

export default Card;

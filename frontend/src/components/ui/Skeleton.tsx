import React from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-muted', className)} />;
}

export function Spinner({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        'h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin',
        tone === 'dark' ? 'text-night-ink-soft' : 'text-ink-faint',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Skeleton;

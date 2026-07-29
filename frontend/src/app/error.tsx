'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-black text-ink mb-2">Something went wrong</h2>
      <p className="text-ink-soft text-sm mb-6 max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">Try again</Button>
      </div>
    </div>
  );
}

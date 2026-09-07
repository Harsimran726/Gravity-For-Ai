'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from '@/components/ui/section-wrapper';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Sentry / Error logging point
    console.error('Runtime error:', error);
  }, [error]);

  return (
    <SectionWrapper variant="white" className="min-h-[70vh] flex items-center justify-center text-center">
      <div className="max-w-md mx-auto space-y-6">
        <span className="font-mono text-xs tracking-widest uppercase text-[#C99A44]">
          System Alert
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
          An Unexpected Event Occurred
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
          The application encountered an error while processing your request.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Button onClick={() => reset()} variant="primary" size="md">
            Try Again
          </Button>
          <Button href="/" variant="ghost" size="md">
            Return Home
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

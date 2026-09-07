import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from '@/components/ui/section-wrapper';

export default function NotFound() {
  return (
    <SectionWrapper variant="white" className="min-h-[70vh] flex items-center justify-center text-center">
      <div className="max-w-md mx-auto space-y-6">
        <span className="font-mono text-xs tracking-widest uppercase text-[#C99A44]">
          Error 404
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#122C57] font-normal leading-tight">
          Page Beyond Orbit
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
          The page you are looking for has moved or does not exist in our coordinates.
        </p>
        <div className="pt-4">
          <Button href="/" variant="primary" size="md">
            Return to Center
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

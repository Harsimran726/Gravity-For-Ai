import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ScrollReveal, ParallaxLayer } from '@/components/ui/physics-effects';

export function ClosingCtaSection() {
  return (
    <SectionWrapper variant="black" id="contact" className="py-24 sm:py-32 lg:py-40 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <ScrollReveal>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Enter the Orbit
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FFFFFF] font-normal leading-tight">
            Ready to Reclaim Your Time?
          </h2>
        </ScrollReveal>

        <ParallaxLayer speed={0.2}>
          <p className="font-sans text-sm sm:text-base lg:text-lg text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
            Book a free 20-minute AI audit. We will analyze your operations, identify where you&apos;re losing hours or inquiries, and show you what an automated system looks like.
          </p>
        </ParallaxLayer>

        <div className="pt-6 flex justify-center">
          <Button href="/contact" size="lg" variant="dark-cta">
            Book an AI Audit
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

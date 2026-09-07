import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ScrollReveal, StaggerReveal, GravityPull } from '@/components/ui/physics-effects';

const STEPS = [
  {
    num: '01',
    title: 'Book a Call',
    description:
      'A free 20-minute AI audit. We analyze where your business is losing hours or missing potential inquiries.',
  },
  {
    num: '02',
    title: 'We Build It',
    description:
      'We architect, build, and test your voice agent, automation pipeline, or website end-to-end around your process.',
  },
  {
    num: '03',
    title: 'Reclaim Your Time',
    description:
      'Go live seamlessly and get hours back every week - while we remain in orbit to monitor, tune, and maintain the system.',
  },
];

export function PlanSection() {
  return (
    <SectionWrapper variant="white" id="how-it-works">
      {/* Anchor fallback for #plan as well */}
      <div id="plan" className="sr-only" />
      <ScrollReveal>
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            The 3-Step Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-[#0A1B3D]/80">
            No complex onboarding labyrinths. Three clear steps from where you are today to an automated system.
          </p>
        </div>
      </ScrollReveal>

      {/* 3 Step Timeline Container */}
      <div className="relative mt-14">
        {/* Subtle connecting track for desktop placed behind cards */}
        <div className="hidden md:block absolute top-6 left-12 right-12 h-[1px] bg-[#E4E2DC] z-0 pointer-events-none" />

        {/* 3 Step Grid: exactly 3 items so they align 1:1 in 3 columns */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
          {STEPS.map((step) => (
            <GravityPull key={step.num}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#122C57] flex items-center justify-center font-mono text-sm font-semibold text-[#122C57] shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-serif text-2xl text-[#122C57]">{step.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{step.description}</p>
              </div>
            </GravityPull>
          ))}
        </StaggerReveal>
      </div>

      <div className="pt-12 mt-8 flex justify-start">
        <Button href="/contact" size="lg" variant="primary">
          Schedule Your AI Audit
        </Button>
      </div>
    </SectionWrapper>
  );
}

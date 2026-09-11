import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Careers & Engineering Team | Gravity For AI',
  description: 'Join the engineering team at Gravity For AI in Mansa, Punjab building next-generation agentic AI and voice systems.',
  alternates: {
    canonical: 'https://gravityforai.com/careers',
  },
  openGraph: {
    url: 'https://gravityforai.com/careers',
    title: 'Careers & Engineering Team | Gravity For AI',
    description: 'Join the engineering team at Gravity For AI in Mansa, Punjab building next-generation agentic AI and voice systems.',
  },
};

export default function CareersPage() {
  return (
    <div className="w-full flex flex-col">
      <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-20">
        <div className="max-w-3xl space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Join Our Orbit
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57] font-normal leading-[1.06]">
            Engineering the Future of Applied AI
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed">
            We are building high-precision AI voice agents and agentic pipelines from Mansa, Punjab. We look for engineers who care about architectural rigor, low latency, and real-world client impact.
          </p>
        </div>

        <div className="mt-14 space-y-6 max-w-3xl">
          <Card variant="outline" className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#C99A44] uppercase">Engineering / Remote or Mansa</span>
              <span className="font-mono text-xs text-[#6B7280]">Full-Time / Contract</span>
            </div>
            <h2 className="font-serif text-2xl text-[#122C57]">Agentic AI & Telephony Engineer</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Experience with Python, LLM orchestration frameworks, WebSockets, WebRTC, and low-latency voice synthesis pipelines.
            </p>
            <div className="pt-4">
              <Button href="mailto:contact@gravityforai.com?subject=Careers%20-%20AI%20Engineer" variant="ghost" size="sm">
                Apply via Email
              </Button>
            </div>
          </Card>

          <Card variant="outline" className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#C99A44] uppercase">Frontend / Design Engineering</span>
              <span className="font-mono text-xs text-[#6B7280]">Full-Time / Contract</span>
            </div>
            <h2 className="font-serif text-2xl text-[#122C57]">Next.js & Design Systems Specialist</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Mastery of Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Core Web Vitals optimization.
            </p>
            <div className="pt-4">
              <Button href="mailto:contact@gravityforai.com?subject=Careers%20-%20Frontend%20Engineer" variant="ghost" size="sm">
                Apply via Email
              </Button>
            </div>
          </Card>
        </div>
      </SectionWrapper>
    </div>
  );
}

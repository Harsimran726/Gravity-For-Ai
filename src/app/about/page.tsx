import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrbitAura } from '@/components/ui/orbit-aura';
import { ZeroGravity, HeavyDraggable, ScrollReveal } from '@/components/ui/physics-effects';
import { MapPin, Code, Cpu, Shield } from 'lucide-react';
import { FounderWorkbench } from '@/components/visuals/founder-workbench';

export const metadata: Metadata = {
  title: 'About Us | Gravity For AI - Mansa, Punjab',
  description:
    'Meet Gravity For AI, founded by Harsimran Singh in Mansa, Punjab. We build custom AI voice agents, high-performance websites, and agentic workflows for growing businesses.',
  alternates: {
    canonical: 'https://gravityforai.com/about',
  },
  openGraph: {
    url: 'https://gravityforai.com/about',
    title: 'About Us | Gravity For AI - Mansa, Punjab',
    description:
      'Meet Gravity For AI, founded by Harsimran Singh in Mansa, Punjab. We build custom AI voice agents, high-performance websites, and agentic workflows for growing businesses.',
  },
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
              <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
              <span>Founded in Mansa, Punjab</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57] font-normal leading-[1.06]">
              Quiet Authority. <br />
              Serious Engineering.
            </h1>
          </ScrollReveal>

          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed">
            Most AI consulting for small businesses is either dense, unapproachable enterprise jargon or cheap templates. We built Gravity For AI to give local and growing business owners direct access to world-class agentic AI and web systems.
          </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <ZeroGravity className="w-full flex justify-center">
              <FounderWorkbench />
            </ZeroGravity>
          </div>
        </div>
      </SectionWrapper>

      {/* Founder & Engineering Philosophy (E-E-A-T) */}
      <SectionWrapper variant="warm" id="founder">
        <div className="max-w-3xl space-y-6">
          <ScrollReveal>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              The Founder &amp; Lead Engineer
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
              Harsimran Singh - AI Engineer
            </h2>
          </ScrollReveal>

          <div className="space-y-4 text-sm sm:text-base text-[#0A1B3D]/90 leading-relaxed">
            <p>
              With deep specialization in **Agentic AI systems, Machine Learning architectures, and LLM foundations**, Harsimran founded Gravity For AI with a single mission: to remove the friction of technology for business owners who don&apos;t have time to become AI experts themselves.
            </p>
            <p>
              Instead of handing clients a complex SaaS dashboard and wishing them luck, Gravity For AI operates on a **done-for-you model** - architecting, testing, deploying, and maintaining your voice agents and web systems end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <HeavyDraggable>
              <Card variant="outline" className="space-y-2 bg-[#FFFFFF] h-full">
                <Cpu className="w-5 h-5 text-[#122C57]" />
                <p className="font-sans font-medium text-sm text-[#122C57]">Agentic AI</p>
                <p className="text-xs text-[#6B7280]">Autonomous multi-step pipeline architectures</p>
              </Card>
            </HeavyDraggable>

            <HeavyDraggable>
              <Card variant="outline" className="space-y-2 bg-[#FFFFFF] h-full">
                <Code className="w-5 h-5 text-[#122C57]" />
                <p className="font-sans font-medium text-sm text-[#122C57]">Web Development that Generates Business</p>
                <p className="text-xs text-[#6B7280]">High-conversion, sub-2s web engineering built for real ROI</p>
              </Card>
            </HeavyDraggable>

            <HeavyDraggable>
              <Card variant="outline" className="space-y-2 bg-[#FFFFFF] h-full">
                <Shield className="w-5 h-5 text-[#122C57]" />
                <p className="font-sans font-medium text-sm text-[#122C57]">Direct Ownership</p>
                <p className="text-xs text-[#6B7280]">Zero vendor lock-in or opaque retainers</p>
              </Card>
            </HeavyDraggable>
          </div>
        </div>
      </SectionWrapper>

      {/* Mansa Roots & Local Commitment */}
      <SectionWrapper variant="white" id="roots">
        <div className="max-w-3xl space-y-6">
          <ScrollReveal>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Our Base
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
              Rooted in Mansa, Serving Punjab &amp; Global Clients
            </h2>
          </ScrollReveal>
          <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
            Headquartered in Mansa, Punjab (151505), we combine direct local accessibility across Punjab&apos;s commercial cities - Bathinda, Barnala, Ludhiana, Jalandhar, Amritsar, and Chandigarh - with the technical capability to deliver world-class systems worldwide.
          </p>
          <div className="pt-4">
            <Button href="/contact" size="md" variant="primary">
              Book a Free 20-Minute AI Audit
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

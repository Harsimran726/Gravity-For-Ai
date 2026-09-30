import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrbitAura } from '@/components/ui/orbit-aura';
import { ZeroGravity, HeavyDraggable, ScrollReveal } from '@/components/ui/physics-effects';
import { MapPin, Code, Cpu, Shield } from 'lucide-react';
import Image from 'next/image';
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

          {/* Founder Profile Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E4E2DC] bg-[#FFFFFF] shadow-sm">
            {/* Gold header bar (mirrors Gravatar card style) */}
            <div className="h-20 bg-gradient-to-r from-[#122C57] to-[#1E3F7A] relative">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C99A44 0%, transparent 60%)' }}
              />
            </div>

            <div className="px-6 pb-6 -mt-10 relative">
              {/* Avatar */}
              <div className="flex items-end gap-4 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#FFFFFF] shadow-md overflow-hidden bg-[#F7F5F0]">
                    <Image
                      src="https://1.gravatar.com/avatar/85b5ed2edbd43fe08a87b9a1f045331e52a152a4349f94aa1235fba0849ba60f?s=256&d=initials"
                      alt="Harsimran Singh"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="pb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-[10px] font-mono text-[#122C57] font-semibold uppercase tracking-wider rounded-full">
                    <MapPin className="w-2.5 h-2.5 text-[#C99A44]" /> India
                  </span>
                </div>
              </div>

              {/* Name & Role */}
              <div className="space-y-0.5 mb-3">
                <h3 className="font-serif text-2xl text-[#122C57] font-normal">Harsimran Singh</h3>
                <p className="font-mono text-xs text-[#C99A44] font-semibold uppercase tracking-wider">
                  Founder, Gravity For AI
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-[#0A1B3D]/80 leading-relaxed mb-5">
                We help to Scale the Business using AI Workflows — building autonomous voice agents, agentic pipelines, and high-performance web systems that turn operational bottlenecks into competitive advantages.
              </p>

              {/* Divider */}
              <div className="border-t border-[#E4E2DC] my-4" />

              {/* Social links + Profile links row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Social icons */}
                <div className="flex items-center gap-3">
                  <Link
                    href="https://gravatar.com/cheerful95763d36c0?utm_source=profile-card"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Gravatar Profile"
                    className="w-9 h-9 rounded-full bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center hover:border-[#122C57] hover:bg-[#122C57] transition-all group"
                  >
                    <Image
                      src="https://s.gravatar.com/icons/gravatar.svg"
                      alt="Gravatar"
                      width={18}
                      height={18}
                      className="w-4 h-4 group-hover:brightness-0 group-hover:invert transition-all"
                      unoptimized
                    />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/harsimransinghaiengineer"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="w-9 h-9 rounded-full bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center hover:border-[#0A66C2] hover:bg-[#0A66C2] transition-all group"
                  >
                    <Image
                      src="https://s.gravatar.com/icons/linkedin.svg"
                      alt="LinkedIn"
                      width={18}
                      height={18}
                      className="w-4 h-4 group-hover:brightness-0 group-hover:invert transition-all"
                      unoptimized
                    />
                  </Link>
                </div>

                {/* Gravatar profile link */}
                <Link
                  href="https://gravatar.com/cheerful95763d36c0?utm_source=profile-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B7280] hover:text-[#122C57] transition-colors underline underline-offset-4"
                >
                  gravatar.com/cheerful95763d36c0
                  <span className="text-[#C99A44]">→</span>
                </Link>
              </div>
            </div>
          </div>

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

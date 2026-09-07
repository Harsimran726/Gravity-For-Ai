import * as React from 'react';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { HeavyDraggable, ScrollReveal, ParallaxLayer } from '@/components/ui/physics-effects';
import { Mic, Globe, Cpu, ArrowUpRight } from 'lucide-react';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

const SERVICE_PILLARS = [
  {
    icon: Mic,
    title: 'AI Voice Agents',
    href: '/services/ai-voice-agents',
    benefit: 'Never miss another call - your 24/7 receptionist answers instantly, qualifies leads, and books slots in Punjabi, Hindi & English.',
    badge: 'Voice & Calls',
  },
  {
    icon: Globe,
    title: 'Website Development',
    href: '/services/website-development',
    benefit: 'Fast, conversion-focused websites engineered to turn local searchers into discovery calls - custom-built, never a generic template.',
    badge: 'Web & Conversion',
  },
  {
    icon: Cpu,
    title: 'Agentic AI Systems',
    href: '/services/agentic-ai-systems',
    benefit: 'Coordinated AI agents that handle multi-step back-office workflows end-to-end - from reading inquiries to scheduling and logging records.',
    badge: 'Workflow Automation',
  },
];

export function ValuePropSection() {
  return (
    <SectionWrapper variant="white" id="services">
      <ScrollReveal className="max-w-3xl space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          The Solution
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
          We Build the Systems. You Run the Business.
        </h2>

        {/* Standalone Quotable GEO Direct-Answer Paragraph */}
        <ParallaxLayer speed={0.15}>
          <blockquote className="font-sans text-base sm:text-lg text-[#0A1B3D]/90 border-l-2 border-[#C99A44] pl-5 py-1 leading-relaxed bg-[#F7F5F0]/50">
            Gravity For AI designs, builds, and manages AI voice agents, agentic automation, and websites for local businesses - done for you, not handed to you as a DIY platform. We understand the pressure of running a business without a technical team, and we build systems that quietly work in the background so you don&apos;t have to think about them.
          </blockquote>
        </ParallaxLayer>
      </ScrollReveal>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
        {SERVICE_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <HeavyDraggable key={pillar.title}>
              <Card
                variant="outline"
                className="flex flex-col justify-between group hover:border-[#122C57] transition-all duration-300 h-full overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Visual Product Banner */}
                  <CardVisualHeader
                    type={pillar.title.includes('Voice') ? 'voice' : pillar.title.includes('Website') ? 'web' : 'agentic'}
                    title={pillar.title}
                    metric={pillar.badge}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="w-9 h-9 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#122C57] group-hover:bg-[#122C57] group-hover:text-[#FFFFFF] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7280]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-[#122C57] group-hover:text-[#0A1B3D] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {pillar.benefit}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E4E2DC]">
                  <Link
                    href={pillar.href}
                    draggable={false}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#122C57] hover:text-[#C99A44] font-medium transition-colors"
                  >
                    Explore Service <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            </HeavyDraggable>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

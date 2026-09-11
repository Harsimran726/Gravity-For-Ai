import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeavyDraggable } from '@/components/ui/physics-effects';
import { Check, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Transparent Pricing & Packages | Gravity For AI',
  description:
    'Explore our clear, transparent pricing packages for AI Voice Agents, conversion websites, and custom agentic workflows. Built for local businesses in Punjab and beyond.',
  alternates: {
    canonical: 'https://gravityforai.com/pricing',
  },
  openGraph: {
    url: 'https://gravityforai.com/pricing',
    title: 'Transparent Pricing & Packages | Gravity For AI',
    description:
      'Explore our clear, transparent pricing packages for AI Voice Agents, conversion websites, and custom agentic workflows. Built for local businesses in Punjab and beyond.',
  },
};

const ALL_TIERS = [
  {
    name: 'AI Voice Receptionist',
    badge: 'Standalone Service',
    description: 'Best for local clinics, salons, law offices, and services needing 24/7 call triage.',
    price: 'Transparent Volume Pricing',
    timeline: 'Live in 5-7 business days',
    features: [
      'Dedicated AI phone number with zero hold queues',
      'Multilingual conversation in Punjabi, Hindi & English',
      'Real-time Google Calendar & CRM booking sync',
      'Instant call transcripts & emergency alerts',
      'Continuous monthly voice model tuning',
    ],
  },
  {
    name: 'Conversion Website',
    badge: 'Digital Foundation',
    popular: true,
    description: 'Best for businesses upgrading from slow WordPress templates to high-speed Next.js.',
    price: 'Custom Project Fee',
    timeline: 'Live in 2-3 weeks',
    features: [
      'Custom 7-step StoryBrand persuasion architecture',
      'Sub-2s mobile loading speed (100% Core Web Vitals)',
      'LocalBusiness & FAQ JSON-LD schemas for Mansa/Punjab',
      'Direct contact & audit booking form integration',
      '100% code and domain ownership upon delivery',
    ],
  },
  {
    name: 'Unified Suite (Voice + Web)',
    badge: 'Best Value',
    description: 'Best for businesses ready for a complete digital overhaul with integrated call intake.',
    price: 'Integrated Package',
    timeline: 'Live in 3 weeks',
    features: [
      'High-performance website + AI Voice Agent connected',
      'Unified lead dashboard & WhatsApp notifications',
      'Automated appointment confirmation pipeline',
      'Advanced GEO & AEO search engine optimization',
      'Priority ongoing support and quarterly updates',
    ],
  },
  {
    name: 'Agentic Back-Office AI',
    badge: 'Bespoke Automation',
    description: 'Best for multi-step operational workflows, inventory sync, and document extraction.',
    price: 'Scoped Custom Quote',
    timeline: 'Custom Milestone Sprints',
    features: [
      'Coordinated multi-agent autonomous pipelines',
      'Custom database, WhatsApp API & ERP integration',
      'Human-in-the-loop validation checkpoints',
      'Enterprise security & isolated tenant environments',
      'Dedicated engineering partner SLA',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="w-full flex flex-col">
      <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-16">
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Transparent Investment
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57] font-normal leading-[1.06]">
            Simple, Honest Pricing. <br />
            No Locked-In Contracts.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed pt-2">
            Every build is scoped clearly for real business return on investment. Choose a standalone system or combine them for a unified digital operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          {ALL_TIERS.map((tier) => (
            <HeavyDraggable key={tier.name}>
              <Card
                variant="outline"
                className={`flex flex-col justify-between h-full relative ${tier.popular ? 'border-[#122C57] shadow-sm' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#122C57] text-[#FFFFFF] font-mono text-[10px] uppercase tracking-wider">
                    {tier.badge}
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-xs text-[#C99A44] uppercase tracking-wider">
                      {!tier.popular && tier.badge}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57] mt-1">{tier.name}</h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="py-3 border-t border-b border-[#E4E2DC] flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-[#122C57]">{tier.price}</span>
                    <span className="font-sans text-xs text-[#6B7280]">{tier.timeline}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#0A1B3D]/90">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 mt-6">
                  <Button
                    href="/contact"
                    variant={tier.popular ? 'primary' : 'ghost'}
                    size="md"
                    className="w-full justify-center text-xs"
                  >
                    Book an AI Audit for Exact Quote
                  </Button>
                </div>
              </Card>
            </HeavyDraggable>
          ))}
        </div>
      </SectionWrapper>

      {/* Pricing FAQs */}
      <SectionWrapper variant="warm">
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Pricing Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
            How Our Pricing Works
          </h2>
        </div>

        <div className="max-w-3xl mt-8 space-y-4 text-xs sm:text-sm text-[#6B7280]">
          <HeavyDraggable>
            <Card variant="outline" className="space-y-2 bg-[#FFFFFF]">
              <h3 className="font-sans font-medium text-base text-[#122C57]">
                Are there any hidden monthly hosting or maintenance fees?
              </h3>
              <p className="leading-relaxed">
                None. We quote all project costs and monthly telephony/agent maintenance limits upfront before starting any work.
              </p>
            </Card>
          </HeavyDraggable>

          <HeavyDraggable>
            <Card variant="outline" className="space-y-2 bg-[#FFFFFF]">
              <h3 className="font-sans font-medium text-base text-[#122C57]">
                Can I start with an AI Voice Agent and add a website later?
              </h3>
              <p className="leading-relaxed">
                Yes. All our systems are built modularly so you can deploy an AI voice receptionist today and connect it to a full website or back-office pipeline whenever you are ready.
              </p>
            </Card>
          </HeavyDraggable>
        </div>
      </SectionWrapper>
    </div>
  );
}

import * as React from 'react';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeavyDraggable } from '@/components/ui/physics-effects';
import { Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    badge: 'Single System',
    description: 'Best for a standalone AI voice receptionist or a modern high-conversion website.',
    price: 'Transparent Entry Tier',
    features: [
      'Custom AI Voice Agent OR Conversion Website',
      'Multilingual support (Punjabi, Hindi, English)',
      'Calendar & booking integration',
      'Mobile-first responsive architecture',
      'Ongoing maintenance & tuning',
    ],
  },
  {
    name: 'Growth',
    badge: 'Most Popular',
    popular: true,
    description: 'Best for businesses wanting a unified digital front: voice answering + website connected.',
    price: 'Integrated Suite',
    features: [
      'AI Voice Agent + High-Performance Website',
      'Unified lead capture & auto-notifications',
      'Custom CRM / WhatsApp webhook sync',
      'Core Web Vitals & SEO optimization',
      'Priority support & continuous improvements',
    ],
  },
  {
    name: 'Custom / Agentic',
    badge: 'Bespoke Workflows',
    description: 'Best for complex back-office automation, multi-step operations, and custom tools.',
    price: 'Custom Scoped Quote',
    features: [
      'Multi-step autonomous agent pipelines',
      'Custom database & internal tool integration',
      'Document parsing & automated record sync',
      'Enterprise security & data isolation',
      'Dedicated monitoring & SLA guarantees',
    ],
  },
];

export function PricingSection() {
  return (
    <SectionWrapper variant="white" id="pricing">
      <div className="max-w-3xl space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          Investment
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
          Simple, Transparent Options
        </h2>
        <p className="text-sm sm:text-base text-[#0A1B3D]/80">
          No hidden fees or locked-in contracts. Every build is scoped honestly for clear business ROI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
        {TIERS.map((tier) => (
          <HeavyDraggable key={tier.name}>
            <Card
              variant="outline"
              className={`flex flex-col justify-between h-full relative ${
                tier.popular ? 'border-[#122C57] shadow-sm' : ''
              }`}
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
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#122C57] mt-1">{tier.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="py-3 border-t border-b border-[#E4E2DC]">
                  <p className="font-mono text-sm font-semibold text-[#122C57]">{tier.price}</p>
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
                  Book an AI Audit
                </Button>
              </div>
            </Card>
          </HeavyDraggable>
        ))}
      </div>
    </SectionWrapper>
  );
}

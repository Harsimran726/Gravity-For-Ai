import * as React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero';
import { StakesSection } from '@/components/home/stakes';
import { ValuePropSection } from '@/components/home/value-prop';
import { PhilosophySection } from '@/components/home/philosophy';
import { GuideSection } from '@/components/home/guide';
import { PlanSection } from '@/components/home/plan';
import { ExplainerSection } from '@/components/home/explainer';
import { PricingSection } from '@/components/home/pricing';
import { FaqSection } from '@/components/home/faq';
import { ClosingCtaSection } from '@/components/home/closing-cta';
import { FAQ_ITEMS } from '@/data/faq-data';

export const metadata: Metadata = {
  title: 'Gravity For AI - AI Voice Agents, Websites & Agentic Systems | Mansa, Punjab',
  description:
    'Gravity For AI builds AI voice agents, agentic AI systems, and premium websites for local businesses in Punjab, India & beyond. Book a free AI audit.',
  alternates: {
    canonical: 'https://gravityforai.com',
  },
  openGraph: {
    url: 'https://gravityforai.com',
    title: 'Gravity For AI - AI Voice Agents, Websites & Agentic Systems | Mansa, Punjab',
    description:
      'Gravity For AI builds AI voice agents, agentic AI systems, and premium websites for local businesses in Punjab, India & beyond. Book a free AI audit.',
  },
};

export default function HomePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'AI Voice Agents & Business Automation',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Gravity For AI',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mansa',
        addressRegion: 'Punjab',
        addressCountry: 'IN',
      },
    },
    areaServed: ['Mansa', 'Bathinda', 'Barnala', 'Ludhiana', 'Jalandhar', 'Amritsar', 'Chandigarh'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Gravity For AI Offerings',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Voice Agents for Local Business',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Conversion Website Development',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Agentic AI Systems',
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />

      <div className="w-full flex flex-col">
        {/* 1. Hero: Headline + Subhead + Primary CTA + Orbit Motif */}
        <HeroSection />

        {/* 2. Stakes: Problem Icons + Pain Points */}
        <StakesSection />

        {/* 3. Value Proposition: Solution + 3 Pillars + GEO Answer */}
        <ValuePropSection />

        {/* 4. The Philosophy: Brand Manifesto (Dark Room 1) */}
        <PhilosophySection />

        {/* 5. Guide: Stats + Testimonials + Authority Proof */}
        <GuideSection />

        {/* 6. Plan: 3-Step Process */}
        <PlanSection />

        {/* 7. Explanatory Section: How Automation Actually Works */}
        <ExplainerSection />

        {/* 8. Pricing / Packages: Transparent Tiers */}
        <PricingSection />

        {/* 9. FAQ Section: 5 AEO Questions */}
        <FaqSection />

        {/* 10. Closing CTA: Enter the Orbit (Dark Room 2) */}
        <ClosingCtaSection />
      </div>
    </>
  );
}

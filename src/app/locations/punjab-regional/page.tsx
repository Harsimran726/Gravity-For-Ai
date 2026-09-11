import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Mic, Globe, Cpu, MapPin } from 'lucide-react';
import { LocationOperationsCard } from '@/components/visuals/location-operations-card';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export const metadata: Metadata = {
  title: 'AI Voice Agents & Automation Across Punjab - Regional Coverage',
  description:
    'Gravity For AI serves businesses across Punjab - including Barnala, Amritsar, Jalandhar, and Patiala - with AI voice agents, custom websites, and agentic automation. Remotely managed from our Mansa HQ.',
  alternates: {
    canonical: 'https://gravityforai.com/locations/punjab-regional',
  },
  openGraph: {
    url: 'https://gravityforai.com/locations/punjab-regional',
    title: 'AI Voice Agents & Automation Across Punjab - Regional Coverage',
    description:
      'AI voice agents and business automation for Barnala, Amritsar, Jalandhar, Patiala, and surrounding Punjab districts. Engineered and managed from Mansa, Punjab.',
  },
};

const cities = [
  {
    name: 'Barnala',
    desc: 'Retail, FMCG distribution, and agro-trade businesses. AI voice agents handle after-hours inquiries and appointment booking.',
  },
  {
    name: 'Amritsar',
    desc: 'Hospitality, medical centers, and trade enterprises. Trilingual AI (Punjabi, Hindi, English) for diverse clientele.',
  },
  {
    name: 'Jalandhar',
    desc: 'Manufacturing, sports-goods exporters, and clinics. AI manages international time-zone inquiries 24/7.',
  },
  {
    name: 'Patiala',
    desc: 'Educational institutes, legal offices, and healthcare practices. Handles peak admission and enrollment call surges automatically.',
  },
];

export default function PunjabRegionalPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Voice Agents & Business Automation - Punjab Regional',
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
    areaServed: cities.map((c) => ({ '@type': 'City', name: c.name })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="w-full flex flex-col">
        {/* Hero */}
        <section className="relative min-h-[75vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
                <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
                <span>Punjab - Regional Coverage</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.06] text-[#122C57] font-normal tracking-tight">
                AI Automation for Businesses Across Punjab
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-xl leading-relaxed">
                Gravity For AI is based in Mansa, Punjab. We build and manage AI voice agents, agentic workflows, and custom websites for businesses throughout Punjab - including Barnala, Amritsar, Jalandhar, and Patiala - remotely from our Punjab engineering base.
              </p>

              <div className="inline-flex items-center gap-2 text-sm text-[#6B7280] font-mono">
                <MapPin className="w-4 h-4 text-[#C99A44]" />
                <span>Engineered from Mansa HQ - serving all of Punjab</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button href="/contact" size="lg" variant="primary">
                  Book a Free AI Audit
                </Button>
                <Button href="/locations/mansa" size="lg" variant="ghost">
                  Visit Our HQ Page &rarr;
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <LocationOperationsCard cityName="Punjab" region="Regional Hubs" />
            </div>
          </div>
        </section>

        {/* Areas We Serve */}
        <SectionWrapper variant="warm" id="cities" animate={false}>
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Areas We Serve
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              Punjab Commercial Centers We Work With
            </h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">
              Our systems are built remotely and deployed digitally - no in-person office setup needed. We operate as a full engineering partner managing your AI systems end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {cities.map((city) => (
              <Card key={city.name} variant="outline" className="space-y-3">
                <h3 className="font-sans font-semibold text-lg text-[#122C57]">{city.name}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{city.desc}</p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* Capabilities */}
        <SectionWrapper variant="white" id="services" animate={false}>
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              What We Build for Punjab Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="voice" title="AI Voice Agents" />
              <div className="space-y-3">
                <Mic className="w-6 h-6 text-[#122C57]" />
                <h3 className="font-serif text-2xl text-[#122C57]">AI Voice Agents</h3>
                <p className="text-sm text-[#6B7280]">
                  24/7 call answering in Punjabi, Hindi &amp; English. Books appointments, answers FAQs, and captures leads automatically.
                </p>
              </div>
              <Link
                href="/services/ai-voice-agents"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium"
              >
                View Voice Agents <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="web" title="Website Development" />
              <div className="space-y-3">
                <Globe className="w-6 h-6 text-[#122C57]" />
                <h3 className="font-serif text-2xl text-[#122C57]">Website Development</h3>
                <p className="text-sm text-[#6B7280]">
                  Sub-2s Next.js websites built for local search rankings and discovery call conversion.
                </p>
              </div>
              <Link
                href="/services/website-development"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium"
              >
                View Web Dev <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="agentic" title="Agentic AI Systems" />
              <div className="space-y-3">
                <Cpu className="w-6 h-6 text-[#122C57]" />
                <h3 className="font-serif text-2xl text-[#122C57]">Agentic AI Systems</h3>
                <p className="text-sm text-[#6B7280]">
                  Autonomous pipelines that eliminate manual data entry, scheduling friction, and cross-system copy-pasting.
                </p>
              </div>
              <Link
                href="/services/agentic-ai-systems"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium"
              >
                View Agentic AI <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </SectionWrapper>

        {/* Testimonial */}
        <SectionWrapper variant="warm" id="testimonial" animate={false}>
          <div className="max-w-2xl">
            <Card variant="warm" className="space-y-4">
              <div className="flex items-center gap-1 text-[#C99A44]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C99A44]" />
                ))}
              </div>
              <p className="font-serif text-base sm:text-lg text-[#0A1B3D] italic leading-relaxed">
                &ldquo;Having our AI engineering partner based right here in Punjab made all the difference. Our voice agent answers calls fluently in Punjabi and English.&rdquo;
              </p>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#122C57]">
                Dr. Raman K. &middot; <span className="text-[#6B7280]">Clinic Founder, Punjab</span>
              </p>
            </Card>
          </div>
        </SectionWrapper>

        {/* Closing CTA */}
        <SectionWrapper variant="black" id="contact" animate={false} className="py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">
              Ready to Automate Your Punjab Business?
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
              Book a free 20-minute audit call. We will show you exactly how our systems work - and what they can do for your specific business.
            </p>
            <div className="pt-6 flex justify-center">
              <Button href="/contact" size="lg" variant="dark-cta">
                Book an AI Audit
              </Button>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}

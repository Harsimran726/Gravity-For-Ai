import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CITIES_DATA } from '@/data/city-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrbitAura } from '@/components/ui/orbit-aura';
import { Star, ArrowRight, Mic, Globe, Cpu } from 'lucide-react';
import { LocationOperationsCard } from '@/components/visuals/location-operations-card';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export function generateStaticParams() {
  return Object.keys(CITIES_DATA).map((city) => ({
    city,
  }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = CITIES_DATA[params.city];
  if (!city) return { title: 'Location Not Found | Gravity For AI' };

  return {
    title: city.title,
    description: city.metaDescription,
    alternates: {
      canonical: `https://gravityforai.com/locations/${city.citySlug}`,
    },
  };
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES_DATA[params.city];
  if (!city) {
    notFound();
  }

  const localSchema = city.isHQ
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Gravity For AI',
        description: city.metaDescription,
        url: `https://gravityforai.com/locations/${city.citySlug}`,
        email: 'contact@gravityforai.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.cityName,
          addressRegion: city.region,
          postalCode: '151505',
          addressCountry: 'IN',
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `AI Voice Agents & Websites in ${city.cityName}`,
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
        areaServed: {
          '@type': 'City',
          name: city.cityName,
        },
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />

      <div className="w-full flex flex-col">
        {/* Hero */}
        <section className="relative min-h-[75vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
                <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
                <span>{city.cityName}, {city.region}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.06] text-[#122C57] font-normal tracking-tight">
                {city.heroHeadline}
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-xl leading-relaxed">
                {city.heroSubheadline}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button href="/contact" size="lg" variant="primary">
                  Book a Local AI Audit
                </Button>
                <Button href="/services" size="lg" variant="ghost">
                  Explore All Services →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <LocationOperationsCard cityName={city.cityName} region={city.region} />
            </div>
          </div>
        </section>

        {/* Stakes */}
        <SectionWrapper variant="warm" id="stakes">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Local Operational Friction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              Why Businesses in {city.cityName} Need Dedicated Automation
            </h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">
              {city.localDifferentiator}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {city.stakes.map((item) => (
              <Card key={item.tag} variant="outline" className="space-y-4">
                <span className="font-mono text-xs text-[#C99A44]">{item.tag}</span>
                <h3 className="font-sans font-medium text-lg text-[#122C57]">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* Value Proposition */}
        <SectionWrapper variant="white" id="solution">
          <div className="max-w-3xl space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              The Advantage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              We Build & Manage Systems for {city.cityName}
            </h2>
            <blockquote className="font-sans text-base sm:text-lg text-[#0A1B3D]/90 border-l-2 border-[#C99A44] pl-5 py-2 leading-relaxed bg-[#F7F5F0]/50">
              {city.valuePropParagraph}
            </blockquote>
          </div>

          {/* Local Testimonial */}
          <div className="mt-14 max-w-2xl">
            <Card variant="warm" className="space-y-4">
              <div className="flex items-center gap-1 text-[#C99A44]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C99A44]" />
                ))}
              </div>
              <p className="font-serif text-base sm:text-lg text-[#0A1B3D] italic leading-relaxed">
                &ldquo;{city.testimonial.quote}&rdquo;
              </p>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#122C57]">
                {city.testimonial.name} · <span className="text-[#6B7280]">{city.testimonial.role}</span>
              </p>
            </Card>
          </div>
        </SectionWrapper>

        {/* Core Services Available in this City */}
        <SectionWrapper variant="warm" id="services">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              Core Services Available in {city.cityName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="voice" title="AI Voice Agents" />
              <div className="space-y-3">
                <Mic className="w-6 h-6 text-[#122C57]" />
                <h3 className="font-serif text-2xl text-[#122C57]">AI Voice Agents</h3>
                <p className="text-sm text-[#6B7280]">
                  24/7 trilingual call answering, qualification, and appointment booking in Punjabi, Hindi & English.
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
                  Sub-2s mobile-first websites engineered for high local Google search rankings and discovery call conversion.
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
                  Autonomous back-office pipelines that eliminate copy-pasting, manual scheduling, and dispatch friction.
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

        {/* Closing CTA */}
        <SectionWrapper variant="black" id="contact" className="py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">
              Ready to Upgrade Your {city.cityName} Business?
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
              Book a free 20-minute audit call with our team. We will show you exactly how our systems work.
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

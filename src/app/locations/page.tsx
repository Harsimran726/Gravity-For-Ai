import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CITIES_DATA } from '@/data/city-data';
import { MapPin, ArrowRight, Star, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Locations & Regional AI Deployment Hubs | Gravity For AI',
  description:
    'Browse Gravity For AI service locations across Punjab, India & global markets. Mansa HQ, Bathinda, Ludhiana, Chandigarh, and beyond. Custom local AI automation.',
  alternates: {
    canonical: 'https://gravityforai.com/locations',
  },
  openGraph: {
    url: 'https://gravityforai.com/locations',
    title: 'Locations & Regional AI Deployment Hubs | Gravity For AI',
    description:
      'Browse Gravity For AI service locations across Punjab, India & global markets. Mansa HQ, Bathinda, Ludhiana, Chandigarh, and beyond. Custom local AI automation.',
  },
};

export default function LocationsDirectoryPage() {
  const mansaHQ = CITIES_DATA['mansa'];
  const bathinda = CITIES_DATA['bathinda'];
  const ludhiana = CITIES_DATA['ludhiana'];
  const chandigarh = CITIES_DATA['chandigarh'];
  const delhi = CITIES_DATA['delhi'];

  const punjabHubs = [
    bathinda,
    ludhiana,
    chandigarh,
  ].filter(Boolean);

  return (
    <div className="w-full flex flex-col pt-12 sm:pt-20">
      {/* Header */}
      <section className="bg-[#FFFFFF] py-16 sm:py-24 border-b border-[#E4E2DC]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono uppercase tracking-widest text-[#122C57]">
            <MapPin className="w-3.5 h-3.5 text-[#C99A44]" />
            <span>Regional Engineering Hubs</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#122C57] max-w-3xl mx-auto leading-[1.1]">
            Local AI Automation &amp; Website Development
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-2xl mx-auto leading-relaxed">
            Headquartered in Mansa, Punjab, Gravity For AI builds custom voice agents and conversion platforms for regional businesses and growing enterprises worldwide.
          </p>
        </div>
      </section>

      {/* Featured Mansa HQ Card */}
      {mansaHQ && (
        <section className="bg-[#F7F5F0] py-12 border-b border-[#E4E2DC]">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
            <Card
              variant="outline"
              className="bg-[#FFFFFF] border-2 border-[#C99A44] p-8 sm:p-10 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C99A44] font-semibold">
                  <Star className="w-4 h-4 fill-[#C99A44]" />
                  <span>Primary Engineering Headquarters</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57]">
                  Mansa, Punjab (HQ)
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {mansaHQ.heroSubheadline} Built and managed with direct engineering access right here in Mansa — no outsourced middlemen.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full lg:w-auto">
                <Button href="/locations/mansa" size="lg" variant="primary" className="text-xs uppercase tracking-wider">
                  View Mansa Hub Page <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
                <Button href="/contact" size="lg" variant="ghost" className="text-xs uppercase tracking-wider">
                  Book Local Audit
                </Button>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Regional Punjab Grid */}
      <SectionWrapper variant="white">
        <div className="max-w-3xl space-y-2 mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Punjab &amp; Tricity Coverage
          </span>
          <h2 className="font-serif text-3xl text-[#122C57]">Punjab Operational Hubs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {punjabHubs.map((city) => (
            <Card
              key={city.citySlug}
              variant="outline"
              className="bg-[#FFFFFF] p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#122C57]">{city.cityName}</h3>
                  <span className="text-[11px] font-mono text-[#C99A44] uppercase">{city.region}</span>
                </div>
                <p className="text-xs text-[#6B7280] line-clamp-2">
                  {city.heroSubheadline}
                </p>
              </div>

              <Link
                href={`/locations/${city.citySlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
              >
                Explore {city.cityName} Solutions <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>
          ))}

          {/* Consolidated Punjab Regional Hub */}
          <Card
            variant="outline"
            className="bg-[#FFFFFF] border border-[#C99A44]/40 p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#122C57]">Punjab — Regional</h3>
                <span className="text-[11px] font-mono text-[#C99A44] uppercase">Barnala · Amritsar · Jalandhar · Patiala</span>
              </div>
              <p className="text-xs text-[#6B7280] line-clamp-2">
                Serving businesses throughout Punjab with dedicated AI voice receptionists, custom websites, and workflow automation from Mansa HQ.
              </p>
            </div>

            <Link
              href="/locations/punjab-regional"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
            >
              Explore Punjab Regional Coverage <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        </div>
      </SectionWrapper>

      {/* National & Global Remote Hubs */}
      <SectionWrapper variant="warm">
        <div className="max-w-3xl space-y-2 mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            National &amp; International Delivery
          </span>
          <h2 className="font-serif text-3xl text-[#122C57]">National &amp; Global AI Deployments</h2>
          <p className="text-sm text-[#0A1B3D]/80">
            Engineered from India, delivered anywhere. Our AI voice agents and agentic systems operate smoothly across multiple time zones and languages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Delhi NCR Hub */}
          {delhi && (
            <Card
              variant="outline"
              className="bg-[#FFFFFF] p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#122C57]">Delhi NCR</h3>
                  <span className="text-[11px] font-mono text-[#6B7280] uppercase">Delhi · Gurugram · Noida</span>
                </div>
                <p className="text-xs text-[#6B7280] line-clamp-2">
                  Enterprise-grade AI voice receptionists and autonomous agentic workflows for Delhi NCR companies.
                </p>
              </div>

              <Link
                href="/locations/delhi"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
              >
                Explore Delhi NCR <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>
          )}

          {/* India Remote */}
          <Card
            variant="outline"
            className="bg-[#FFFFFF] p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#122C57]">India Remote</h3>
                <span className="text-[11px] font-mono text-[#6B7280] uppercase">Pan-India</span>
              </div>
              <p className="text-xs text-[#6B7280] line-clamp-2">
                Remote delivery for Gandhinagar, Surat, Jaipur, Kolkata, and growing commercial centers across India.
              </p>
            </div>

            <Link
              href="/locations/india-remote"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
            >
              Explore India Remote <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>

          {/* United States */}
          <Card
            variant="outline"
            className="bg-[#FFFFFF] p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#122C57]">United States</h3>
                <span className="text-[11px] font-mono text-[#6B7280] uppercase">Austin · Raleigh · Tampa · SLC</span>
              </div>
              <p className="text-xs text-[#6B7280] line-clamp-2">
                Done-for-you AI voice agents and agentic systems operating on US time zones with native American English.
              </p>
            </div>

            <Link
              href="/locations/united-states"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
            >
              Explore United States <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>

          {/* Europe */}
          <Card
            variant="outline"
            className="bg-[#FFFFFF] p-6 space-y-4 hover:border-[#122C57] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#122C57]">Europe</h3>
                <span className="text-[11px] font-mono text-[#6B7280] uppercase">Germany &amp; DACH</span>
              </div>
              <p className="text-xs text-[#6B7280] line-clamp-2">
                Remote AI phone answering and agentic automation for European Mittelstand and service enterprises.
              </p>
            </div>

            <Link
              href="/locations/europe"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44] pt-2 border-t border-[#E4E2DC]"
            >
              Explore Europe <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        </div>
      </SectionWrapper>
    </div>
  );
}

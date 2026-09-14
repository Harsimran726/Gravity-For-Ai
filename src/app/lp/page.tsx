import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NICHE_LANDING_PAGES } from '@/data/landing-pages-data';
import { ArrowRight, PhoneCall, Sparkles, Building2, Stethoscope, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Industry AI Voice Agent Solutions & Blueprints',
  description:
    'Dedicated AI Call Agent solutions engineered for Real Estate Agencies, Healthcare Clinics, and Immigration Consultancies.',
  alternates: {
    canonical: 'https://gravityforai.com/lp',
  },
  openGraph: {
    url: 'https://gravityforai.com/lp',
    title: 'Industry AI Voice Agent Solutions & Blueprints | Gravity For AI',
    description:
      'Dedicated AI Call Agent solutions engineered for Real Estate Agencies, Healthcare Clinics, and Immigration Consultancies.',
  },
};

const NICHE_ICONS: Record<string, React.ElementType> = {
  'real-estate': Building2,
  'clinics': Stethoscope,
  'immigration': Compass,
};

export default function LandingPagesDirectory() {
  const niches = Object.values(NICHE_LANDING_PAGES);

  return (
    <div className="w-full flex flex-col pt-12 sm:pt-20">
      <section className="bg-[#FFFFFF] py-16 sm:py-24 border-b border-[#E4E2DC]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono uppercase tracking-widest text-[#122C57]">
            <PhoneCall className="w-3.5 h-3.5 text-[#C99A44]" />
            <span>Dedicated Industry Blueprints</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#122C57] max-w-3xl mx-auto leading-[1.1]">
            AI Call Agents Engineered for Your Specific Industry
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-2xl mx-auto leading-relaxed">
            Generic chatbots fail high-intent buyers and patients. Explore our tailored AI Voice Agent architectures designed for high call volume sectors.
          </p>
        </div>
      </section>

      <SectionWrapper variant="warm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {niches.map((niche) => {
            const Icon = NICHE_ICONS[niche.slug] || PhoneCall;
            return (
              <Card
                key={niche.slug}
                variant="outline"
                className="bg-[#FFFFFF] p-8 space-y-6 hover:border-[#122C57] transition-all flex flex-col justify-between shadow-md"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center text-[#C99A44]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#C99A44] font-semibold">
                      {niche.badge}
                    </span>
                    <h2 className="font-serif text-2xl text-[#122C57]">{niche.nicheTitle}</h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {niche.heroHeadline}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4E2DC]">
                  <Link
                    href={`/lp/${niche.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#122C57] font-semibold hover:text-[#C99A44]"
                  >
                    View ${niche.badge} Blueprint <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>
    </div>
  );
}

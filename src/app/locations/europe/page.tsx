import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Mic, Globe, Cpu, Wifi } from 'lucide-react';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export const metadata: Metadata = {
  title: 'AI Voice Agents & Automation — Europe Remote Delivery',
  description:
    'Gravity For AI remotely builds and manages AI voice agents, agentic AI systems, and custom websites for businesses in Germany and across Europe — Stuttgart, Leipzig, Nuremberg, Dresden, and Hannover.',
  alternates: { canonical: 'https://gravityforai.com/locations/europe' },
  openGraph: {
    url: 'https://gravityforai.com/locations/europe',
    title: 'AI Voice Agents & Automation — Europe Remote Delivery',
    description: 'Done-for-you AI phone agents and web platforms for European businesses — Germany and beyond, delivered remotely.',
  },
};

const cities = [
  { name: 'Stuttgart', desc: 'Baden-Württemberg Mittelstand, engineering firms, and clinics. AI handles after-hours calls in German and English.' },
  { name: 'Leipzig', desc: 'Logistics, e-commerce, and service businesses. Eliminates routine call volume from core operations.' },
  { name: 'Nürnberg', desc: 'B2B industrial firms, law practices, and medical clinics. GDPR-compliant AI intake pipelines.' },
  { name: 'Dresden (Silicon Saxony)', desc: 'High-tech and research businesses. AI pre-qualifies project inquiries before routing to engineers.' },
  { name: 'Hannover', desc: 'Trade fair service providers and Mittelstand businesses. Scales call handling during Messe seasons.' },
];

export default function EuropePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Voice Agents & Business Automation — Europe',
    provider: { '@type': 'LocalBusiness', name: 'Gravity For AI', address: { '@type': 'PostalAddress', addressLocality: 'Mansa', addressRegion: 'Punjab', addressCountry: 'IN' } },
    areaServed: [{ '@type': 'Continent', name: 'Europe' }],
    description: 'Done-for-you AI voice agents and agentic automation delivered remotely to European businesses from our engineering base in India.',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="w-full flex flex-col">
        <section className="relative min-h-[65vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
              <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
              <span>Europe — Remote Delivery</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.06] text-[#122C57] font-normal tracking-tight max-w-4xl">
              Done-For-You AI Systems for European Businesses
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-2xl leading-relaxed">
              We build and manage AI voice agents and agentic automation for businesses in Germany and across Europe — entirely remotely. Our systems speak German and English, handle GDPR-relevant data workflows, and operate on European time zones.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-[#6B7280] font-mono">
              <Wifi className="w-4 h-4 text-[#C99A44]" />
              100% remote delivery — onboarding and management over video call & digital channels
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button href="/contact" size="lg" variant="primary">Book a Free AI Audit</Button>
              <Button href="/services" size="lg" variant="ghost">Explore Our Services →</Button>
            </div>
          </div>
        </section>

        <SectionWrapper variant="warm" id="cities">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">European Markets We Serve</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">German & European Cities We Work With</h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">Our AI systems operate on European schedules. All onboarding is conducted remotely via video call, and ongoing management is handled asynchronously — no in-person meetings needed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {cities.map((city) => (
              <Card key={city.name} variant="outline" className="space-y-3">
                <h3 className="font-sans font-semibold text-lg text-[#122C57]">{city.name}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{city.desc}</p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper variant="white" id="services">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">Capabilities</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">What We Build for European Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="voice" title="AI Voice Agents" />
              <div className="space-y-3"><Mic className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">AI Voice Agents</h3><p className="text-sm text-[#6B7280]">AI phone answering in German and English. Answers instantly, qualifies callers, and books appointments 24/7 — no Besetztzeichen.</p></div>
              <Link href="/services/ai-voice-agents" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Voice Agents <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="web" title="Website Development" />
              <div className="space-y-3"><Globe className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Website Development</h3><p className="text-sm text-[#6B7280]">High-performance Next.js websites built for Google rankings and lead generation — replacing slow legacy CMS platforms.</p></div>
              <Link href="/services/website-development" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Web Dev <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="agentic" title="Agentic AI Systems" />
              <div className="space-y-3"><Cpu className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Agentic AI Systems</h3><p className="text-sm text-[#6B7280]">Autonomous pipelines that sync calls, CRM, and calendar data — eliminating manual Nacherfassung and follow-up overhead.</p></div>
              <Link href="/services/agentic-ai-systems" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Agentic AI <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="warm" id="testimonial">
          <div className="max-w-2xl">
            <Card variant="warm" className="space-y-4">
              <div className="flex items-center gap-1 text-[#C99A44]">{[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-[#C99A44]" />))}</div>
              <p className="font-serif text-base sm:text-lg text-[#0A1B3D] italic leading-relaxed">&ldquo;Die KI nimmt unsere Anrufe rund um die Uhr auf Deutsch und Englisch entgegen. Termine landen direkt in unserem Kalender.&rdquo;</p>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#122C57]">Maximilian W. · <span className="text-[#6B7280]">Geschäftsführer, Germany</span></p>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="black" id="contact" className="py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">Kein verpasster Anruf mehr — Let us Show You How</h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">Book a free 20-minute audit call. We will assess your setup and show exactly what our AI systems would handle for your business.</p>
            <div className="pt-6 flex justify-center"><Button href="/contact" size="lg" variant="dark-cta">Book an AI Audit</Button></div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}

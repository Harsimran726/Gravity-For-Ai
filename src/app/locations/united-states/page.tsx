import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Mic, Globe, Cpu, Wifi } from 'lucide-react';
import { LocationOperationsCard } from '@/components/visuals/location-operations-card';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export const metadata: Metadata = {
  title: 'AI Voice Agents & Automation - United States Remote Delivery',
  description:
    'Gravity For AI remotely builds and manages AI voice agents, agentic AI systems, and custom websites for US businesses in Texas, Florida, North Carolina, Utah, and Pennsylvania.',
  alternates: { canonical: 'https://gravityforai.com/locations/united-states' },
  openGraph: {
    url: 'https://gravityforai.com/locations/united-states',
    title: 'AI Voice Agents & Automation - United States Remote Delivery',
    description: 'Done-for-you AI voice agents and agentic systems for US businesses - Austin, Raleigh, Tampa, Salt Lake City, Pittsburgh, and beyond.',
  },
};

const cities = [
  { name: 'Austin, TX', desc: 'Commercial contractors, real estate, and tech scaleups. 24/7 AI answers estimate calls and books site visits directly into your calendar.' },
  { name: 'Raleigh, NC (Research Triangle)', desc: 'Healthcare practices, B2B consultancies, and professional services. After-hours AI captures callers who never leave voicemails.' },
  { name: 'Tampa, FL', desc: 'Real estate brokerages, home services, and medical practices. AI qualifies buyers and books showings instantly.' },
  { name: 'Salt Lake City, UT (Silicon Slopes)', desc: 'SaaS companies, dental practices, and financial advisors. Eliminate hold-time abandonment with instant AI answering.' },
  { name: 'Pittsburgh, PA', desc: 'Legal, healthcare, and engineering firms. AI handles front-office intake so billable staff focus on complex work.' },
];

export default function UnitedStatesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Voice Agents & Business Automation - United States',
    provider: { '@type': 'LocalBusiness', name: 'Gravity For AI', address: { '@type': 'PostalAddress', addressLocality: 'Mansa', addressRegion: 'Punjab', addressCountry: 'IN' } },
    areaServed: [{ '@type': 'Country', name: 'United States' }],
    description: 'Done-for-you AI voice agents and agentic automation delivered remotely to US businesses from our engineering base in India.',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="w-full flex flex-col">
        <section className="relative min-h-[75vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
                <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
                <span>United States - Remote Delivery</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.06] text-[#122C57] font-normal tracking-tight">
                Done-For-You AI Systems for US Businesses
              </h1>
              <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-xl leading-relaxed">
                We build and manage enterprise-grade AI voice agents and agentic automation for US businesses - remotely. Our systems speak with natural American English, integrate with US booking stacks, and operate across US time zones.
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-[#6B7280] font-mono">
                <Wifi className="w-4 h-4 text-[#C99A44]" />
                <span>100% remote delivery - fully managed, zero local tech overhead</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button href="/contact" size="lg" variant="primary">Book a Free AI Audit</Button>
                <Button href="/services" size="lg" variant="ghost">Explore Our Services &rarr;</Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <LocationOperationsCard cityName="United States" region="Remote Operations" />
            </div>
          </div>
        </section>

        <SectionWrapper variant="warm" id="cities" animate={false}>
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">US Markets We Serve</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">US Cities &amp; Markets We Work With</h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">Our AI systems operate seamlessly across US time zones. All onboarding is conducted remotely via video call, and ongoing management is handled asynchronously.</p>
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

        <SectionWrapper variant="white" id="services" animate={false}>
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">Capabilities</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">What We Build for US Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="voice" title="AI Voice Agents" />
              <div className="space-y-3"><Mic className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">AI Voice Agents</h3><p className="text-sm text-[#6B7280]">Natural American-English AI phone answering. Answers instantly, qualifies callers, and books appointments 24/7.</p></div>
              <Link href="/services/ai-voice-agents" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Voice Agents <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="web" title="Website Development" />
              <div className="space-y-3"><Globe className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Website Development</h3><p className="text-sm text-[#6B7280]">Sub-2s Next.js websites with local SEO, structured data, and conversion-focused UI that captures US leads.</p></div>
              <Link href="/services/website-development" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Web Dev <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="agentic" title="Agentic AI Systems" />
              <div className="space-y-3"><Cpu className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Agentic AI Systems</h3><p className="text-sm text-[#6B7280]">Autonomous pipelines integrating with Salesforce, HubSpot, Google Calendar, and other US business tools.</p></div>
              <Link href="/services/agentic-ai-systems" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Agentic AI <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="warm" id="testimonial" animate={false}>
          <div className="max-w-2xl">
            <Card variant="warm" className="space-y-4">
              <div className="flex items-center gap-1 text-[#C99A44]">{[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-[#C99A44]" />))}</div>
              <p className="font-serif text-base sm:text-lg text-[#0A1B3D] italic leading-relaxed">&ldquo;The AI answers our estimate calls 24/7, asks all qualifying questions, and schedules site visits straight into my calendar. Worth every dollar.&rdquo;</p>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#122C57]">Marcus T. &middot; <span className="text-[#6B7280]">Commercial Contractor Founder, USA</span></p>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="black" id="contact" animate={false} className="py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">Ready to Stop Missing Leads?</h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">Book a free 20-minute audit call. We will show you the exact system we would build for your business and how quickly it can be live.</p>
            <div className="pt-6 flex justify-center"><Button href="/contact" size="lg" variant="dark-cta">Book an AI Audit</Button></div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}

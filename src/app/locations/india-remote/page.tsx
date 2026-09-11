import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Mic, Globe, Cpu, Wifi } from 'lucide-react';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export const metadata: Metadata = {
  title: 'AI Voice Agents & Automation — India Remote Delivery',
  description:
    'Gravity For AI remotely delivers AI voice agents, custom websites, and agentic automation to businesses in Gandhinagar, Surat, Jaipur, Kolkata, and across India. Engineered from Mansa, Punjab.',
  alternates: { canonical: 'https://gravityforai.com/locations/india-remote' },
  openGraph: {
    url: 'https://gravityforai.com/locations/india-remote',
    title: 'AI Voice Agents & Automation — India Remote Delivery',
    description: 'Done-for-you AI systems delivered remotely to businesses across India — Gandhinagar, Surat, Jaipur, Kolkata, and beyond.',
  },
};

const cities = [
  { name: 'Gandhinagar & GIFT City', desc: 'Fintech, institutional, and compliance-sensitive businesses. Secure AI voice pipelines with multi-timezone client intake.' },
  { name: 'Surat', desc: 'Textile, diamond, and trade enterprises. Trilingual AI (Gujarati, Hindi, English) handling wholesale inquiry volume.' },
  { name: 'Jaipur', desc: 'Tourism, jewelry, hospitality, and private healthcare. After-hours AI captures international buyers and patient bookings.' },
  { name: 'Kolkata', desc: 'Logistics, law, and IT park companies. Modernise legacy web presence and automate front-desk call triage.' },
];

export default function IndiaRemotePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Voice Agents & Business Automation — India Remote Delivery',
    provider: { '@type': 'LocalBusiness', name: 'Gravity For AI', address: { '@type': 'PostalAddress', addressLocality: 'Mansa', addressRegion: 'Punjab', addressCountry: 'IN' } },
    areaServed: [{ '@type': 'Country', name: 'India' }],
    description: 'AI voice agents and agentic automation delivered remotely to businesses across India from our engineering base in Mansa, Punjab.',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="w-full flex flex-col">
        <section className="relative min-h-[65vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
              <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
              <span>India — Remote Delivery</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.06] text-[#122C57] font-normal tracking-tight max-w-4xl">
              AI Automation Delivered Remotely Across India
            </h1>
            <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-2xl leading-relaxed">
              Our engineering base is in Mansa, Punjab, but our systems work anywhere. We build and manage AI voice agents, agentic pipelines, and custom websites for businesses in Gujarat, Rajasthan, West Bengal, and beyond — fully remotely, with no local office required.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-[#6B7280] font-mono">
              <Wifi className="w-4 h-4 text-[#C99A44]" />
              100% remote delivery — onboarding, deployment, and ongoing management over call & digital channels
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button href="/contact" size="lg" variant="primary">Book a Free AI Audit</Button>
              <Button href="/services" size="lg" variant="ghost">Explore Our Services →</Button>
            </div>
          </div>
        </section>

        <SectionWrapper variant="warm" id="cities">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">Markets We Serve Remotely</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">Cities & Regions We Work With Across India</h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">AI systems do not need a local presence to work — they need rigorous engineering. All onboarding, configuration, and ongoing management is done over video calls and digital channels.</p>
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

        <SectionWrapper variant="white" id="services">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">Capabilities</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">What We Build for Indian Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="voice" title="AI Voice Agents" />
              <div className="space-y-3"><Mic className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">AI Voice Agents</h3><p className="text-sm text-[#6B7280]">Multilingual AI call answering — Hindi, English, Punjabi, Gujarati. 24/7 booking, triage, and lead capture.</p></div>
              <Link href="/services/ai-voice-agents" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Voice Agents <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="web" title="Website Development" />
              <div className="space-y-3"><Globe className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Website Development</h3><p className="text-sm text-[#6B7280]">Sub-2s Next.js websites with proper on-page SEO, structured data, and conversion-focused design.</p></div>
              <Link href="/services/website-development" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Web Dev <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
            <Card variant="outline" className="flex flex-col justify-between space-y-6">
              <CardVisualHeader type="agentic" title="Agentic AI Systems" />
              <div className="space-y-3"><Cpu className="w-6 h-6 text-[#122C57]" /><h3 className="font-serif text-2xl text-[#122C57]">Agentic AI Systems</h3><p className="text-sm text-[#6B7280]">Multi-step autonomous pipelines that connect your CRM, WhatsApp, calendar, and reporting systems.</p></div>
              <Link href="/services/agentic-ai-systems" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#122C57] hover:text-[#C99A44] font-medium">View Agentic AI <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="warm" id="testimonial">
          <div className="max-w-2xl">
            <Card variant="warm" className="space-y-4">
              <div className="flex items-center gap-1 text-[#C99A44]">{[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-[#C99A44]" />))}</div>
              <p className="font-serif text-base sm:text-lg text-[#0A1B3D] italic leading-relaxed">&ldquo;Gravity deployed our system seamlessly across our operations. Remote onboarding was smooth and the voice agent went live in under two weeks.&rdquo;</p>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#122C57]">Rohan G. · <span className="text-[#6B7280]">Operations Director, India</span></p>
            </Card>
          </div>
        </SectionWrapper>

        <SectionWrapper variant="black" id="contact" className="py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">Let us Automate Your Business — Wherever You Are in India</h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">Book a free 20-minute audit call. We will assess your operations and show you exactly what our AI systems can automate.</p>
            <div className="pt-6 flex justify-center"><Button href="/contact" size="lg" variant="dark-cta">Book an AI Audit</Button></div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}

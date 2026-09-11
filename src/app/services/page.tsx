import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICES_DATA } from '@/data/services-data';
import { Mic, Globe, Cpu, ArrowRight, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Services & Enterprise Automation Solutions | Gravity For AI',
  description:
    'Explore Gravity For AI services: 24/7 multilingual AI Voice Agents, custom high-speed Next.js websites, and autonomous Agentic AI workflows built for local and growing businesses.',
  alternates: {
    canonical: 'https://gravityforai.com/services',
  },
  openGraph: {
    url: 'https://gravityforai.com/services',
    title: 'AI Services & Enterprise Automation Solutions | Gravity For AI',
    description:
      'Explore Gravity For AI services: 24/7 multilingual AI Voice Agents, custom high-speed Next.js websites, and autonomous Agentic AI workflows built for local and growing businesses.',
  },
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'ai-voice-agents': Mic,
  'website-development': Globe,
  'agentic-ai-systems': Cpu,
};

export default function ServicesIndexPage() {
  const servicesList = Object.values(SERVICES_DATA);

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gravity For AI Services',
    itemListElement: servicesList.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: service.hero.h1,
      url: `https://gravityforai.com/services/${service.slug}`,
      description: service.metaDescription,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />

      <div className="w-full flex flex-col pt-12 sm:pt-20">
        {/* Hero Header */}
        <section className="bg-[#FFFFFF] py-16 sm:py-24 border-b border-[#E4E2DC]">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono uppercase tracking-widest text-[#122C57]">
              <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
              <span>Full-Stack Engineering & Automation</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#122C57] max-w-4xl mx-auto leading-[1.1]">
              Custom AI Voice Agents, High-Speed Websites &amp; Autonomous Systems
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-2xl mx-auto leading-relaxed">
              We design, build, and deploy production-grade AI systems that eliminate repetitive busywork, answer customer inquiries instantly, and drive measurable revenue.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" size="lg" variant="primary">
                Book a Free 20-Min AI Audit
              </Button>
              <Button href="/locations/mansa" size="lg" variant="ghost">
                <MapPin className="w-4 h-4 mr-1.5 text-[#C99A44]" /> Mansa HQ &amp; Regional Hubs
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <SectionWrapper variant="warm">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57]">
              Three Pillars of Operational Automation
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Each solution is custom-engineered and fully managed — so you never need to hire an in-house technical department.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {servicesList.map((service) => {
              const Icon = SERVICE_ICONS[service.slug] || Cpu;
              return (
                <Card
                  key={service.slug}
                  variant="outline"
                  className="bg-[#FFFFFF] p-8 flex flex-col justify-between space-y-6 hover:border-[#122C57] transition-all duration-300 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-[#122C57] text-[#C99A44] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="font-mono text-xs uppercase tracking-wider text-[#C99A44]">
                      {service.hero.badge}
                    </span>

                    <h3 className="font-serif text-2xl text-[#122C57]">
                      {service.hero.h1}
                    </h3>

                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {service.metaDescription}
                    </p>

                    <div className="pt-2 space-y-2 border-t border-[#E4E2DC]">
                      {service.stakes.items.slice(0, 2).map((item) => (
                        <div key={item.tag} className="flex items-start gap-2 text-xs text-[#0A1B3D]">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E4E2DC]">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#122C57] hover:text-[#C99A44] font-semibold transition-colors"
                    >
                      View Service Architecture <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </SectionWrapper>

        {/* Regional Focus */}
        <section className="bg-[#122C57] text-[#FFFFFF] py-16 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
                Local Deployment
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF]">
                Looking for Local Automation in Mansa &amp; Punjab?
              </h2>
              <p className="text-sm text-[#F7F5F0]/80 leading-relaxed">
                We engineer and deploy custom voice models and business pipelines for regional clinics, transport operators, and exporters with multilingual support in Punjabi, Hindi, and English.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Button href="/locations/mansa" size="md" variant="primary">
                Explore Mansa HQ Hub
              </Button>
              <Button href="/contact" size="md" variant="ghost" className="text-[#FFFFFF] border-[#FFFFFF]/40 hover:bg-[#FFFFFF]/10">
                Schedule Audit
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

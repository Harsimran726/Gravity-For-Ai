import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES_DATA } from '@/data/services-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrbitAura } from '@/components/ui/orbit-aura';
import { Check, Star, ChevronDown, ArrowRight } from 'lucide-react';
import { VoiceAgentMockup } from '@/components/visuals/voice-agent-mockup';
import { BrowserSpeedMockup } from '@/components/visuals/browser-speed-mockup';
import { PipelineOrchestratorMockup } from '@/components/visuals/pipeline-orchestrator-mockup';

export function generateStaticParams() {
  return Object.keys(SERVICES_DATA).map((slug) => ({
    slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = SERVICES_DATA[params.slug];
  if (!service) return { title: 'Service Not Found | Gravity For AI' };

  return {
    title: service.title,
    description: service.metaDescription,
    alternates: {
      canonical: `https://gravity4ai.com/services/${service.slug}`,
    },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES_DATA[params.slug];
  if (!service) {
    notFound();
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.serviceType,
    name: service.hero.h1,
    description: service.metaDescription,
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
    areaServed: ['Mansa', 'Bathinda', 'Barnala', 'Ludhiana', 'Jalandhar', 'Amritsar', 'Chandigarh', 'India'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="w-full flex flex-col">
        {/* 1. Hero Section */}
        <section className="relative min-h-[80vh] flex items-center bg-[#FFFFFF] overflow-hidden py-16 sm:py-24">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono tracking-wider uppercase text-[#122C57]">
                <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
                <span>{service.hero.badge}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[70px] leading-[1.06] text-[#122C57] font-normal tracking-tight">
                {service.hero.h1}
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-xl leading-relaxed">
                {service.hero.subheadline}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button href="/contact" size="lg" variant="primary">
                  Book an AI Audit
                </Button>
                <Button href="#plan" size="lg" variant="ghost">
                  How It Works ↓
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              {params.slug === 'ai-voice-agents' && <VoiceAgentMockup />}
              {params.slug === 'website-development' && <BrowserSpeedMockup />}
              {params.slug === 'agentic-ai-systems' && <PipelineOrchestratorMockup />}
              {!['ai-voice-agents', 'website-development', 'agentic-ai-systems'].includes(params.slug) && (
                <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                  <OrbitAura size={440} variant="hero" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. The Stakes (Problem) */}
        <SectionWrapper variant="warm" id="stakes">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              The Obstacle
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {service.stakes.h2}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {service.stakes.items.map((item) => (
              <Card key={item.tag} variant="outline" className="space-y-4">
                <span className="font-mono text-xs text-[#C99A44]">{item.tag}</span>
                <h3 className="font-sans font-medium text-lg text-[#122C57]">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* 3. The Value Proposition */}
        <SectionWrapper variant="white" id="solution">
          <div className="max-w-3xl space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              The Solution
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {service.valueProp.h2}
            </h2>

            <blockquote className="font-sans text-base sm:text-lg text-[#0A1B3D]/90 border-l-2 border-[#C99A44] pl-5 py-1 leading-relaxed bg-[#F7F5F0]/50">
              {service.valueProp.geoParagraph}
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {service.valueProp.pillars.map((pillar) => (
              <Card key={pillar.title} variant="outline" className="space-y-3">
                <h3 className="font-serif text-2xl text-[#122C57]">{pillar.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* 4. The Guide (Authority & Testimonial) */}
        <SectionWrapper variant="warm" id="proof">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-[#E4E2DC]">
            {service.guide.stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="font-mono text-3xl sm:text-4xl font-semibold text-[#122C57]">{stat.value}</p>
                <p className="font-sans font-medium text-xs sm:text-sm text-[#0A1B3D]">{stat.label}</p>
                <p className="font-sans text-[11px] text-[#6B7280]">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl">
            <Card variant="outline" className="space-y-6 bg-[#FFFFFF]">
              <div className="flex items-center gap-1 text-[#C99A44]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C99A44]" />
                ))}
              </div>
              <p className="font-serif text-lg sm:text-xl text-[#0A1B3D] italic leading-relaxed">
                &ldquo;{service.guide.testimonial.quote}&rdquo;
              </p>
              <div className="pt-2">
                <p className="font-sans font-medium text-sm text-[#122C57]">
                  {service.guide.testimonial.name}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {service.guide.testimonial.role} · <span className="text-[#0A1B3D]">{service.guide.testimonial.city}</span>
                </p>
              </div>
            </Card>
          </div>
        </SectionWrapper>

        {/* 5. The Plan */}
        <SectionWrapper variant="white" id="plan">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Implementation Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {service.plan.h2}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-14 relative">
            <div className="hidden md:block absolute top-6 left-12 right-12 h-[1px] bg-[#E4E2DC] -z-0" />
            {service.plan.steps.map((step) => (
              <div key={step.num} className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#122C57] flex items-center justify-center font-mono text-sm font-semibold text-[#122C57] shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-serif text-2xl text-[#122C57]">{step.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* 6. Explanatory Section (if available) */}
        {service.explainer && (
          <SectionWrapper variant="warm" id="explainer">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
                  Architecture & Logic
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
                  {service.explainer.h2}
                </h2>
                <p className="text-base sm:text-lg text-[#0A1B3D]/90 leading-relaxed">
                  {service.explainer.paragraph}
                </p>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {service.explainer.details}
                </p>
              </div>
              <div className="lg:col-span-5 flex justify-center">
                {params.slug === 'website-development' ? (
                  <PipelineOrchestratorMockup />
                ) : (
                  <BrowserSpeedMockup />
                )}
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* 7. Pricing */}
        <SectionWrapper variant="white" id="pricing">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Investment
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
              {service.pricing.h2}
            </h2>
            <p className="text-sm text-[#6B7280]">{service.pricing.description}</p>
          </div>

          <div className={`grid grid-cols-1 ${service.pricing.tiers.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'lg:grid-cols-3'} gap-8 mt-14`}>
            {service.pricing.tiers.map((tier) => (
              <Card
                key={tier.name}
                variant="outline"
                className={`flex flex-col justify-between relative ${tier.popular ? 'border-[#122C57] shadow-sm' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#122C57] text-[#FFFFFF] font-mono text-[10px] uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-[#122C57]">{tier.name}</h3>
                    <p className="font-mono text-sm font-semibold text-[#122C57] mt-3 py-2 border-t border-b border-[#E4E2DC]">
                      {tier.price}
                    </p>
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
            ))}
          </div>
        </SectionWrapper>

        {/* 8. Service FAQs */}
        <SectionWrapper variant="warm" id="faq">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Common Questions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mt-12 space-y-4">
            {service.faqs.map((faq) => (
              <div key={faq.question} className="border border-[#E4E2DC] bg-[#FFFFFF] p-6 space-y-2">
                <h3 className="font-sans font-medium text-base sm:text-lg text-[#122C57]">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed pt-1">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* 9. Closing CTA */}
        <SectionWrapper variant="black" id="contact" className="py-24 sm:py-32 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">
              Ready to Upgrade to {service.hero.badge}?
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
              Book a free 20-minute audit call. We will show you exactly how this system fits your workflow.
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

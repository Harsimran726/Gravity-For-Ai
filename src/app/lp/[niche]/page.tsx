import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { NICHE_LANDING_PAGES } from '@/data/landing-pages-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandingLeadForm } from '@/components/landing/landing-lead-form';
import { ReelEmbedPlayer } from '@/components/landing/reel-embed-player';
import { Star, ArrowRight, ShieldCheck, PhoneCall, Check, HelpCircle } from 'lucide-react';

export function generateStaticParams() {
  return Object.keys(NICHE_LANDING_PAGES).map((niche) => ({
    niche,
  }));
}

export function generateMetadata({ params }: { params: { niche: string } }): Metadata {
  const data = NICHE_LANDING_PAGES[params.niche];
  if (!data) return { title: 'Page Not Found | Gravity For AI' };

  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: {
      canonical: `https://gravityforai.com/lp/${data.slug}`,
    },
    openGraph: {
      url: `https://gravityforai.com/lp/${data.slug}`,
      title: data.meta.title,
      description: data.meta.description,
    },
  };
}

export default function NicheLandingPage({ params }: { params: { niche: string } }) {
  const data = NICHE_LANDING_PAGES[params.niche];
  if (!data) {
    notFound();
  }

  const landingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.nicheTitle,
    description: data.heroSubheadline,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Gravity For AI',
      url: 'https://gravityforai.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mansa',
        addressRegion: 'Punjab',
        addressCountry: 'IN',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingSchema) }}
      />

      <div className="w-full flex flex-col">
        {/* Minimal Distraction-Free Landing Nav Bar */}
        <header className="w-full bg-[#FFFFFF] border-b border-[#E4E2DC] py-4 px-6 sm:px-8 lg:px-12 sticky top-0 z-50">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-sans font-medium text-sm sm:text-base tracking-[0.18em] text-[#122C57] uppercase select-none">
                Gravity <span className="font-normal text-[#122C57]/70">For AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-mono text-[#6B7280]">
                {data.badge}
              </span>
              <Button href="#audit-form" size="sm" variant="primary" className="text-xs uppercase tracking-wider">
                Book AI Audit
              </Button>
            </div>
          </div>
        </header>

        {/* 1. HERO: Niche-Specific Pain Hook */}
        <section className="relative min-h-[70vh] flex items-center bg-[#FFFFFF] overflow-hidden py-14 sm:py-20 border-b border-[#E4E2DC]">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Optional Top Social Proof Quote Hook (e.g. Dr. Raman K for Clinics) */}
              {data.painHookTopQuote && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F7F5F0] border border-[#C99A44]/40 rounded-full text-xs text-[#0A1B3D]">
                  <Star className="w-3.5 h-3.5 fill-[#C99A44] text-[#C99A44] shrink-0" />
                  <span className="italic font-serif">&ldquo;{data.painHookTopQuote.quote}&rdquo;</span>
                  <span className="font-sans font-medium text-[#122C57] hidden md:inline">
                    — {data.painHookTopQuote.author}
                  </span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono uppercase tracking-widest text-[#122C57]">
                <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
                <span>{data.badge}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] leading-[1.1] text-[#122C57] font-normal tracking-tight">
                {data.heroHeadline}
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 max-w-xl leading-relaxed">
                {data.heroSubheadline}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button href="#audit-form" size="lg" variant="primary" className="text-xs uppercase tracking-wider font-semibold">
                  Claim Free 20-Min AI Audit &rarr;
                </Button>
                <Button href="#demo" size="lg" variant="ghost" className="text-xs uppercase tracking-wider">
                  Listen to Call Demo
                </Button>
              </div>

              <div className="pt-3 flex items-center gap-4 text-xs font-mono text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Done-for-you deployment
                </span>
                <span>&bull;</span>
                <span>Punjabi &middot; Hindi &middot; English</span>
              </div>
            </div>

            <div className="lg:col-span-5" id="hero-form">
              <LandingLeadForm
                nicheSlug={data.slug}
                nicheBadge={data.badge}
                fieldLabel={data.formSection.nicheFieldLabel}
                fieldPlaceholder={data.formSection.nicheFieldPlaceholder}
                options={data.formSection.options}
              />
            </div>
          </div>
        </section>

        {/* 2. AGITATE: 3 Friction Points Specific to Their Business */}
        <SectionWrapper variant="warm" id="friction" animate={false}>
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              {data.frictionSection.tag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {data.frictionSection.title}
            </h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 pt-1">
              {data.frictionSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {data.frictionSection.points.map((point) => (
              <Card
                key={point.number}
                variant="outline"
                className="bg-[#FFFFFF] p-6 sm:p-8 space-y-4 hover:border-[#122C57] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="font-mono text-xs text-[#C99A44] font-semibold">
                    {point.number} / ISSUE
                  </span>
                  <h3 className="font-sans font-semibold text-lg text-[#122C57] leading-snug">
                    {point.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* 3. SOLUTION: The AI Voice Agent Demo (Embed Reel / Interactive Voice Simulator) */}
        <SectionWrapper variant="white" id="demo" animate={false}>
          <div className="max-w-3xl space-y-4 mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              {data.solutionSection.tag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {data.solutionSection.title}
            </h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80">
              {data.solutionSection.description}
            </p>
          </div>

          <ReelEmbedPlayer
            nicheTitle={data.nicheTitle}
            reelEmbedUrl={data.solutionSection.reelEmbedUrl}
            audioDemo={data.solutionSection.audioDemo}
          />
        </SectionWrapper>

        {/* 4. PROOF: Matching Testimonial + Quantified Stat */}
        <SectionWrapper variant="warm" id="proof" animate={false}>
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Stat Callout */}
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
                Proven Real-World Impact
              </span>
              <div className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[#122C57] font-normal tracking-tight">
                {data.proofSection.statValue}
              </div>
              <p className="font-sans text-sm sm:text-base text-[#0A1B3D]/90 max-w-sm">
                {data.proofSection.statLabel}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                {data.proofSection.metricBadges.map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#E4E2DC] text-[11px] font-mono text-[#122C57]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="lg:col-span-7">
              <Card
                variant="outline"
                className="bg-[#FFFFFF] border-2 border-[#C99A44] p-8 sm:p-10 space-y-6 shadow-md"
              >
                <div className="flex items-center gap-1 text-[#C99A44]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C99A44]" />
                  ))}
                </div>

                <p className="font-serif text-lg sm:text-xl text-[#0A1B3D] italic leading-relaxed">
                  &ldquo;{data.proofSection.testimonial.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-sm text-[#122C57]">
                      {data.proofSection.testimonial.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {data.proofSection.testimonial.role} &middot; {data.proofSection.testimonial.city}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-mono font-medium">
                    {data.proofSection.testimonial.results}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </SectionWrapper>

        {/* 5. OFFER: Lead Generation Form Section */}
        <SectionWrapper variant="white" id="audit-form" animate={false}>
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              {data.formSection.tag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {data.formSection.title}
            </h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/80 max-w-xl mx-auto">
              {data.formSection.description}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <LandingLeadForm
              nicheSlug={data.slug}
              nicheBadge={data.badge}
              fieldLabel={data.formSection.nicheFieldLabel}
              fieldPlaceholder={data.formSection.nicheFieldPlaceholder}
              options={data.formSection.options}
            />
          </div>
        </SectionWrapper>

        {/* 6. OBJECTION HANDLING: Niche-Specific FAQ */}
        <SectionWrapper variant="warm" id="faq" animate={false}>
          <div className="max-w-3xl space-y-4 mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              {data.faqSection.tag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#122C57] font-normal leading-tight">
              {data.faqSection.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {data.faqSection.faqs.map((faq) => (
              <Card
                key={faq.question}
                variant="outline"
                className="bg-[#FFFFFF] p-6 sm:p-8 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-[#C99A44] shrink-0 mt-0.5" />
                  <h3 className="font-sans font-semibold text-base sm:text-lg text-[#122C57]">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed pl-7.5">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </SectionWrapper>

        {/* Bottom Closing CTA */}
        <SectionWrapper variant="black" animate={false} className="py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">
              Ready to Deploy 24/7 AI Call Handling?
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
              Never let an inbound caller wait on hold or call your competitor again. Get your custom AI voice agent live in 7-10 days.
            </p>
            <div className="pt-4 flex justify-center">
              <Button href="#audit-form" size="lg" variant="dark-cta">
                Claim Your Free AI Audit Now
              </Button>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}

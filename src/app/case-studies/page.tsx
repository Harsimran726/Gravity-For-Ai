import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CASE_STUDIES } from '@/data/case-studies-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { CardVisualHeader } from '@/components/visuals/card-visual-header';

export const metadata: Metadata = {
  title: 'Case Studies & Results | Gravity For AI',
  description:
    'Real results and measurable outcomes from our AI Voice Agent, Next.js website, and agentic workflow deployments in Punjab.',
  alternates: {
    canonical: 'https://gravity4ai.com/case-studies',
  },
};

export default function CaseStudiesPage() {
  return (
    <div className="w-full flex flex-col">
      <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-16">
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
            Proof & Outcomes
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57] font-normal leading-[1.06]">
            Case Studies: Real Systems, Measurable Hours Reclaimed
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed pt-2">
            Explore how businesses in Mansa, Bathinda, and Ludhiana transformed missed calls, slow websites, and chaotic back-office workflows into automated engines.
          </p>
        </div>

        <div className="space-y-10 mt-14">
          {CASE_STUDIES.map((study) => {
            const visualType = study.slug.includes('clinic')
              ? 'clinic'
              : study.slug.includes('logistics')
              ? 'logistics'
              : 'export';
            return (
              <Card
                key={study.slug}
                variant="outline"
                className="p-6 sm:p-8 space-y-6 hover:border-[#122C57] transition-all duration-300"
              >
                <CardVisualHeader
                  type={visualType}
                  title={study.industry}
                  metric={study.metrics[1]?.value ? `${study.metrics[1].value} ${study.metrics[1].label}` : study.metrics[0].value}
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase text-[#6B7280]">
                    <span className="text-[#C99A44] font-semibold">{study.industry}</span>
                    <span>·</span>
                    <span>{study.location}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57] leading-tight">
                    <Link href={`/case-studies/${study.slug}`} className="hover:text-[#C99A44] transition-colors">
                      {study.title}
                    </Link>
                  </h2>

                  <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                    {study.summary}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={`/case-studies/${study.slug}`}
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#122C57] hover:text-[#C99A44] font-semibold"
                    >
                      Read Full Case Study <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-4 bg-[#F7F5F0] p-6 border border-[#E4E2DC]">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <p className="font-mono text-2xl font-semibold text-[#122C57]">{metric.value}</p>
                      <p className="text-[11px] text-[#6B7280] leading-snug">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Closing CTA */}
      <SectionWrapper variant="black" className="py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl text-[#FFFFFF] font-normal leading-tight">
            Ready to Build Your Case Study?
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F7F5F0]/70 max-w-lg mx-auto leading-relaxed">
            Schedule a free 20-minute AI audit. We will map your biggest bottleneck and show you what an automated system can achieve.
          </p>
          <div className="pt-6 flex justify-center">
            <Button href="/contact" size="lg" variant="dark-cta">
              Book an AI Audit
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

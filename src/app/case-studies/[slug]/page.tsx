import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CASE_STUDIES } from '@/data/case-studies-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { VoiceAgentMockup } from '@/components/visuals/voice-agent-mockup';
import { BrowserSpeedMockup } from '@/components/visuals/browser-speed-mockup';
import { PipelineOrchestratorMockup } from '@/components/visuals/pipeline-orchestrator-mockup';

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({
    slug: study.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = CASE_STUDIES.find((s) => s.slug === params.slug);
  if (!study) return { title: 'Case Study Not Found | Gravity For AI' };

  return {
    title: `${study.title} | Gravity For AI Case Study`,
    description: study.summary,
    alternates: {
      canonical: `https://gravityforai.com/case-studies/${study.slug}`,
    },
    openGraph: {
      url: `https://gravityforai.com/case-studies/${study.slug}`,
      title: `${study.title} | Gravity For AI Case Study`,
      description: study.summary,
    },
  };
}

export default function CaseStudyDetailPage({ params }: { params: { slug: string } }) {
  const study = CASE_STUDIES.find((s) => s.slug === params.slug);
  if (!study) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col">
      <SectionWrapper variant="white" className="pt-10 sm:pt-14 pb-16">
        <div className="max-w-4xl space-y-8">
          {/* Back link */}
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#122C57] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Case Studies
          </Link>

          {/* Heading info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase text-[#6B7280]">
              <span className="text-[#C99A44] font-semibold">{study.industry}</span>
              <span>·</span>
              <span>{study.location}</span>
              <span>·</span>
              <span className="text-[#122C57] font-medium">{study.client}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] text-[#122C57] font-normal leading-tight">
              {study.title}
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed pt-2">
              {study.summary}
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F7F5F0] p-6 sm:p-8 border border-[#E4E2DC] my-8">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="space-y-1">
                <p className="font-mono text-3xl sm:text-4xl font-semibold text-[#122C57]">{metric.value}</p>
                <p className="text-xs text-[#6B7280] leading-snug">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* Visual Architecture Simulation */}
          <div className="my-10 flex justify-center w-full">
            {study.slug === 'mansa-clinic-ai-receptionist' && <VoiceAgentMockup />}
            {study.slug === 'bathinda-logistics-dispatch-automation' && <PipelineOrchestratorMockup />}
            {study.slug === 'ludhiana-export-lead-gen-website' && <BrowserSpeedMockup />}
          </div>

          {/* Challenge Section */}
          <div className="space-y-4 pt-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              The Operational Problem
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">The Challenge</h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/90 leading-relaxed">
              {study.challenge}
            </p>
          </div>

          {/* Solution Section */}
          <div className="space-y-4 pt-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
              Engineering & Deployment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">The Solution</h2>
            <p className="text-sm sm:text-base text-[#0A1B3D]/90 leading-relaxed">
              {study.solution}
            </p>
          </div>

          {/* Architectural Guardrails */}
          <div className="space-y-4 pt-6">
            <h3 className="font-serif text-xl sm:text-2xl text-[#122C57]">Key Technical Pillars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {study.architecturePoints.map((point) => (
                <Card key={point} variant="outline" className="flex items-start gap-3 p-5">
                  <CheckCircle2 className="w-5 h-5 text-[#C99A44] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#0A1B3D]/90 leading-relaxed">{point}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Callout */}
          <div className="pt-10 mt-8 border-t border-[#E4E2DC] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-serif text-xl text-[#122C57]">Experience Similar Results</h4>
              <p className="text-xs sm:text-sm text-[#6B7280]">Book a 20-minute audit to analyze your workflows.</p>
            </div>
            <Button href="/contact" size="md" variant="primary">
              Book an AI Audit
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

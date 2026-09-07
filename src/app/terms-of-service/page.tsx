import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';

export const metadata: Metadata = {
  title: 'Terms of Service | Gravity For AI',
  description: 'Terms of service and engagement terms of Gravity For AI.',
  alternates: {
    canonical: 'https://gravity4ai.com/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return (
    <SectionWrapper variant="white" className="pt-12 pb-24">
      <div className="max-w-3xl space-y-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#122C57]">Terms of Service</h1>
        <p className="text-xs font-mono text-[#6B7280]">Last updated: September 1, 2026</p>

        <div className="space-y-6 text-sm text-[#0A1B3D]/90 leading-relaxed pt-4 border-t border-[#E4E2DC]">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">1. Agreement to Terms</h2>
            <p>
              By accessing our website or engaging Gravity For AI for consulting, software development, AI voice agent hosting, or automation engineering, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">2. Scope of Services</h2>
            <p>
              Gravity For AI provides done-for-you technical services. Specific deliverables, payment schedules, and operational service level agreements (SLAs) are defined in dedicated Statements of Work (SOWs) executed per client engagement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">3. Intellectual Property Ownership</h2>
            <p>
              Unless otherwise specified in a custom SOW, clients retain full ownership of their proprietary business data, brand assets, and custom deliverables created upon full payment settlement.
            </p>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}

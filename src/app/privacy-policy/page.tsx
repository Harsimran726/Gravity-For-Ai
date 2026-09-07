import * as React from 'react';
import type { Metadata } from 'next';
import { SectionWrapper } from '@/components/ui/section-wrapper';

export const metadata: Metadata = {
  title: 'Privacy Policy | Gravity For AI',
  description: 'Privacy Policy and data governance practices of Gravity For AI.',
  alternates: {
    canonical: 'https://gravity4ai.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <SectionWrapper variant="white" className="pt-12 pb-24">
      <div className="max-w-3xl space-y-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#122C57]">Privacy Policy</h1>
        <p className="text-xs font-mono text-[#6B7280]">Last updated: September 1, 2026</p>

        <div className="space-y-6 text-sm text-[#0A1B3D]/90 leading-relaxed pt-4 border-t border-[#E4E2DC]">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">1. Introduction</h2>
            <p>
              Gravity For AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), based in Mansa, Punjab, India, is committed to safeguarding the privacy and data security of our clients, website visitors, and callers interacting with our AI voice systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">2. Information We Collect</h2>
            <p>
              When you submit a discovery audit request or contact us, we collect information such as your name, business name, work email, phone number, and brief description of your operational needs. For telephony AI systems, voice data and transcripts are processed strictly to fulfill appointment scheduling and inquiry triage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">3. Data Isolation & AI Safety</h2>
            <p>
              We enforce strict tenant data isolation. Private business data, customer records, and internal documents provided by our clients are never used to train public commercial AI models. All data is encrypted in transit using TLS 1.3 and at rest.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#122C57]">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your data, please contact our data team at <span className="font-medium text-[#122C57]">contact@gravity4ai.com</span>.
            </p>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}

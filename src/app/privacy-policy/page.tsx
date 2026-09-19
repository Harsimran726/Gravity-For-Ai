import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ShieldCheck, Lock, Eye, Server, PhoneCall, Cookie, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy and data governance practices of Gravity For AI. Learn how we collect, protect, and process client information, AI voice recordings, and advertising data.',
  alternates: {
    canonical: 'https://gravityforai.com/privacy-policy',
  },
  openGraph: {
    url: 'https://gravityforai.com/privacy-policy',
    title: 'Privacy Policy | Gravity For AI',
    description:
      'Privacy Policy and data governance practices of Gravity For AI. Learn how we collect, protect, and process client information, AI voice recordings, and advertising data.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <SectionWrapper variant="white" className="pt-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C99A44] hover:underline mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44] font-semibold">
              Legal &amp; Compliance Documentation
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#122C57] font-normal leading-tight">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-[#6B7280]">
              Effective Date: September 1, 2026 · Last Updated: September 19, 2026
            </p>
          </div>
        </div>

        {/* Quick Highlights Card */}
        <div className="p-6 rounded-2xl bg-[#F7F5F0] border border-[#E4E2DC] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#122C57] text-[#C99A44] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-semibold text-sm text-[#122C57]">Zero Public Model Training</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Your business data, caller recordings, and proprietary workflows are never used to train public commercial AI models.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#122C57] text-[#C99A44] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-semibold text-sm text-[#122C57]">End-to-End Encryption</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              All communications and telephony payloads are encrypted in transit using TLS 1.3 and at rest with AES-256.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#122C57] text-[#C99A44] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-semibold text-sm text-[#122C57]">Strict Data Rights</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              You retain absolute ownership of your lead records and can request complete export or deletion at any time.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-sm sm:text-base text-[#0A1B3D]/90 leading-relaxed border-t border-[#E4E2DC] pt-8">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">1. Introduction &amp; Corporate Identity</h2>
            <p>
              Gravity For AI (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website{' '}
              <Link href="https://gravityforai.com" className="text-[#122C57] font-medium underline">
                https://gravityforai.com
              </Link>{' '}
              and provides enterprise AI call agents, conversational intake systems, and modern web application development. We are headquartered in Mansa, Punjab, India (PIN: 151505).
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, protect, and disclose your personal and business data when you visit our website, request a free AI discovery audit, submit an inquiry, interact with our interactive telephone prototypes, or engage our engineering services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">2. Information We Collect</h2>
            <p>We collect information in the following categories:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-[#122C57]">Direct Form Inquiries &amp; Audit Bookings:</strong> When you complete our contact forms, audit booking calendars, or niche landing page inquiries, we collect your full name, business or practice name, work email address, telephone/WhatsApp number, preferred meeting time, and a summary of your automation requirements.
              </li>
              <li>
                <strong className="text-[#122C57]">AI Call Agent Telephony &amp; Audio Data:</strong> When prospective clients test our voice call simulators or deploy production AI voice agents, our systems process audio streams, speech-to-text transcripts, caller phone numbers, call durations, and booking timestamps solely to fulfill appointment scheduling, inquiry qualification, and CRM logging.
              </li>
              <li>
                <strong className="text-[#122C57]">Technical &amp; Log Data:</strong> When you navigate our website, our web servers and analytics services automatically record technical data including your IP address, browser type, device operating system, referring URL, pages visited, and interaction timestamps.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">
              3. Advertising, Meta Pixel &amp; Tracking Technologies
            </h2>
            <p>
              We use standard advertising measurement and analytics tools to understand how prospective business clients discover Gravity For AI:
            </p>
            <div className="p-5 rounded-xl bg-[#F7F5F0] border border-[#E4E2DC] space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#122C57] font-semibold">
                <Cookie className="w-4 h-4 text-[#C99A44]" />
                <span>Meta (Facebook &amp; Instagram) Pixel &amp; Conversions API</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                We operate the Meta Pixel (Pixel ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E4E2DC]">2111062089501666</code>) and the Meta Conversions API (server-side event delivery). When you submit an inquiry or schedule an audit, a conversion event (such as &ldquo;Lead&rdquo;) is transmitted to Meta Platforms, Inc.
              </p>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                <strong>Cryptographic Privacy Protection:</strong> Before transmitting any contact identifiers (such as email addresses or phone numbers) to Meta via the Conversions API, they are normalized and cryptographically hashed on our secure server using the one-way <strong>SHA-256</strong> hashing algorithm. Meta matches these anonymized hashes with its user database for ad conversion measurement without seeing your raw contact credentials.
              </p>
              <div className="pt-2">
                <span className="text-xs text-[#122C57] font-semibold">Google Tag Manager &amp; Analytics:</span>
                <p className="text-xs text-[#4B5563] pt-1">
                  We also deploy Google Tag Manager (Container ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E4E2DC]">GTM-KGBMFDBJ</code>) and Google Analytics to monitor aggregated site speed, Core Web Vitals, and page usage.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              <strong>Opt-Out:</strong> You can manage or disable cookie tracking via your browser preferences or through the Digital Advertising Alliance at{' '}
              <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="underline text-[#122C57]">
                optout.aboutads.info
              </a>{' '}
              or Meta Ad Preferences at{' '}
              <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className="underline text-[#122C57]">
                facebook.com/adpreferences
              </a>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">4. How We Use Your Information</h2>
            <p>We process collected data strictly for legitimate business purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>To evaluate your business automation needs and prepare your free AI architecture audit.</li>
              <li>To build, train, configure, and demonstrate tailored AI voice receptionist prototypes.</li>
              <li>To transmit calendar confirmations, token numbers, and meeting links via email and WhatsApp.</li>
              <li>To measure the return on ad spend (ROAS) and effectiveness of our marketing campaigns.</li>
              <li>To prevent fraudulent form spam through honeypot detection mechanisms.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">
              5. AI Safety &amp; Non-Training Commitment
            </h2>
            <div className="p-5 rounded-xl bg-[#122C57] text-[#F7F5F0] space-y-2">
              <h3 className="font-serif text-lg text-[#C99A44]">Our Explicit Client AI Pledge</h3>
              <p className="text-xs sm:text-sm text-[#F7F5F0]/85 leading-relaxed">
                Gravity For AI maintains strict tenant separation. Proprietary business data, patient records, real estate listing inquiries, and private caller voice recordings provided by or generated for our clients are <strong>never used to train, fine-tune, or improve public foundational AI models</strong> (e.g. public models from OpenAI, Google, Anthropic, or Meta). Your data belongs exclusively to your business.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">6. Third-Party Sharing &amp; Disclosures</h2>
            <p>
              We do not sell, rent, or monetize your personal information under any circumstance. We disclose data solely to trusted third-party infrastructure providers necessary to operate our service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-[#122C57]">Hosting &amp; Database Infrastructure:</strong> Vercel Inc. (cloud edge hosting) and PostgreSQL cloud databases with automated encrypted backups.
              </li>
              <li>
                <strong className="text-[#122C57]">Telephony &amp; Voice Carriers:</strong> Telecommunications partners (e.g. Twilio, SIP trunks) for inbound telephone routing and call bridging.
              </li>
              <li>
                <strong className="text-[#122C57]">Ad Measurement:</strong> Meta Platforms, Inc. (anonymized SHA-256 hashed conversion signals) and Google LLC.
              </li>
              <li>
                <strong className="text-[#122C57]">Transactional Communications:</strong> SMTP and WhatsApp Business API gateways for booking notifications.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">7. Data Retention &amp; Security</h2>
            <p>
              We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy or to comply with applicable legal obligations. We employ industry-standard technical and organizational security controls, including TLS 1.3 encryption for all data in transit, AES-256 encryption for stored records, firewall filtering, and least-privilege role-based access controls.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">8. Your Rights &amp; Choices</h2>
            <p>
              Under applicable data protection laws (including the Information Technology Act of India and Digital Personal Data Protection Act), you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or updating of inaccurate information.</li>
              <li>Request permanent deletion of your inquiry records or audio transcripts.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
            <p className="text-sm pt-2">
              To exercise any of these rights, email our compliance team at{' '}
              <a href="mailto:contact@gravityforai.com" className="text-[#122C57] font-semibold underline">
                contact@gravityforai.com
              </a>.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">9. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect technological changes, new regulatory guidance, or operational adjustments. The updated version will be posted on this page with an updated &ldquo;Last Updated&rdquo; date.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4 pt-4 border-t border-[#E4E2DC]">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">10. Contact Us</h2>
            <p>For questions, privacy inquiries, or data protection requests, please reach out to:</p>
            <div className="p-5 rounded-xl bg-[#F7F5F0] border border-[#E4E2DC] text-xs sm:text-sm space-y-1.5 font-mono text-[#122C57]">
              <p className="font-bold">Gravity For AI</p>
              <p>Mansa, Punjab 151505, India</p>
              <p>Email: contact@gravityforai.com</p>
              <p>Website: https://gravityforai.com</p>
            </div>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}

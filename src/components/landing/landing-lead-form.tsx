'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { submitLeadAction, FormState } from '@/actions/lead-actions';
import { trackMetaLead } from '@/lib/meta-pixel';
import { CheckCircle2, ShieldCheck, ArrowRight, Phone, Mail, Building, User, Sparkles } from 'lucide-react';

interface LandingLeadFormProps {
  nicheSlug: string;
  nicheBadge: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  options: string[];
}

export function LandingLeadForm({
  nicheSlug,
  nicheBadge,
  fieldLabel,
  fieldPlaceholder,
  options,
}: LandingLeadFormProps) {
  const [formState, setFormState] = React.useState<FormState>({});
  const [isPending, startTransition] = React.useTransition();
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const phone = String(formData.get('phone') || '');
    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    startTransition(async () => {
      const result = await submitLeadAction({}, formData);
      setFormState(result);
      if (result.success) {
        setSubmitted(true);

        // 1. Send server-side Conversions API event with eventId
        fetch('/api/lead-conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            phone,
            eventId,
            serviceInterest: `AI Voice Agent - ${nicheBadge}`,
          }),
        }).catch((err) => console.warn('[Meta CAPI] client dispatch notice:', err));

        // 2. Fire client-side Meta Pixel Lead event with matching eventID for deduplication
        trackMetaLead(
          {
            content_name: `AI Voice Agent - ${nicheBadge}`,
            currency: 'INR',
          },
          eventId
        );
      }
    });
  };

  if (submitted) {
    return (
      <Card
        variant="outline"
        className="bg-[#FFFFFF] border-2 border-[#C99A44] p-8 sm:p-10 text-center space-y-6 shadow-xl"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44] font-semibold">
            Inquiry Confirmed
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#122C57]">
            Your AI Prototype Request Is In Our Orbit
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
            Thank you! Our engineering team will review your business details and prepare a live custom voice agent prototype. We will call you within 24 hours.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E4E2DC] flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/contact" size="md" variant="primary" className="text-xs uppercase tracking-wider">
            Schedule on Live Calendar <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
          <Button href="/" size="md" variant="ghost" className="text-xs uppercase tracking-wider">
            Explore Gravity For AI HQ
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="outline"
      className="bg-[#FFFFFF] border border-[#E4E2DC] p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E4E2DC]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#C99A44] animate-pulse" />
        <span className="text-xs font-mono tracking-wider uppercase text-[#122C57] font-semibold">
          {nicheBadge} &middot; Fast-Track Setup
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Anti-spam honeypot */}
        <input
          type="text"
          name="website_hp"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <input type="hidden" name="serviceInterest" value={`AI Voice Agent - ${nicheBadge}`} />

        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-[#C99A44]" /> Your Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Dr. Harpreet Singh"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#C99A44] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#C99A44]" /> WhatsApp / Mobile *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#C99A44] transition-colors"
            />
          </div>
        </div>

        {/* Business Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-[#C99A44]" /> Business / Clinic Name *
            </label>
            <input
              type="text"
              name="businessName"
              required
              placeholder="e.g. City Care Practice"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#C99A44] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#C99A44]" /> Business Email *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@business.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#C99A44] transition-colors"
            />
          </div>
        </div>

        {/* Niche-Specific Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C99A44]" /> {fieldLabel} *
          </label>
          <select
            name="message"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#C99A44] transition-colors cursor-pointer"
          >
            <option value="">{fieldPlaceholder}</option>
            {options.map((opt) => (
              <option key={opt} value={`Focus Area: ${opt}`}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {formState.message && !formState.success && (
          <p className="text-xs font-mono text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
            {formState.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          variant="primary"
          className="w-full py-4 text-sm uppercase tracking-wider font-semibold shadow-md flex items-center justify-center gap-2"
        >
          {isPending ? 'Generating Prototype Details...' : 'Claim Free 20-Minute AI Audit & Live Demo'}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-[#6B7280] font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Confidential
          </span>
          <span>&bull;</span>
          <span>Zero Obligation</span>
          <span>&bull;</span>
          <span>Custom Demo in 24 Hours</span>
        </div>
      </form>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitLeadAction, type FormState } from '@/actions/lead-actions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const initialState: FormState = {
  success: false,
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={pending}
      className="w-full justify-center text-sm sm:text-base py-4"
    >
      {pending ? 'Scheduling Audit...' : 'Book Your Free AI Audit'}
    </Button>
  );
}

export function ContactForm({ initialService = 'AI Audit' }: { initialService?: string }) {
  const [state, formAction] = useFormState(submitLeadAction, initialState);

  if (state.success) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E4E2DC] p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-[#F7F5F0] rounded-full flex items-center justify-center mx-auto text-[#122C57]">
          <CheckCircle2 className="w-8 h-8 text-[#C99A44]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl text-[#122C57]">Audit Request Confirmed</h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
            {state.message}
          </p>
        </div>
        <div className="pt-4 border-t border-[#E4E2DC]">
          <p className="text-xs text-[#6B7280]">
            Direct email: <span className="text-[#122C57] font-medium">contact@gravityforai.com</span> · Mansa, Punjab
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-[#FFFFFF] border border-[#E4E2DC] p-6 sm:p-10 space-y-6">
      {/* Honeypot Spam Protection Field (Hidden from humans) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_hp">Leave this empty</label>
        <input
          type="text"
          id="website_hp"
          name="website_hp"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.message && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
            Your Name <span className="text-[#C99A44]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g. Gurpreet Singh"
            className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors"
          />
          {state.errors?.name && (
            <p className="text-[11px] text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <label htmlFor="businessName" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
            Business / Practice Name
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            placeholder="e.g. Apex Clinic Mansa"
            className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
            Work Email <span className="text-[#C99A44]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="gurpreet@example.com"
            className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors"
          />
          {state.errors?.email && (
            <p className="text-[11px] text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
            Phone Number (WhatsApp)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors"
          />
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-2">
        <label htmlFor="serviceInterest" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
          Primary Service Interest
        </label>
        <select
          id="serviceInterest"
          name="serviceInterest"
          defaultValue={initialService}
          className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors"
        >
          <option value="AI Audit">General 20-Minute AI Audit (Recommended)</option>
          <option value="AI Voice Agents">AI Voice Agents & Phone Answering</option>
          <option value="Website Development">Conversion Website Development</option>
          <option value="Agentic AI Systems">Agentic Back-Office Automation</option>
          <option value="Full Digital Suite">Full Suite (Voice + Web + Automation)</option>
        </select>
      </div>

      {/* Message / Pain Point */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
          What is currently slowing your business down? <span className="text-[#C99A44]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="e.g. We miss customer calls after hours and spend too many hours manually copying order records."
          className="w-full px-4 py-3 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-sm text-[#0A1B3D] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#122C57] focus:bg-[#FFFFFF] transition-colors resize-none"
        />
        {state.errors?.message && (
          <p className="text-[11px] text-red-600">{state.errors.message[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <SubmitButton />
        <p className="text-center text-[11px] text-[#6B7280] pt-3">
          100% Free 20-minute audit · No hard selling · Direct engineer review
        </p>
      </div>
    </form>
  );
}

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { loginAdminAction, type LoginState } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, Mail, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const initialState: LoginState = {
  success: false,
  message: '',
  errors: {},
};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      disabled={pending}
      className="w-full justify-center text-xs uppercase tracking-wider py-3.5 bg-[#122C57] text-[#FFFFFF] hover:bg-[#122C57]/90 border border-[#C99A44]/40"
    >
      {pending ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
    </Button>
  );
}

function LoginFormContent() {
  const [state, formAction] = useFormState(loginAdminAction, initialState);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  React.useEffect(() => {
    if (state.success) {
      window.location.href = redirectPath;
    }
  }, [state.success, redirectPath]);

  return (
    <Card
      variant="outline"
      className="w-full bg-[#122C57]/30 backdrop-blur-xl border border-[#C99A44]/30 p-8 space-y-6 shadow-2xl rounded-lg text-[#F7F5F0]"
    >
      {/* Header with Security Emblem */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-[#122C57] rounded-full flex items-center justify-center mx-auto text-[#FFFFFF] border-2 border-[#C99A44] shadow-md">
          <ShieldCheck className="w-7 h-7 text-[#C99A44]" />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FFFFFF] tracking-wide">
            Gravity For AI Admin
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#C99A44]">
            Protected Management Portal
          </p>
        </div>
      </div>

      {state.message && (
        <div
          className={`p-3.5 rounded text-xs flex items-center gap-2 ${
            state.success
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
              : 'bg-red-950/80 text-red-200 border border-red-500/40'
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <Lock className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4 text-left">
        {/* Email - Clean and Blank */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#F7F5F0]/90 font-semibold">
            Admin Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@gravity4ai.com"
              className="w-full px-4 py-2.5 bg-[#0A0A0D]/80 border border-[#233A6B] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C99A44] rounded placeholder:text-[#6B7280]"
            />
            <Mail className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
          </div>
          {state.errors?.email && (
            <p className="text-[11px] text-red-400">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password - Clean and Blank */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#F7F5F0]/90 font-semibold">
            Master Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-[#0A0A0D]/80 border border-[#233A6B] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C99A44] rounded placeholder:text-[#6B7280]"
            />
            <Lock className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
          </div>
          {state.errors?.password && (
            <p className="text-[11px] text-red-400">{state.errors.password[0]}</p>
          )}
        </div>

        {/* 2FA TOTP Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#F7F5F0]/90 font-semibold">
              2FA Authenticator Code
            </label>
            <span className="text-[10px] text-[#C99A44] font-mono">Optional in dev</span>
          </div>
          <div className="relative">
            <input
              type="text"
              name="totpCode"
              placeholder="6-digit code (e.g. 123456)"
              className="w-full px-4 py-2.5 bg-[#0A0A0D]/80 border border-[#233A6B] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C99A44] rounded font-mono placeholder:text-[#6B7280]"
            />
            <Key className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
          </div>
        </div>

        <div className="pt-2">
          <LoginButton />
        </div>
      </form>

      <div className="text-center pt-4 border-t border-[#233A6B]/50">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#C99A44] transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Website
        </Link>
      </div>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6">
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#6B7280]">Loading Authentication Portal...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}

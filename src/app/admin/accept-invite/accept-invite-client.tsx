'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/actions/team-actions';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function AcceptInviteClient() {
  const [invite,setInvite]=React.useState<{token:string;email:string}|null>(null);
  const loaded=React.useRef(false);
  React.useEffect(()=>{
    if(loaded.current)return; loaded.current=true;
    const q=new URLSearchParams(window.location.hash.slice(1));
    setInvite({token:q.get('token')||'',email:q.get('email')||''});
    window.history.replaceState(null,'',window.location.pathname);
  },[]);
  const {token,email}=invite||{token:'',email:''};
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  if(!invite)return <p className="text-white">Checking invitation…</p>;

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#0A1B3D] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-mono text-sm">Invalid invitation link.</p>
          <p className="text-[#6B7280] text-xs">
            This link may have expired or is malformed. Please contact your admin.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A1B3D] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#C99A44] mx-auto" />
          <p className="font-serif text-2xl text-[#F7F5F0]">Password Set Successfully!</p>
          <p className="text-[#9CA3AF] text-sm">Your account is now active. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append('token', token);
    fd.append('email', email);
    fd.append('password', password);

    const result = await acceptInviteAction({}, fd);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/login'), 2500);
    } else {
      setError(result.message || 'Failed to set password. Link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1B3D] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/apple-touch-icon.png"
            alt="Gravity For AI"
            width={40}
            height={40}
            className="mx-auto rounded-lg"
          />
          <h1 className="font-serif text-3xl text-[#F7F5F0]">Accept Your Invitation</h1>
          <p className="text-[#9CA3AF] text-sm">Set a secure password to activate your admin account.</p>
          <p className="text-[#C99A44] font-mono text-xs">{decodeURIComponent(email)}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#122C57] border border-[#233A6B] p-6 space-y-4">
          {error && (
            <p className="text-red-400 text-sm font-mono bg-red-950/30 px-3 py-2">{error}</p>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9CA3AF] uppercase">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Min 8 characters"
                className="w-full pl-9 pr-10 py-2.5 bg-[#0A1B3D] border border-[#233A6B] text-[#F7F5F0] text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#C99A44]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F7F5F0]"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9CA3AF] uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                className="w-full pl-9 pr-10 py-2.5 bg-[#0A1B3D] border border-[#233A6B] text-[#F7F5F0] text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#C99A44]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F7F5F0]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#C99A44] text-[#0A1B3D] font-semibold text-sm hover:bg-[#B8893A] disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? 'Setting Password...' : 'Set Password & Activate Account'}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#6B7280]">
          Gravity For AI Admin Portal · gravityforai.com
        </p>
      </div>
    </div>
  );
}


'use client';

import * as React from 'react';
import Link from 'next/link';
import { updateProspectStatusAction, updateCampaignStatusAction, deleteCampaignAction } from '@/actions/outreach-actions';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, Play, Pause, CheckCircle2, XCircle, Clock,
  Users, Mail, BarChart2, Trash2, AlertCircle, Check,
  Timer, TrendingUp, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string; name: string; subject: string; status: string;
  dailyLimit: number; totalSent: number; totalFailed: number;
  sentToday: number; createdAt: string;
}
interface Prospect {
  id: string; name: string; email: string; company: string | null;
  status: string; sentAt: string | null; error: string | null;
}
interface Props { campaign: Campaign; initialProspects: Prospect[]; }

// ─── Status styling ───────────────────────────────────────────────────────────
const PROSPECT_BADGE: Record<string, string> = {
  PENDING:  'bg-[#F3F4F6] text-[#374151]',
  SELECTED: 'bg-[#EDE9FE] text-[#5B21B6]',
  SENT:     'bg-emerald-100 text-emerald-800',
  FAILED:   'bg-red-100 text-red-700',
  SKIPPED:  'bg-[#F3F4F6] text-[#9CA3AF]',
};
const PROSPECT_ICON: Record<string, React.ReactNode> = {
  PENDING:  <Clock className="w-3 h-3" />,
  SELECTED: <Check className="w-3 h-3" />,
  SENT:     <CheckCircle2 className="w-3 h-3" />,
  FAILED:   <XCircle className="w-3 h-3" />,
  SKIPPED:  <Clock className="w-3 h-3" />,
};

// ─── Countdown component ──────────────────────────────────────────────────────
function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = React.useState(seconds);
  React.useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [seconds]);
  const pct = Math.round(((seconds - remaining) / seconds) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#E4E2DC" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="#C99A44" strokeWidth="3"
            strokeDasharray={`${pct * 0.942} 94.2`} strokeLinecap="round" />
        </svg>
        <Timer className="absolute inset-0 m-auto w-4 h-4 text-[#C99A44]" />
      </div>
      <div>
        <p className="text-xs font-mono text-[#6B7280]">Next email in</p>
        <p className="text-lg font-mono font-semibold text-[#122C57]">
          {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CampaignDetailClient({ campaign, initialProspects }: Props) {
  const [prospects, setProspects] = React.useState<Prospect[]>(initialProspects);
  const [isRunning, setIsRunning] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [statusMsg, setStatusMsg] = React.useState('');
  const [toast, setToast] = React.useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sentToday, setSentToday] = React.useState(campaign.sentToday);
  const [totalSent, setTotalSent] = React.useState(campaign.totalSent);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = React.useRef(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Computed counts ──
  const counts = React.useMemo(() => ({
    total: prospects.length,
    pending: prospects.filter((p) => p.status === 'PENDING').length,
    selected: prospects.filter((p) => p.status === 'SELECTED').length,
    sent: prospects.filter((p) => p.status === 'SENT').length,
    failed: prospects.filter((p) => p.status === 'FAILED').length,
  }), [prospects]);

  // ── Select / deselect ──
  const selectAll = async () => {
    const ids = prospects.filter((p) => p.status === 'PENDING').map((p) => p.id);
    if (!ids.length) return;
    await updateProspectStatusAction(ids, 'SELECTED');
    setProspects((prev) => prev.map((p) => p.status === 'PENDING' ? { ...p, status: 'SELECTED' } : p));
  };
  const deselectAll = async () => {
    const ids = prospects.filter((p) => p.status === 'SELECTED').map((p) => p.id);
    if (!ids.length) return;
    await updateProspectStatusAction(ids, 'PENDING');
    setProspects((prev) => prev.map((p) => p.status === 'SELECTED' ? { ...p, status: 'PENDING' } : p));
  };
  const toggleOne = async (prospect: Prospect) => {
    if (prospect.status === 'SENT' || prospect.status === 'FAILED') return;
    const newStatus = prospect.status === 'SELECTED' ? 'PENDING' : 'SELECTED';
    await updateProspectStatusAction([prospect.id], newStatus as 'SELECTED' | 'PENDING');
    setProspects((prev) => prev.map((p) => p.id === prospect.id ? { ...p, status: newStatus } : p));
  };

  // ── Drip send loop ──
  const sendOne = React.useCallback(async () => {
    if (!runningRef.current) return;

    setStatusMsg('Sending email...');
    try {
      const res = await fetch('/api/admin/outreach/send-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      const data = await res.json();

      if (data.error) {
        showToast(`API Error: ${data.error}`, 'error');
        setIsRunning(false);
        runningRef.current = false;
        setCountdown(null);
        setStatusMsg('');
        return;
      }

      if (data.limitReached) {
        setIsRunning(false);
        runningRef.current = false;
        setCountdown(null);
        setSentToday(data.sentToday);
        setStatusMsg(`Daily limit of ${data.dailyLimit} reached. Sending will resume tomorrow.`);
        showToast(`Daily limit reached (${data.dailyLimit}/day). Resumes tomorrow.`, 'error');
        return;
      }

      if (data.done) {
        setIsRunning(false);
        runningRef.current = false;
        setCountdown(null);
        setStatusMsg(data.message || 'All selected prospects processed!');
        showToast('Campaign sending complete!', 'success');
        return;
      }

      // Update the prospect row in local state
      if (data.prospect) {
        setProspects((prev) =>
          prev.map((p) =>
            p.id === data.prospect.id
              ? { ...p, status: data.prospect.status, sentAt: data.prospect.sentAt, error: data.prospect.error }
              : p
          )
        );
      }
      if (data.sentToday !== undefined) setSentToday(data.sentToday);
      if (data.sent) setTotalSent((t) => t + 1);

      setStatusMsg(`Sent to ${data.prospect?.email}. ${data.remaining} remaining.`);

      if (!runningRef.current) return;

      // Random delay 45–120 seconds
      const delay = 45 + Math.floor(Math.random() * 75);
      setCountdown(delay);

      timeoutRef.current = setTimeout(() => {
        setCountdown(null);
        if (runningRef.current) sendOne();
      }, delay * 1000);

    } catch (err) {
      showToast('Network error. Check your connection.', 'error');
      setIsRunning(false);
      runningRef.current = false;
      setCountdown(null);
      setStatusMsg('');
    }
  }, [campaign.id]);

  const startSending = () => {
    if (counts.selected === 0) { showToast('Select at least one prospect first.', 'error'); return; }
    runningRef.current = true;
    setIsRunning(true);
    setStatusMsg('Starting campaign...');
    sendOne();
  };
  const pauseSending = () => {
    runningRef.current = false;
    setIsRunning(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCountdown(null);
    setStatusMsg('Paused. Click Start Sending to resume.');
    updateCampaignStatusAction(campaign.id, 'PAUSED');
  };
  React.useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // ── Delete ──
  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteCampaignAction(campaign.id);
    if (res.success) { window.location.href = '/admin/outreach'; }
    else { showToast(res.message || 'Failed to delete.', 'error'); setDeleting(false); setConfirmDelete(false); }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#E4E2DC]">
            <h3 className="font-serif text-xl text-[#122C57]">Delete Campaign?</h3>
            <p className="text-sm text-[#6B7280]">This will permanently delete <strong>{campaign.name}</strong> and all {prospects.length} prospects.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 hover:bg-red-700 disabled:opacity-60 transition-colors">
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-[#F7F5F0] text-[#122C57] text-sm font-semibold py-2 border border-[#E4E2DC] hover:bg-[#E4E2DC] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E4E2DC]">
        <div className="flex items-start gap-3">
          <Link href="/admin/outreach" className="text-[#6B7280] hover:text-[#122C57] transition-colors mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-[#122C57]">{campaign.name}</h1>
            <p className="text-xs font-mono text-[#6B7280] mt-0.5">Subject: {campaign.subject}</p>
          </div>
        </div>
        <button onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" /> Delete Campaign
        </button>
      </div>

      {/* Analytics Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: counts.total, icon: Users, color: 'text-[#122C57]' },
          { label: 'Selected', value: counts.selected, icon: Check, color: 'text-purple-600' },
          { label: 'Sent', value: counts.sent, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Failed', value: counts.failed, icon: XCircle, color: 'text-red-500' },
          { label: 'Today', value: `${sentToday}/${campaign.dailyLimit}`, icon: TrendingUp, color: sentToday >= campaign.dailyLimit ? 'text-red-500' : 'text-[#C99A44]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="outline" className="p-3 bg-white space-y-0.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-[#6B7280] uppercase">{label}</p>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <p className={`font-mono text-xl font-semibold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Sending Control Panel */}
      <Card variant="outline" className="bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-semibold text-sm text-[#122C57] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C99A44]" /> Drip Sending Controls
            </h2>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Random 45–120s delay between each email. Page must stay open while sending.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button onClick={startSending} disabled={counts.selected === 0}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                <Play className="w-3.5 h-3.5" /> Start Sending ({counts.selected} selected)
              </button>
            ) : (
              <button onClick={pauseSending}
                className="inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 hover:bg-amber-600 transition-colors">
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
          </div>
        </div>

        {/* Countdown + status */}
        {(countdown !== null || statusMsg) && (
          <div className="flex items-center gap-4 pt-3 border-t border-[#E4E2DC]">
            {countdown !== null && <Countdown seconds={countdown} />}
            {statusMsg && (
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
                {isRunning && <RefreshCw className="w-3 h-3 animate-spin text-[#C99A44]" />}
                {statusMsg}
              </p>
            )}
          </div>
        )}

        {/* Daily limit progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-[#6B7280]">
            <span>Daily limit progress</span>
            <span>{sentToday} / {campaign.dailyLimit}</span>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${sentToday >= campaign.dailyLimit ? 'bg-red-500' : 'bg-[#C99A44]'}`}
              style={{ width: `${Math.min(100, (sentToday / campaign.dailyLimit) * 100)}%` }}
            />
          </div>
          {sentToday >= campaign.dailyLimit && (
            <p className="text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Daily limit reached. Sending will resume automatically tomorrow.
            </p>
          )}
        </div>
      </Card>

      {/* Prospect Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#C99A44]" /> Prospects
            <span className="font-mono text-sm text-[#6B7280] font-normal">({counts.total})</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} disabled={counts.pending === 0}
              className="text-xs text-[#122C57] hover:text-[#C99A44] font-medium transition-colors disabled:opacity-40">
              Select All Pending ({counts.pending})
            </button>
            <span className="text-[#E4E2DC]">|</span>
            <button onClick={deselectAll} disabled={counts.selected === 0}
              className="text-xs text-[#6B7280] hover:text-red-500 transition-colors disabled:opacity-40">
              Deselect All
            </button>
          </div>
        </div>

        <div className="border border-[#E4E2DC] overflow-x-auto bg-white">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC]">
              <tr>
                <th className="w-8 px-3 py-3"></th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">#</th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">Name</th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">Email</th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">Company</th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">Status</th>
                <th className="text-left px-3 py-3 font-mono text-[#6B7280] uppercase text-[10px]">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F5F0] transition-colors ${
                  p.status === 'SELECTED' ? 'bg-purple-50' : ''
                }`}>
                  <td className="px-3 py-2.5 text-center">
                    {(p.status === 'PENDING' || p.status === 'SELECTED') && (
                      <input
                        type="checkbox"
                        checked={p.status === 'SELECTED'}
                        onChange={() => toggleOne(p)}
                        className="accent-[#122C57] w-3.5 h-3.5 cursor-pointer"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#9CA3AF]">{i + 1}</td>
                  <td className="px-3 py-2.5 text-[#122C57] font-medium">{p.name}</td>
                  <td className="px-3 py-2.5 text-[#6B7280]">{p.email}</td>
                  <td className="px-3 py-2.5 text-[#6B7280]">{p.company || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${PROSPECT_BADGE[p.status] || ''}`}>
                      {PROSPECT_ICON[p.status]} {p.status}
                    </span>
                    {p.error && <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[120px]" title={p.error}>{p.error}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-[#9CA3AF] font-mono">
                    {p.sentAt ? new Date(p.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

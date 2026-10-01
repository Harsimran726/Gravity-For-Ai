import * as React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import { getOutreachAnalytics } from '@/actions/outreach-actions';
import { Card } from '@/components/ui/card';
import {
  Mail, Plus, TrendingUp, Users, CheckCircle2, XCircle,
  Clock, BarChart2, Play, Pause, Archive,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  DRAFT:     'bg-[#F3F4F6] text-[#374151]',
  ACTIVE:    'bg-emerald-100 text-emerald-800',
  PAUSED:    'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-[#E0E7FF] text-[#3730A3]',
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  DRAFT:     <Clock className="w-3 h-3" />,
  ACTIVE:    <Play className="w-3 h-3" />,
  PAUSED:    <Pause className="w-3 h-3" />,
  COMPLETED: <Archive className="w-3 h-3" />,
};

export default async function OutreachDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin');

  const { campaigns, totalSent, sentToday, totalFailed, totalProspects } = await getOutreachAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Email Outreach</h1>
          <p className="text-sm text-[#6B7280]">
            Anti-spam drip sender — personalised, rate-limited, tracked.
          </p>
        </div>
        <Link
          href="/admin/outreach/new"
          className="inline-flex items-center gap-2 bg-[#122C57] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#0A1B3D] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </Link>
      </div>

      {/* Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Prospects', value: totalProspects, icon: Users, color: 'text-[#122C57]' },
          { label: 'All-Time Sent', value: totalSent, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Sent Today', value: sentToday, icon: TrendingUp, color: 'text-[#C99A44]' },
          { label: 'Failed', value: totalFailed, icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="outline" className="p-4 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono text-[#6B7280] uppercase">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-mono text-2xl font-semibold ${color}`}>{value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#C99A44]" /> Campaigns
          <span className="font-mono text-sm text-[#6B7280] font-normal">({campaigns.length})</span>
        </h2>

        {campaigns.length === 0 ? (
          <Card variant="outline" className="p-10 bg-white text-center space-y-3">
            <Mail className="w-8 h-8 text-[#C99A44] mx-auto" />
            <p className="font-serif text-lg text-[#122C57]">No campaigns yet</p>
            <p className="text-sm text-[#6B7280]">Create your first campaign to start sending personalised outreach.</p>
            <Link
              href="/admin/outreach/new"
              className="inline-flex items-center gap-2 bg-[#122C57] text-white text-xs font-semibold px-4 py-2 hover:bg-[#0A1B3D] transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create Campaign
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const total = c.totalSent + c.totalFailed;
              const pct = total > 0 ? Math.round((c.totalSent / total) * 100) : 0;
              return (
                <Card key={c.id} variant="outline" className="bg-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans font-semibold text-sm text-[#122C57] truncate">{c.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT}`}>
                          {STATUS_ICONS[c.status]} {c.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-[#6B7280] font-mono">
                        <span>✅ {c.totalSent} sent</span>
                        {c.totalFailed > 0 && <span className="text-red-500">❌ {c.totalFailed} failed</span>}
                        <span>📊 {c.sentToday}/{c.dailyLimit} today</span>
                        <span>📅 {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="w-full sm:w-48 h-1 bg-[#F3F4F6] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/admin/outreach/${c.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#122C57] text-[#122C57] text-xs font-semibold hover:bg-[#122C57] hover:text-white transition-colors"
                    >
                      Open →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

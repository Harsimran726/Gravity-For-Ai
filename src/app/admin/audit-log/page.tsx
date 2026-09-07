import * as React from 'react';
import { Card } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Inbox } from 'lucide-react';

// Server Component - fetches real audit logs from PostgreSQL
export const dynamic = 'force-dynamic';

export default async function AdminAuditLogPage() {
  let auditLogs: Array<{
    id: string;
    timestamp: Date;
    userId: string | null;
    user: { name: string | null; email: string } | null;
    action: string;
    entityType: string;
    details: string | null;
    ipAddress: string | null;
  }> = [];

  try {
    auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      select: {
        id: true,
        timestamp: true,
        userId: true,
        user: {
          select: { name: true, email: true },
        },
        action: true,
        entityType: true,
        details: true,
        ipAddress: true,
      },
    });
  } catch (err) {
    console.error('[ADMIN AUDIT LOG] Failed to fetch audit logs from database:', err);
  }

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: 'bg-emerald-100 text-emerald-800',
    LOGOUT: 'bg-blue-100 text-blue-800',
    PUBLISH: 'bg-purple-100 text-purple-800',
    CREATE: 'bg-amber-100 text-amber-800',
    UPDATE: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
    STATUS_CHANGE: 'bg-blue-100 text-blue-800',
    LEAD_SUBMISSION: 'bg-teal-100 text-teal-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Security & Audit Trail</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Immutable log of all administrative actions, publication events, and authentication activity from PostgreSQL.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#E4E2DC] text-xs font-mono text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <Card variant="outline" className="p-12 bg-[#FFFFFF] border border-dashed border-[#E4E2DC] text-center space-y-3">
          <Inbox className="w-6 h-6 text-[#C99A44] mx-auto" />
          <p className="text-xs font-medium text-[#122C57]">No Audit Events Yet</p>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            Admin logins, lead status changes, and publish events will be logged here automatically once the database is connected and seeded.
          </p>
        </Card>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E4E2DC] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC] font-mono uppercase text-[#6B7280]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5 font-mono">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                  <td className="p-3.5 font-mono text-[#6B7280] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5 font-medium text-[#122C57]">
                    {log.user ? (log.user.name || log.user.email) : 'System'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#6B7280]">{log.entityType}</td>
                  <td className="p-3.5 text-[#0A1B3D] max-w-[280px] truncate" title={log.details ?? ''}>
                    {log.details ?? '-'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#6B7280]">
                    {log.ipAddress ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

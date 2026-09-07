'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Mail, Phone, Clock, Download, Inbox, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { updateLeadStatusAction } from '@/actions/lead-admin-actions';
import { useRouter } from 'next/navigation';

export interface LeadRecord {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';
  createdAt: string;
}

interface AdminLeadsClientProps {
  initialLeads: LeadRecord[];
}

export default function AdminLeadsClient({ initialLeads }: AdminLeadsClientProps) {
  const router = useRouter();
  const [leads, setLeads] = React.useState<LeadRecord[]>(initialLeads);
  const [selectedLead, setSelectedLead] = React.useState<LeadRecord | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: LeadRecord['status']) => {
    setUpdatingId(id);

    // Optimistic update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
    );
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Persist to database
    const result = await updateLeadStatusAction(id, newStatus);
    if (!result.success) {
      alert('Failed to update status. Please refresh and try again.');
      // Revert optimistic update
      router.refresh();
    }

    setUpdatingId(null);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Business', 'Email', 'Phone', 'Service', 'Status', 'Submitted'];
    const rows = leads.map((l) => [
      l.name, l.businessName, l.email, l.phone,
      l.serviceInterest, l.status,
      new Date(l.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravityforai-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Leads & Contact Inquiries</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Live data from PostgreSQL - all contact form submissions appear here in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] border border-[#E4E2DC] text-xs font-sans text-[#122C57] hover:bg-[#F7F5F0]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {leads.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] border border-[#E4E2DC] text-xs font-sans text-[#122C57] hover:bg-[#F7F5F0]"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {leads.length === 0 ? (
        <Card variant="outline" className="bg-[#FFFFFF] p-12 text-center space-y-4 border border-dashed border-[#E4E2DC]">
          <div className="w-12 h-12 rounded-full bg-[#F7F5F0] flex items-center justify-center mx-auto border border-[#E4E2DC]">
            <Inbox className="w-6 h-6 text-[#C99A44]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-[#122C57]">No Inbound Leads Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              When prospective clients submit an inquiry via the website contact form, their details will appear here automatically from PostgreSQL.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/contact"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#122C57] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#0A1B3D] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#C99A44]" /> Test Public Contact Form →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Leads Table */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E4E2DC] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC] font-mono uppercase text-[#6B7280]">
                <tr>
                  <th className="p-3.5">Contact / Business</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? 'bg-[#F7F5F0]' : 'hover:bg-[#F7F5F0]/50'
                    }`}
                  >
                    <td className="p-3.5">
                      <p className="font-medium text-[#122C57]">{lead.name}</p>
                      <p className="text-[11px] text-[#6B7280]">{lead.businessName}</p>
                    </td>
                    <td className="p-3.5 text-[#0A1B3D]">{lead.serviceInterest}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                          lead.status === 'NEW'
                            ? 'bg-amber-100 text-amber-800'
                            : lead.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'WON'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.status === 'LOST'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#6B7280]">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lead Detail View */}
          <div className="lg:col-span-5">
            {selectedLead ? (
              <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-4">
                  <div>
                    <h3 className="font-serif text-xl text-[#122C57]">{selectedLead.name}</h3>
                    <p className="text-xs text-[#6B7280]">{selectedLead.businessName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {updatingId === selectedLead.id && (
                      <RefreshCw className="w-3 h-3 text-[#6B7280] animate-spin" />
                    )}
                    <select
                      value={selectedLead.status}
                      onChange={(e) =>
                        handleStatusChange(selectedLead.id, e.target.value as LeadRecord['status'])
                      }
                      disabled={updatingId === selectedLead.id}
                      className="px-2.5 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono font-semibold text-[#122C57] disabled:opacity-60"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-[#0A1B3D]">
                    <Mail className="w-3.5 h-3.5 text-[#122C57]" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline break-all">
                      {selectedLead.email}
                    </a>
                  </div>

                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-[#0A1B3D]">
                      <Phone className="w-3.5 h-3.5 text-[#122C57]" />
                      <a href={`tel:${selectedLead.phone}`} className="hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Clock className="w-3.5 h-3.5 text-[#122C57]" />
                    <span>Submitted: {new Date(selectedLead.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#E4E2DC]">
                  <p className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold">
                    Client Message / Bottleneck
                  </p>
                  <p className="p-3 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] leading-relaxed">
                    {selectedLead.message}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${selectedLead.email}?subject=Re:%20Gravity%20For%20AI%20Audit%20Inquiry`}
                    className="w-full inline-block text-center py-2.5 bg-[#122C57] text-[#FFFFFF] text-xs font-sans font-medium hover:bg-[#0A1B3D]"
                  >
                    Send Follow-Up Email
                  </a>
                </div>
              </Card>
            ) : (
              <Card variant="outline" className="p-6 text-center text-xs text-[#6B7280]">
                Select a lead from the list to view full contact details.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

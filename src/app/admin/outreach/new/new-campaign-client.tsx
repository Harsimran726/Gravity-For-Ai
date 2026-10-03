'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCampaignAction } from '@/actions/outreach-actions';
import type { OutreachActionState } from '@/actions/outreach-actions';
import { parseProspectFile } from '@/lib/csv-parser';
import type { ParsedProspect } from '@/lib/csv-parser';
import { Card } from '@/components/ui/card';
import {
  Upload, FileText, X, ChevronRight, Info, ArrowLeft,
  AlertCircle, Tag, CheckCircle2, TableProperties,
} from 'lucide-react';

const initialState: OutreachActionState = {};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-[#122C57] text-white text-xs font-semibold px-6 py-3 hover:bg-[#0A1B3D] disabled:opacity-60 transition-colors"
    >
      <ChevronRight className="w-4 h-4" />
      {pending ? 'Creating Campaign...' : 'Create Campaign & Save Prospects'}
    </button>
  );
}

export function NewCampaignClient() {
  const router = useRouter();
  const [state, formAction] = useFormState(createCampaignAction, initialState);

  // Parsed data
  const [prospects, setProspects] = React.useState<ParsedProspect[]>([]);
  const [parseErrors, setParseErrors] = React.useState<string[]>([]);
  const [hasCustomSubject, setHasCustomSubject] = React.useState(false);
  const [hasCustomBody, setHasCustomBody] = React.useState(false);

  // UI state
  const [fileName, setFileName] = React.useState('');
  const [fileType, setFileType] = React.useState<'csv' | 'excel' | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);
  const [dailyLimit, setDailyLimit] = React.useState(20);

  const fileRef = React.useRef<HTMLInputElement>(null);

  // Redirect on success
  React.useEffect(() => {
    if (state.success && state.campaignId) {
      router.push(`/admin/outreach/${state.campaignId}`);
    }
  }, [state, router]);

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');
    const isCsv = name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv');
    if (!isExcel && !isCsv) {
      setParseErrors(['Unsupported file type. Please upload a .csv or .xlsx/.xls file.']);
      return;
    }

    setFileName(file.name);
    setFileType(isExcel ? 'excel' : 'csv');
    setParsing(true);
    setParseErrors([]);
    setProspects([]);

    try {
      const result = await parseProspectFile(file);
      setProspects(result.prospects);
      setParseErrors(result.errors);
      setHasCustomSubject(result.hasCustomSubject);
      setHasCustomBody(result.hasCustomBody);
    } catch (err) {
      setParseErrors([`Failed to parse file: ${String(err)}`]);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setFileName('');
    setFileType(null);
    setProspects([]);
    setParseErrors([]);
    setHasCustomSubject(false);
    setHasCustomBody(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const preview = prospects.slice(0, 5);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E4E2DC]">
        <Link href="/admin/outreach" className="text-[#6B7280] hover:text-[#122C57] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">New Outreach Campaign</h1>
          <p className="text-xs text-[#6B7280]">Upload CSV or Excel, compose your email, set daily limit.</p>
        </div>
      </div>

      {/* State messages */}
      {state.success === false && state.message && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Hidden: pre-parsed prospects as JSON so server action doesn't need to re-parse */}
        <input type="hidden" name="prospectsJson" value={JSON.stringify(prospects)} />
        <input type="hidden" name="dailyLimit" value={dailyLimit} />

        {/* Campaign Name */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-[#6B7280] uppercase">Campaign Name *</label>
          <input
            name="name"
            required
            placeholder="e.g. Property enquiries — October 2026"
            className="w-full px-3 py-2.5 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
          />
          {state.errors?.name && <p className="text-[11px] text-red-500">{state.errors.name[0]}</p>}
        </div>

        {/* Daily Limit Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#6B7280] uppercase">Daily Send Limit</label>
            <span className="font-mono text-sm font-semibold text-[#122C57]">{dailyLimit} emails/day</span>
          </div>
          <input
            type="range" min={1} max={100} step={1}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-full accent-[#122C57]"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#9CA3AF]">
            <span>1 / day</span><span>20 / day</span><span>100 campaign ceiling</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
            <Info className="w-3 h-3" /> The shared mailbox ramp is lower: 5, then 10, then 20 total messages/day. Inbox placement is not guaranteed.
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#6B7280] uppercase">Prospects File *</label>
            <span className="text-[10px] font-mono text-[#9CA3AF]">CSV · Excel (.xlsx / .xls)</span>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-[#122C57] bg-[#122C57]/5' : 'border-[#E4E2DC] hover:border-[#122C57]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt,.tsv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {parsing ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-[#122C57] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-[#6B7280]">Parsing {fileType === 'excel' ? 'Excel' : 'CSV'} file…</p>
              </div>
            ) : fileName ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-[#C99A44] mx-auto" />
                <p className="text-sm font-medium text-[#122C57]">{fileName}</p>
                <p className="text-xs text-[#6B7280]">
                  {prospects.length} valid prospect{prospects.length !== 1 ? 's' : ''} detected
                  {fileType === 'excel' && <span className="ml-1 text-emerald-600 font-medium">· Excel file</span>}
                </p>
                {(hasCustomSubject || hasCustomBody) && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Per-row {hasCustomSubject && 'subject'}{hasCustomSubject && hasCustomBody && ' + '}{hasCustomBody && 'body'} detected
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  <X className="w-3 h-3" /> Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-[#6B7280] mx-auto" />
                <p className="text-sm text-[#6B7280]">
                  Drag & drop or <span className="text-[#122C57] font-semibold underline">browse</span>
                </p>
                <p className="text-[11px] font-mono text-[#9CA3AF]">
                  Accepts: <strong>.csv</strong> · <strong>.xlsx</strong> · <strong>.xls</strong>
                </p>
              </div>
            )}
          </div>

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="space-y-1">
              {parseErrors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-[11px] text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {e}
                </p>
              ))}
              {parseErrors.length > 5 && (
                <p className="text-[11px] text-[#9CA3AF]">…and {parseErrors.length - 5} more warnings</p>
              )}
            </div>
          )}

          {/* Column format guide */}
          <Card variant="outline" className="p-3 bg-[#F7F5F0]">
            <div className="flex items-center gap-1.5 mb-2">
              <TableProperties className="w-3.5 h-3.5 text-[#C99A44]" />
              <p className="text-[11px] font-semibold text-[#122C57]">Supported Columns</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { col: 'email', desc: 'Required', required: true },
                { col: 'name', desc: 'Optional (falls back to email prefix)', required: false },
                { col: 'company', desc: 'Optional', required: false },
                { col: 'subject', desc: 'Optional — overrides campaign subject per row', required: false },
                { col: 'body', desc: 'Optional — overrides campaign body per row', required: false },
              ].map(({ col, desc, required }) => (
                <div key={col} className="flex items-start gap-1.5">
                  <code className={`text-[10px] px-1 py-0.5 rounded font-mono ${required ? 'bg-[#122C57] text-white' : 'bg-white border border-[#E4E2DC] text-[#122C57]'}`}>
                    {col}
                  </code>
                  <span className="text-[10px] text-[#6B7280]">{desc}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#F7F5F0] px-3 py-1.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#6B7280] uppercase">
                  Preview — first {preview.length} of {prospects.length} rows
                </span>
                {fileType === 'excel' && (
                  <span className="text-[10px] font-mono text-emerald-600">📊 Excel</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[400px]">
                  <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC]">
                    <tr>
                      <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Name</th>
                      <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Email</th>
                      <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Company</th>
                      {hasCustomSubject && <th className="text-left px-3 py-2 font-mono text-emerald-600">Subject ✓</th>}
                      {hasCustomBody && <th className="text-left px-3 py-2 font-mono text-emerald-600">Body ✓</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p, i) => (
                      <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                        <td className="px-3 py-2 text-[#122C57]">{p.name}</td>
                        <td className="px-3 py-2 text-[#6B7280]">{p.email}</td>
                        <td className="px-3 py-2 text-[#6B7280]">{p.company || '—'}</td>
                        {hasCustomSubject && (
                          <td className="px-3 py-2 text-emerald-700 max-w-[120px] truncate">
                            {p.customSubject || <span className="text-[#9CA3AF]">using default</span>}
                          </td>
                        )}
                        {hasCustomBody && (
                          <td className="px-3 py-2 text-emerald-700 max-w-[120px] truncate">
                            {p.customBody ? `${p.customBody.slice(0, 40)}…` : <span className="text-[#9CA3AF]">using default</span>}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border border-[#E4E2DC] p-4">
          <label className="block text-sm">Campaign type
            <select name="purpose" className="block border p-2 mt-1"><option value="CAMPAIGN">Prospect campaign</option><option value="TEST">Delivery test — trusted recipients only</option></select>
          </label>
          <label className="block text-sm">First follow-up (optional, 4 business days after first send)
            <textarea name="followup1Body" rows={4} className="block w-full border p-2 mt-1" />
          </label>
          <label className="block text-sm">Second follow-up (optional, 5 business days after first follow-up)
            <textarea name="followup2Body" rows={4} className="block w-full border p-2 mt-1" />
          </label>
          <p className="text-xs text-[#6B7280]">Upload only imports records. Approve permission and start the campaign separately. Replies stop the sequence. Plain-text messages only; emails without names use “there”.</p>
        </div>
        {/* Email Subject — shown as default, skipped per-row if column present */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#6B7280] uppercase">
              Default Subject Line {hasCustomSubject && <span className="text-emerald-600">(per-row overrides active)</span>}
            </label>
          </div>
          <input
            name="subject"
            required
            placeholder="Hi {{name}}, quick question about {{company}}"
            className="w-full px-3 py-2.5 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
          />
          {state.errors?.subject && <p className="text-[11px] text-red-500">{state.errors.subject[0]}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-[#9CA3AF] font-mono">Tokens:</span>
            {['{{name}}', '{{firstname}}', '{{company}}', '{{email}}'].map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F7F5F0] border border-[#E4E2DC] text-[10px] font-mono text-[#122C57] rounded">
                <Tag className="w-2.5 h-2.5 text-[#C99A44]" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Email Body */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#6B7280] uppercase">
            Default Email Body {hasCustomBody && <span className="text-emerald-600">(per-row overrides active)</span>}
          </label>
          <textarea
            name="body"
            required
            rows={10}
            placeholder={`Hi {{name}},\n\nI came across {{company}} and wanted to reach out...\n\n[Your message]\n\nBest,\nHarsimran Singh\nFounder, Gravity For AI`}
            className="w-full px-3 py-2.5 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0] font-mono leading-relaxed resize-y"
          />
          {state.errors?.body && <p className="text-[11px] text-red-500">{state.errors.body[0]}</p>}
          <Card variant="outline" className="p-3 bg-[#F7F5F0]">
            <p className="text-[11px] font-semibold text-[#122C57] mb-1">Sending notes</p>
            <ul className="text-[11px] text-[#6B7280] space-y-0.5 list-disc list-inside">
              <li>Use a real name with <code className="bg-white px-1 font-mono">{'{{name}}'}</code> — check the preview before sending</li>
              <li>Keep subject under 60 characters and avoid CAPS</li>
              <li>Use clear claims and only email recipients permitted by your provider policy</li>
              <li>The server enforces mailbox caps and at least two minutes between attempts</li>
              <li>Add a <strong>subject</strong> or <strong>body</strong> column in Excel/CSV for fully custom per-row emails</li>
            </ul>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <SubmitBtn />
          <Link href="/admin/outreach" className="text-xs text-[#6B7280] hover:text-[#122C57] transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

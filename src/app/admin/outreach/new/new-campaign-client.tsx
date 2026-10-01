'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCampaignAction } from '@/actions/outreach-actions';
import type { OutreachActionState } from '@/actions/outreach-actions';
import { parseCSV } from '@/lib/csv-parser';
import type { ParsedProspect } from '@/lib/csv-parser';
import { Card } from '@/components/ui/card';
import {
  Upload, FileText, X, ChevronRight, Info, ArrowLeft,
  CheckCircle2, AlertCircle, Tag,
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
  const [csvData, setCsvData] = React.useState('');
  const [preview, setPreview] = React.useState<ParsedProspect[]>([]);
  const [parseErrors, setParseErrors] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const [dailyLimit, setDailyLimit] = React.useState(100);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Redirect on success
  React.useEffect(() => {
    if (state.success && state.campaignId) {
      router.push(`/admin/outreach/${state.campaignId}`);
    }
  }, [state, router]);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Please upload a .csv file.']);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      setCsvData(text);
      const { prospects, errors } = parseCSV(text);
      setPreview(prospects.slice(0, 5));
      setParseErrors(errors.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E4E2DC]">
        <Link href="/admin/outreach" className="text-[#6B7280] hover:text-[#122C57] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">New Outreach Campaign</h1>
          <p className="text-xs text-[#6B7280]">Upload a CSV, compose your email, set daily limit.</p>
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
        {/* Hidden CSV field */}
        <input type="hidden" name="csvData" value={csvData} />
        <input type="hidden" name="dailyLimit" value={dailyLimit} />

        {/* Campaign Name */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-[#6B7280] uppercase">Campaign Name *</label>
          <input
            name="name"
            required
            placeholder="e.g. Punjab Clinics Outreach — Oct 2026"
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
            type="range" min={10} max={300} step={10}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-full accent-[#122C57]"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#9CA3AF]">
            <span>10 (Safe)</span><span>100 (Recommended)</span><span>300 (Aggressive)</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
            <Info className="w-3 h-3" /> Keep at 50–150/day with Resend. Higher risk of spam folder above 200.
          </p>
        </div>

        {/* CSV Upload */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-[#6B7280] uppercase">Prospects CSV *</label>
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
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {fileName ? (
              <div className="space-y-1">
                <FileText className="w-8 h-8 text-[#C99A44] mx-auto" />
                <p className="text-sm font-medium text-[#122C57]">{fileName}</p>
                <p className="text-xs text-[#6B7280]">{preview.length > 0 ? `${preview.length}+ valid rows detected` : 'Parsing...'}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCsvData(''); setFileName(''); setPreview([]); setParseErrors([]); }}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-2"
                >
                  <X className="w-3 h-3" /> Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-[#6B7280] mx-auto" />
                <p className="text-sm text-[#6B7280]">Drag & drop your CSV or <span className="text-[#122C57] font-semibold underline">browse</span></p>
                <p className="text-[11px] font-mono text-[#9CA3AF]">Required columns: email · Optional: name, company</p>
              </div>
            )}
          </div>

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="space-y-1">
              {parseErrors.map((e, i) => (
                <p key={i} className="text-[11px] text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {e}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="border border-[#E4E2DC] overflow-hidden">
              <div className="bg-[#F7F5F0] px-3 py-1.5 text-[10px] font-mono text-[#6B7280] uppercase">
                Preview (first 5 rows)
              </div>
              <table className="w-full text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC]">
                  <tr>
                    <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Name</th>
                    <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Email</th>
                    <th className="text-left px-3 py-2 font-mono text-[#6B7280]">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => (
                    <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-3 py-2 text-[#122C57]">{p.name}</td>
                      <td className="px-3 py-2 text-[#6B7280]">{p.email}</td>
                      <td className="px-3 py-2 text-[#6B7280]">{p.company || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Email Subject */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#6B7280] uppercase">Email Subject *</label>
          <input
            name="subject"
            required
            placeholder="Hi {{name}}, quick question about {{company}}"
            className="w-full px-3 py-2.5 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
          />
          {state.errors?.subject && <p className="text-[11px] text-red-500">{state.errors.subject[0]}</p>}
          {/* Token chips */}
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
          <label className="text-xs font-mono text-[#6B7280] uppercase">Email Body (HTML supported) *</label>
          <textarea
            name="body"
            required
            rows={10}
            placeholder={`Hi {{name}},\n\nI came across {{company}} and wanted to share how Gravity For AI has helped similar businesses automate their operations...\n\n[Your message here]\n\nBest regards,\nHarsimran Singh\nFounder, Gravity For AI\ncontact@gravityforai.com`}
            className="w-full px-3 py-2.5 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0] font-mono leading-relaxed resize-y"
          />
          {state.errors?.body && <p className="text-[11px] text-red-500">{state.errors.body[0]}</p>}
          <Card variant="outline" className="p-3 bg-[#F7F5F0] space-y-1">
            <p className="text-[11px] font-semibold text-[#122C57]">💡 Anti-Spam Tips</p>
            <ul className="text-[11px] text-[#6B7280] space-y-0.5 list-disc list-inside">
              <li>Personalise with <code className="font-mono bg-white px-1">{'{{name}}'}</code> and <code className="font-mono bg-white px-1">{'{{company}}'}</code> — generic blasts get flagged</li>
              <li>Keep subject line under 60 characters</li>
              <li>Avoid spam words: FREE, URGENT, GUARANTEED, CLICK HERE</li>
              <li>Include a plain-text reason why you're emailing them</li>
              <li>Each email is sent with a 45–120s random delay (set on send page)</li>
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

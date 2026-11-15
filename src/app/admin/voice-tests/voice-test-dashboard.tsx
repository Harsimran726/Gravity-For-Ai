'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, FlaskConical, RefreshCw, AudioLines, FileText } from 'lucide-react';
import { callCsv, measuredMean, mergeCalls, type CallPage, type EvidencePage, type UsagePage, type VoiceProvider, type VoiceTestCall, type VoiceTestConfiguration } from '@/lib/voice-test-model';

type Range = { start: string; end: string };
type Snapshot = { items: VoiceTestCall[]; loaded: boolean; hasMore: boolean };
const emptySnapshot: Snapshot = { items: [], loaded: false, hasMore: false };
const providers: VoiceProvider[] = ['rasen', 'sarvam'];
const names = { rasen: 'Rasen', sarvam: 'Sarvam' };
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C99A44]';
const button = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#122C57] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50';
const dateInIndia = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const stamp = (value: string | null) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Not supplied';
const measurement = (n: number | null, unit: string) => n === null ? 'Not available' : n.toLocaleString('en-IN', { maximumFractionDigits: 1 }) + ' ' + unit;

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function request<T>(params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/admin/voice-tests?' + new URLSearchParams(params), { cache: 'no-store', signal });
  const data = await response.json();
  if (!response.ok) throw new Error((data.error || 'Unable to load results.') + (data.retryAfter ? ` Retry in ${data.retryAfter} seconds.` : ''));
  return data as T;
}

export function VoiceTestDashboard({ configuration }: { configuration: VoiceTestConfiguration }) {
  const [start, setStart] = useState(() => dateInIndia(new Date(Date.now() - 6 * 86400000)));
  const [end, setEnd] = useState(() => dateInIndia(new Date()));
  const [range, setRange] = useState<Range | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [snapshots, setSnapshots] = useState<Record<VoiceProvider, Snapshot>>({ rasen: emptySnapshot, sarvam: emptySnapshot });
  const publish = useCallback((provider: VoiceProvider, snapshot: Snapshot) => setSnapshots(previous => ({ ...previous, [provider]: snapshot })), []);
  const allCalls = providers.flatMap(p => snapshots[p].items);

  function load(event: FormEvent) {
    event.preventDefault();
    const from = Date.parse(start + 'T00:00:00+05:30');
    const to = Date.parse(end + 'T00:00:00+05:30') + 86400000;
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from || to - from > 93 * 86400000) { setError('Select 1–93 calendar days.'); return; }
    setError(''); setSnapshots({ rasen: emptySnapshot, sarvam: emptySnapshot });
    setRange({ start: new Date(from).toISOString(), end: new Date(to).toISOString() });
    setRevision(n => n + 1);
  }

  return <div className="max-w-7xl space-y-6 pb-12 text-[#122C57]">
    <header className="rounded-2xl bg-[#122C57] p-6 text-white md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#E5B554]">Gravity · Voice lab</p><h1 className="font-serif text-3xl md:text-4xl">Put the conversation to the test.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Review Rasen and Sarvam evidence side by side. Compare the same scenario, language and agent instructions before making a decision.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs"><FlaskConical size={15}/>Testing only</span></div>
      <div className="mt-6 flex flex-wrap gap-5 border-t border-white/15 pt-4 text-xs text-slate-200"><span>Read-only analytics</span><span>Dates and times · IST</span><Link className="underline" href="/admin/callbacks">Open existing callback inbox</Link></div>
    </header>

    {!configuration.enabled && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">Testing is disabled. Set VOICE_TEST_ANALYTICS_ENABLED=true on the server to read provider data.</p>}
    <form onSubmit={load} className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <label className="text-xs font-medium">From · IST<input className={field} type="date" required value={start} onChange={e => setStart(e.target.value)}/></label>
      <label className="text-xs font-medium">Through · IST<input className={field} type="date" required value={end} onChange={e => setEnd(e.target.value)}/></label>
      <button disabled={!configuration.enabled} className={button}><RefreshCw size={15}/>Load test results</button>
      <button type="button" disabled={!allCalls.length} className={button} onClick={() => download('voice-test-loaded-results.csv', callCsv(allCalls), 'text/csv;charset=utf-8')}><ArrowDownToLine size={15}/>Export loaded rows</button>
      <p className="w-full text-xs text-slate-500">Up to 93 days. Refresh manually after test calls; Sarvam results may be cached by its API for 60 seconds. This page does not place calls or change website callbacks.</p>
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
    </form>

    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="p-5"><h2 className="font-semibold">Evidence at a glance</h2><p className="mt-1 text-xs leading-5 text-slate-500">Loaded rows only. Rasen includes call lifecycle records; Sarvam interactions are conversations that took place. These are different populations, so no cross-provider connection rate or automatic winner is calculated.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><caption className="sr-only">Provider metrics and availability</caption><thead className="bg-slate-50"><tr><th scope="col" className="px-5 py-3">Measurement</th><th scope="col" className="px-5 py-3">Rasen</th><th scope="col" className="px-5 py-3">Sarvam</th></tr></thead><tbody className="divide-y divide-slate-100">
        <tr><th scope="row" className="px-5 py-3 font-medium">Records loaded</th>{providers.map(p => <td key={p} className="px-5 py-3 tabular-nums">{snapshots[p].loaded ? `${snapshots[p].items.length}${snapshots[p].hasMore ? ' · more pages available' : ''}` : 'Not loaded'}</td>)}</tr>
        <tr><th scope="row" className="px-5 py-3 font-medium">Mean agent response time</th><td className="px-5 py-3">Not exposed by integrated endpoints</td><td className="px-5 py-3">{measurement(measuredMean(snapshots.sarvam.items.map(c => c.responseMs)).value, 'ms')}<span className="mt-1 block text-xs text-slate-500">Mean of per-call means · n={measuredMean(snapshots.sarvam.items.map(c => c.responseMs)).count}</span></td></tr>
        <tr><th scope="row" className="px-5 py-3 font-medium">Mean conversation duration</th><td className="px-5 py-3">Not exposed by call list</td><td className="px-5 py-3">{measurement(measuredMean(snapshots.sarvam.items.map(c => c.durationSeconds)).value, 's')}</td></tr>
        <tr><th scope="row" className="px-5 py-3 font-medium">Voice quality / STT accuracy</th><td className="px-5 py-3" colSpan={2}>Use the paired human review below; no API score is assumed.</td></tr>
        <tr><th scope="row" className="px-5 py-3 font-medium">Cost / ROI</th><td className="px-5 py-3" colSpan={2}>Not available here. Rasen usage quantities are not billing amounts.</td></tr>
      </tbody></table></div>
    </section>

    <div className="grid min-w-0 gap-5 xl:grid-cols-2">{providers.map(provider => <ProviderPanel key={`${provider}-${revision}`} provider={provider} range={range} missing={provider === 'rasen' ? configuration.rasenMissing : configuration.sarvamMissing} enabled={configuration.enabled} publish={publish}/>)}</div>
    {range && !configuration.rasenMissing.length && configuration.enabled && <UsagePanel key={`usage-${revision}`} range={range}/>}
    <PairedReview calls={allCalls}/>
    <details className="rounded-xl border border-slate-200 bg-white p-5 text-sm"><summary className="cursor-pointer font-semibold">How to run a fair comparison</summary><ol className="mt-4 list-decimal space-y-2 pl-5 leading-6 text-slate-600"><li>Use dedicated test agents with the same knowledge base, prompt, language, scenario and phone/network conditions.</li><li>Run the calls from each provider console using your test numbers, then load this page.</li><li>Review the transcripts here and listen to the recordings in the provider consoles. Compare matched calls rather than unrelated customer populations.</li><li>Record human ratings and observed issues below. Export the review before leaving the page.</li></ol><p className="mt-4 text-xs text-slate-500">No generated example calls or placeholder performance numbers are mixed into these results. A pending result is not a failed call. Rasen lifecycle completion is not proof of a successful business outcome.</p></details>
  </div>;
}

function ProviderPanel({ provider, range, missing, enabled, publish }: { provider: VoiceProvider; range: Range | null; missing: string[]; enabled: boolean; publish: (p: VoiceProvider, s: Snapshot) => void }) {
  const [page, setPage] = useState<CallPage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<{ id: string; kind: 'transcript' | 'summary' } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const canLoad = enabled && !missing.length && !!range;

  const load = useCallback(async (previous: CallPage | null) => {
    if (!range) return;
    abort.current?.abort();
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError('');
    try {
      const query: Record<string, string> = { provider, ...range };
      if (previous?.nextCursor) query.cursor = previous.nextCursor;
      if (previous?.nextOffset != null) query.offset = String(previous.nextOffset);
      const next = await request<CallPage>(query, controller.signal);
      if (controller.signal.aborted) return;
      if (previous?.nextCursor && next.nextCursor === previous.nextCursor) throw new Error('The provider repeated a cursor. Reload this range.');
      const merged = { ...next, items: mergeCalls(previous?.items || [], next.items) };
      setPage(merged); publish(provider, { items: merged.items, loaded: true, hasMore: !!next.nextCursor || next.nextOffset !== null });
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load calls.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [range, provider, publish]);

  useEffect(() => { if (canLoad) void load(null); return () => abort.current?.abort(); }, [canLoad, load]);
  const hasMore = !!page?.nextCursor || page?.nextOffset != null;
  return <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><AudioLines size={19}/>{names[provider]}</h2><p className="mt-1 text-xs text-slate-500">{provider === 'rasen' ? 'Configured test agent · call lifecycle records' : 'Configured test app · conversation records'}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{busy ? 'Loading…' : page ? `${page.items.length} loaded` : 'Awaiting data'}</span></div>
    {missing.length > 0 && <p role="status" className="mt-4 break-words rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-900">Server setup needed: {missing.join(', ')}</p>}
    {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"><p>{error}</p><button disabled={busy} className="mt-2 underline" onClick={() => void load(page)}>Retry this page</button></div>}
    {!page && !busy && !error && !missing.length && <p className="py-10 text-center text-sm text-slate-500">Choose a date range and load test results.</p>}
    {page && <><p className="my-4 text-xs text-slate-500">Read {stamp(page.fetchedAt)} IST{page.total !== null ? ` · ${page.total} interactions reported in range` : ''}</p>{!page.items.length && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">No records for this test agent in the selected range.</p>}<div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">{page.items.map(call => <article key={call.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{call.state}</span><span className="text-xs text-slate-500">{call.direction || 'Direction not supplied'}</span></div><p className="mt-3 break-all font-mono text-xs">{call.id}</p><p className="mt-1 text-xs text-slate-500">{stamp(call.createdAt)} IST</p><dl className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-500">Version</dt><dd className="mt-1 break-all">{call.version || 'Not supplied'}</dd></div><div><dt className="text-slate-500">End / dial reason</dt><dd className="mt-1 break-words">{call.endReason || 'Not supplied'}</dd></div>{provider === 'rasen' ? <><div><dt className="text-slate-500">Transcript</dt><dd>{call.transcriptState || 'Unknown'}</dd></div><div><dt className="text-slate-500">Summary</dt><dd>{call.summaryState || 'Unknown'}</dd></div></> : <><div><dt className="text-slate-500">Duration</dt><dd>{measurement(call.durationSeconds, 's')}</dd></div><div><dt className="text-slate-500">Mean response</dt><dd>{measurement(call.responseMs, 'ms')}</dd></div><div><dt className="text-slate-500">Language</dt><dd>{call.language || 'Not supplied'}</dd></div></>}</dl><div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold"><button className="inline-flex items-center gap-1 underline" onClick={() => setSelected({ id: call.id, kind: 'transcript' })}><FileText size={13}/>Read transcript</button>{provider === 'rasen' && <button className="underline" onClick={() => setSelected({ id: call.id, kind: 'summary' })}>Read summary</button>}</div></article>)}</div>{hasMore && <button className={button + ' mt-4 w-full'} disabled={busy || page.items.length >= 2000} onClick={() => void load(page)}>{page.items.length >= 2000 ? '2,000-row limit · narrow the date range' : busy ? 'Loading…' : 'Load next 50 records'}</button>}</>}
    {selected && <Evidence key={`${selected.id}-${selected.kind}`} provider={provider} selection={selected} close={() => setSelected(null)}/>}
  </section>;
}

function Evidence({ provider, selection, close }: { provider: VoiceProvider; selection: { id: string; kind: 'transcript' | 'summary' }; close: () => void }) {
  const [data, setData] = useState<EvidencePage | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const load = useCallback(async (previous: EvidencePage | null) => {
    abort.current?.abort(); const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError('');
    try {
      const next = await request<EvidencePage>({ provider, resource: selection.kind, id: selection.id, ...(previous?.nextCursor ? { cursor: previous.nextCursor } : {}) }, controller.signal);
      if (controller.signal.aborted) return;
      if (previous && previous.resultId !== next.resultId) throw new Error('The transcript layer changed. Close and reopen this evidence.');
      if (previous?.nextCursor && next.nextCursor === previous.nextCursor) throw new Error('Repeated transcript cursor. Close and reopen this evidence.');
      setData({ ...next, turns: Array.from(new Map([...(previous?.turns || []), ...next.turns].map(t => [t.index, t])).values()) });
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to read evidence.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [provider, selection.id, selection.kind]);
  useEffect(() => { void load(null); return () => abort.current?.abort(); }, [load]);
  return <div className="mt-5 rounded-xl border border-[#C99A44] bg-[#FCFAF5] p-4" aria-live="polite"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{selection.kind === 'summary' ? 'Provider summary' : 'Conversation transcript'}</h3><button className="text-xs underline" onClick={close}>Close</button></div><p className="mt-2 break-all text-xs text-slate-500">{selection.id}</p>{busy && <p className="mt-3 text-sm">Reading evidence…</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{data && <><p className="my-3 text-xs">Provider state: <strong>{data.state}</strong>{data.pollAfterSeconds ? ` · provider suggests checking after ${data.pollAfterSeconds}s` : ''}</p>{data.summary !== null && <p className="whitespace-pre-wrap text-sm leading-6">{data.summary}</p>}<div className="max-h-80 space-y-3 overflow-y-auto">{data.turns.map(turn => <div key={turn.index} className="rounded-lg bg-white p-3"><p className="mb-1 text-xs font-semibold capitalize">{turn.speaker} · turn {turn.index}</p><p className="whitespace-pre-wrap break-words text-sm leading-6">{turn.text}</p></div>)}</div>{!data.turns.length && data.summary === null && <p className="text-sm text-slate-500">No text available in this response. Empty or pending evidence is not a quality score.</p>}</>}<button disabled={busy || !!data?.nextCursor && data.turns.length >= 5000} className={button + ' mt-4'} onClick={() => void load(data?.nextCursor ? data : null)}>{data?.nextCursor ? 'Load next transcript page' : 'Refresh evidence'}</button><p className="mt-3 text-xs text-slate-500">Provider-generated text. Verify against the call recording before judging accuracy.</p></div>;
}

function UsagePanel({ range }: { range: Range }) {
  const [data, setData] = useState<UsagePage | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  const load = useCallback(async (previous: UsagePage | null) => {
    abort.current?.abort(); const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError('');
    try {
      const next = await request<UsagePage>({ provider: 'rasen', resource: 'usage', ...range, ...(previous?.nextCursor ? { cursor: previous.nextCursor } : {}) }, controller.signal);
      if (controller.signal.aborted) return;
      if (previous?.nextCursor && next.nextCursor === previous.nextCursor) throw new Error('Repeated usage cursor. Reload the date range.');
      setData({ ...next, items: [...(previous?.items || []), ...next.items] });
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to read usage.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [range]);
  useEffect(() => { void load(null); return () => abort.current?.abort(); }, [load]);
  return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Rasen metered usage</h2><p className="mt-1 text-xs leading-5 text-slate-500">Same date range and configured test agent. Units remain separate; quantities are not costs, call duration or latency. {data && `Provider state: ${data.state}.`}</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{busy && <p className="mt-3 text-sm">Loading usage…</p>}{data && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Component', 'Unit', 'Quantity', 'Events'].map(h => <th scope="col" key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{data.items.map((r, i) => <tr key={i} className="border-t"><td className="p-2">{r.component}</td><td className="p-2">{r.unit}</td><td className="p-2 tabular-nums">{r.quantity.toLocaleString('en-IN')}</td><td className="p-2">{r.events}</td></tr>)}</tbody></table>{!data.items.length && <p className="py-4 text-sm text-slate-500">No usage rows returned. Unmeasured usage is not zero usage.</p>}</div>}{(data?.nextCursor || error) && <button className={button + ' mt-3'} disabled={busy || (data?.items.length || 0) >= 2000} onClick={() => void load(data?.nextCursor ? data : null)}>Load usage page</button>}</section>;
}

type Review = { scenario: string; language: string; rasenCall: string; sarvamCall: string; rasenNaturalness: number; sarvamNaturalness: number; rasenUnderstanding: number; sarvamUnderstanding: number; notes: string; reviewedAt: string };
function PairedReview({ calls }: { calls: VoiceTestCall[] }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
    const text = (key: string) => String(values.get(key) || '').trim();
    if (!calls.some(c => c.provider === 'rasen' && c.id === text('rasenCall')) || !calls.some(c => c.provider === 'sarvam' && c.id === text('sarvamCall'))) return;
    setReviews(previous => [...previous, { scenario: text('scenario'), language: text('language'), rasenCall: text('rasenCall'), sarvamCall: text('sarvamCall'), rasenNaturalness: Number(text('rasenNaturalness')), sarvamNaturalness: Number(text('sarvamNaturalness')), rasenUnderstanding: Number(text('rasenUnderstanding')), sarvamUnderstanding: Number(text('sarvamUnderstanding')), notes: text('notes'), reviewedAt: new Date().toISOString() }]);
    form.reset();
  }
  return <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Paired listening review</h2><p className="mt-1 text-xs leading-5 text-slate-500">Human ratings · 1 = poor, 5 = excellent. Listen in the provider consoles first. Notes stay in this page session only; export before leaving.</p></div><button className={button} disabled={!reviews.length} onClick={() => download('voice-test-human-reviews.json', JSON.stringify({ ratingSource: 'human_review', reviews }, null, 2), 'application/json')}>Export {reviews.length} reviews</button></div>
    <form onSubmit={add} className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-medium">Matched scenario<input name="scenario" maxLength={200} required className={field} placeholder="e.g. Punjabi website enquiry"/></label><label className="text-xs font-medium">Language<select name="language" required className={field}><option value="">Select language</option>{['English', 'Hindi', 'Punjabi', 'Mixed / switching'].map(l => <option key={l}>{l}</option>)}</select></label>{providers.map(p => <div key={p} className="space-y-3 rounded-lg bg-slate-50 p-4"><label className="block text-xs font-medium">{names[p]} call<select name={`${p}Call`} required className={field}><option value="">Select a loaded call</option>{calls.filter(c => c.provider === p).map(c => <option key={c.id} value={c.id}>{c.id}</option>)}</select></label>{['Naturalness', 'Understanding'].map(metric => <label key={metric} className="block text-xs font-medium">{metric}<select name={`${p}${metric}`} required className={field}><option value="">Not rated</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>)}</div>)}<label className="text-xs font-medium md:col-span-2">Evidence and issues<textarea name="notes" maxLength={4000} required rows={3} className={field} placeholder="What did each agent understand or miss? Note interruptions, language switching, incorrect claims and whether the task was completed."/></label><div className="md:col-span-2"><button className={button} disabled={!providers.every(p => calls.some(c => c.provider === p))}>Add paired review</button><span role="status" className="ml-3 text-xs text-slate-500">{reviews.length} reviews in this session</span></div></form>
  </section>;
}

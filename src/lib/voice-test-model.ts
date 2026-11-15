export type VoiceProvider = 'rasen' | 'sarvam';
export type VoiceTestCall = {
  id: string;
  provider: VoiceProvider;
  state: string;
  direction: string | null;
  createdAt: string | null;
  version: string | null;
  endReason: string | null;
  transcriptState: string | null;
  summaryState: string | null;
  durationSeconds: number | null;
  responseMs: number | null;
  language: string | null;
};
export type CallPage = {
  items: VoiceTestCall[];
  nextCursor: string | null;
  nextOffset: number | null;
  total: number | null;
  fetchedAt: string;
};
export type UsageRow = { component: string; unit: string; quantity: number; events: number };
export type UsagePage = { state: string; items: UsageRow[]; nextCursor: string | null };
export type EvidencePage = {
  state: string;
  turns: { index: number; speaker: string; text: string }[];
  summary: string | null;
  nextCursor: string | null;
  resultId: string | null;
  pollAfterSeconds: number | null;
};
export type VoiceTestConfiguration = {
  enabled: boolean;
  rasenMissing: string[];
  sarvamMissing: string[];
};

// Missing measurements are excluded, never silently interpreted as zero.
export function measuredMean(values: (number | null)[]) {
  const measured = values.filter((n): n is number => n !== null && Number.isFinite(n) && n >= 0);
  return { value: measured.length ? measured.reduce((a, b) => a + b, 0) / measured.length : null, count: measured.length };
}

export function mergeCalls(previous: VoiceTestCall[], incoming: VoiceTestCall[]) {
  return Array.from(new Map([...previous, ...incoming].map(call => [call.id, call])).values());
}

export function callCsv(calls: VoiceTestCall[]) {
  const cell = (value: unknown) => {
    const text = value == null ? '' : String(value);
    const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const headers = ['provider', 'call_id', 'state', 'direction', 'created_at', 'version', 'language', 'duration_seconds', 'provider_mean_response_ms', 'transcript_state', 'summary_state', 'end_reason'];
  return [headers, ...calls.map(c => [c.provider, c.id, c.state, c.direction, c.createdAt, c.version, c.language, c.durationSeconds, c.responseMs, c.transcriptState, c.summaryState, c.endReason])].map(row => row.map(cell).join(',')).join('\r\n');
}

import { z } from 'zod';
import type { CallPage, EvidencePage, UsagePage, VoiceProvider, VoiceTestConfiguration } from './voice-test-model';

type Environment = Record<string, string | undefined>;
type Fetcher = typeof fetch;
export class VoiceTestError extends Error {
  constructor(message: string, public status = 502, public retryAfter: number | null = null) { super(message); }
}
const optionalText = z.string().nullable().optional();
const optionalNumber = z.number().finite().nonnegative().nullable().optional();
const cursorSchema = z.string().max(2048).nullable();
const rasenCall = z.object({
  id: z.string().min(1).max(128), agent_id: z.string(), state: z.string(),
  direction: optionalText, created_at: optionalText, published_version_id: optionalText,
  end_reason: optionalText, dial_outcome: optionalText, transcript_state: optionalText, summary_state: optionalText,
});
const sarvamCall = z.object({
  interaction_id: z.string().min(1).max(300), start_datetime: optionalText,
  app_version: z.union([z.string(), z.number()]).nullable().optional(),
  channel_direction: optionalText, failure_reason: optionalText, ended_by: optionalText,
  duration_in_seconds: optionalNumber, average_agent_response_time_in_seconds: optionalNumber,
  language_name: optionalText,
});

export function voiceTestConfiguration(env: Environment = process.env): VoiceTestConfiguration {
  const missing = (names: string[]) => names.filter(name => !env[name]?.trim());
  return {
    enabled: env.VOICE_TEST_ANALYTICS_ENABLED === 'true',
    rasenMissing: missing(['RASEN_API_KEY', 'RASEN_TEST_AGENT_ID']),
    sarvamMissing: missing(['SARVAM_API_KEY', 'SARVAM_ANALYTICS_ORG_ID', 'SARVAM_ANALYTICS_WORKSPACE_ID', 'SARVAM_TEST_APP_ID']),
  };
}

export function validateRange(start: string | null, end: string | null) {
  const datetime = z.string().datetime({ offset: true });
  if (!datetime.safeParse(start).success || !datetime.safeParse(end).success) throw new VoiceTestError('Use ISO dates with a time zone.', 400);
  const from = Date.parse(start!), to = Date.parse(end!);
  if (to <= from || to - from > 93 * 86400000) throw new VoiceTestError('Select a range between 1 millisecond and 93 days.', 400);
  return { start: new Date(from).toISOString(), end: new Date(to).toISOString() };
}

function configured(provider: VoiceProvider, env: Environment) {
  const config = voiceTestConfiguration(env);
  if (!config.enabled) throw new VoiceTestError('Enable VOICE_TEST_ANALYTICS_ENABLED on the server to use this testing page.', 503);
  const missing = provider === 'rasen' ? config.rasenMissing : config.sarvamMissing;
  if (missing.length) throw new VoiceTestError('Configure ' + missing.join(', ') + ' on the server.', 503);
}

function rasenBase(env: Environment) {
  const base = (env.RASEN_API_BASE || 'https://api.rasen.ai/v1').replace(/\/$/, '');
  if (!['https://api.rasen.ai/v1', 'https://api.v2.rasen.ai/v1'].includes(base)) throw new VoiceTestError('RASEN_API_BASE must be an official Rasen HTTPS /v1 endpoint.', 503);
  return base;
}
function sarvamBase(env: Environment) {
  const parts = ['SARVAM_ANALYTICS_ORG_ID', 'SARVAM_ANALYTICS_WORKSPACE_ID', 'SARVAM_TEST_APP_ID'].map(name => {
    const value = env[name]!;
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(value)) throw new VoiceTestError('Invalid ' + name + ' configuration.', 503);
    return encodeURIComponent(value);
  });
  return 'https://apps.sarvam.ai/api/analytics/v1/' + parts.join('/');
}

async function readJson(url: string, provider: VoiceProvider, env: Environment, fetcher: Fetcher) {
  const headers: Record<string, string> = provider === 'rasen'
    ? { Authorization: 'Bearer ' + env.RASEN_API_KEY, Accept: 'application/json' }
    : { 'X-API-Key': env.SARVAM_API_KEY!, Accept: 'application/json' };
  try {
    const response = await fetcher(url, { method: 'GET', headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      const rawRetry = response.headers.get('Retry-After');
      const seconds = rawRetry ? Number(rawRetry) : NaN;
      const retry = Number.isFinite(seconds) ? Math.min(3600, Math.max(1, Math.ceil(seconds))) : response.status === 429 ? 60 : null;
      const help = response.status === 401 || response.status === 403 ? ' Check the server API key and workspace access.' : response.status === 429 ? ' Wait before retrying.' : '';
      throw new VoiceTestError(`${provider === 'rasen' ? 'Rasen' : 'Sarvam'} returned HTTP ${response.status}.${help}`, response.status === 429 ? 429 : 502, retry);
    }
    // Bound bytes even if Content-Length is absent. Never log provider bodies or keys.
    const reader = response.body?.getReader();
    if (!reader) throw new VoiceTestError('The provider returned an empty response.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024) { await reader.cancel(); throw new VoiceTestError('The provider response exceeded the 2 MB limit. Narrow the date range.'); }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    return JSON.parse(body.toString('utf8')) as unknown;
  } catch (error) {
    if (error instanceof VoiceTestError) throw error;
    throw new VoiceTestError('The provider could not be read. Check connectivity and configuration, then retry.');
  }
}

function decode<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new VoiceTestError('The provider response did not match its documented format. No metrics were inferred.');
  return parsed.data;
}

export async function readCallPage(provider: VoiceProvider, input: { start: string; end: string; cursor?: string; offset?: number }, env: Environment = process.env, fetcher: Fetcher = fetch): Promise<CallPage> {
  configured(provider, env);
  const range = validateRange(input.start, input.end);
  if (input.cursor && input.cursor.length > 2048) throw new VoiceTestError('Invalid cursor.', 400);
  if (input.offset !== undefined && (!Number.isInteger(input.offset) || input.offset < 0 || input.offset > 100000)) throw new VoiceTestError('Invalid offset.', 400);
  if (provider === 'rasen') {
    const query = new URLSearchParams({ ...range, agent_id: env.RASEN_TEST_AGENT_ID!, limit: '50' });
    if (input.cursor) query.set('cursor', input.cursor);
    const page = decode(z.object({ items: z.array(rasenCall).max(200), next_cursor: cursorSchema }), await readJson(rasenBase(env) + '/calls?' + query, provider, env, fetcher));
    if (page.items.some(item => item.agent_id !== env.RASEN_TEST_AGENT_ID)) throw new VoiceTestError('Rasen returned a call outside the configured test agent.');
    return {
      items: page.items.map(c => ({ id: c.id, provider, state: c.state, direction: c.direction ?? null, createdAt: c.created_at ?? null, version: c.published_version_id ?? null, endReason: c.dial_outcome || c.end_reason || null, transcriptState: c.transcript_state ?? null, summaryState: c.summary_state ?? null, durationSeconds: null, responseMs: null, language: null })),
      nextCursor: page.next_cursor, nextOffset: null, total: null, fetchedAt: new Date().toISOString(),
    };
  }
  const offset = input.offset ?? 0;
  // Sarvam end is inclusive; convert our exclusive end to the last included millisecond.
  const query = new URLSearchParams({ start_datetime: range.start, end_datetime: new Date(Date.parse(range.end) - 1).toISOString(), limit: '50', offset: String(offset), sort_order: 'desc' });
  const page = decode(z.object({ items: z.array(sarvamCall).max(1000), total: z.number().int().nonnegative(), next_page_uri: z.string() }), await readJson(sarvamBase(env) + '/interactions?' + query, provider, env, fetcher));
  if (page.next_page_uri && !page.items.length) throw new VoiceTestError('Sarvam returned an empty page with a continuation. Reload the range.');
  return {
    items: page.items.map(c => ({ id: c.interaction_id, provider, state: c.failure_reason && c.failure_reason !== 'NO_FAILURE_REASON' ? c.failure_reason : 'interaction', direction: c.channel_direction ?? null, createdAt: c.start_datetime ? (/([zZ]|[+-]\d\d:\d\d)$/.test(c.start_datetime) ? c.start_datetime : c.start_datetime + 'Z') : null, version: c.app_version == null ? null : String(c.app_version), endReason: c.ended_by ?? null, transcriptState: null, summaryState: null, durationSeconds: c.duration_in_seconds ?? null, responseMs: c.average_agent_response_time_in_seconds == null ? null : c.average_agent_response_time_in_seconds * 1000, language: c.language_name ?? null })),
    nextCursor: null, nextOffset: page.next_page_uri ? offset + page.items.length : null, total: page.total, fetchedAt: new Date().toISOString(),
  };
}

export async function readUsage(input: { start: string; end: string; cursor?: string }, env: Environment = process.env, fetcher: Fetcher = fetch): Promise<UsagePage> {
  configured('rasen', env);
  const range = validateRange(input.start, input.end);
  const query = new URLSearchParams({ ...range, agent_id: env.RASEN_TEST_AGENT_ID!, limit: '50' });
  if (input.cursor) { if (input.cursor.length > 2048) throw new VoiceTestError('Invalid cursor.', 400); query.set('cursor', input.cursor); }
  const result = decode(z.object({ state: z.string(), items: z.array(z.object({ component: z.string(), unit: z.string(), quantity: z.number().finite(), events: z.number().int().nonnegative() })).max(200), next_cursor: cursorSchema }), await readJson(rasenBase(env) + '/usage?' + query, 'rasen', env, fetcher));
  return { state: result.state, items: result.items, nextCursor: result.next_cursor };
}

export async function readEvidence(provider: VoiceProvider, id: string, kind: 'transcript' | 'summary', cursor?: string, env: Environment = process.env, fetcher: Fetcher = fetch): Promise<EvidencePage> {
  configured(provider, env);
  if (cursor && cursor.length > 2048) throw new VoiceTestError('Invalid cursor.', 400);
  if (provider === 'sarvam') {
    if (kind !== 'transcript' || !/^\d{8}\/[A-Za-z0-9_-]{1,250}$/.test(id)) throw new VoiceTestError('Invalid Sarvam evidence request.', 400);
    const result = decode(z.object({ messages: z.array(z.object({ turn_id: z.number(), role: z.string(), content: z.string() })).max(10000) }), await readJson(sarvamBase(env) + '/transcripts/' + encodeURIComponent(id), provider, env, fetcher));
    return { state: result.messages.length ? 'available' : 'empty_or_unknown', turns: result.messages.map(t => ({ index: t.turn_id, speaker: t.role, text: t.content })), summary: null, nextCursor: null, resultId: null, pollAfterSeconds: null };
  }
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new VoiceTestError('Invalid Rasen call ID.', 400);
  const path = rasenBase(env) + '/calls/' + encodeURIComponent(id);
  const call = decode(z.object({ agent_id: z.string() }), await readJson(path, provider, env, fetcher));
  if (call.agent_id !== env.RASEN_TEST_AGENT_ID) throw new VoiceTestError('This call is outside the configured test agent.', 404);
  const query = new URLSearchParams({ limit: '50' });
  if (cursor) query.set('cursor', cursor);
  const common = { state: z.string(), result_id: optionalText, poll_after_seconds: optionalNumber };
  if (kind === 'summary') {
    const result = decode(z.object({ ...common, summary: optionalText }), await readJson(path + '/summary', provider, env, fetcher));
    return { state: result.state, turns: [], summary: result.summary ?? null, nextCursor: null, resultId: result.result_id ?? null, pollAfterSeconds: result.poll_after_seconds ?? null };
  }
  const result = decode(z.object({ ...common, items: z.array(z.object({ index: z.number(), speaker: z.string(), text: z.string() })).max(200), next_cursor: cursorSchema }), await readJson(path + '/transcript?' + query, provider, env, fetcher));
  return { state: result.state, turns: result.items, summary: null, nextCursor: result.next_cursor, resultId: result.result_id ?? null, pollAfterSeconds: result.poll_after_seconds ?? null };
}

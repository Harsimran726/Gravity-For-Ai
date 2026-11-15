const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relative, overrides = {}) {
  const file = path.resolve(__dirname, '..', relative);
  const m = new Module(file, module);
  m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file));
  const original = m.require.bind(m);
  m.require = name => Object.hasOwn(overrides, name) ? overrides[name] : original(name);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, file);
  return m.exports;
}
const api = load('src/lib/voice-test-providers.ts');
const model = load('src/lib/voice-test-model.ts');
const env = { VOICE_TEST_ANALYTICS_ENABLED: 'true', RASEN_API_KEY: 'test-only-key', RASEN_TEST_AGENT_ID: 'test_agent', SARVAM_API_KEY: 'test-only-sarvam', SARVAM_ANALYTICS_ORG_ID: 'org', SARVAM_ANALYTICS_WORKSPACE_ID: 'ws', SARVAM_TEST_APP_ID: 'test_app' };
const range = { start: '2026-11-01T00:00:00+05:30', end: '2026-11-02T00:00:00+05:30' };
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
const call = { id: 'call_test', agent_id: 'test_agent', state: 'future_state', direction: 'outbound', created_at: '2026-11-01T00:00:00Z', user_contact: '+919999999999', duration: 100, latency: 123 };

test('date windows are normalised to UTC and reject invalid, reversed and >93-day ranges', () => {
  assert.deepEqual(api.validateRange(range.start, range.end), { start: '2026-10-31T18:30:00.000Z', end: '2026-11-01T18:30:00.000Z' });
  for (const dates of [['2026-11-01', range.end], [range.end, range.start], ['2026-01-01T00:00:00Z', '2026-11-01T00:00:00Z'], ['bad', 'bad']]) assert.throws(() => api.validateRange(...dates), e => e.status === 400);
});

test('disabled and missing-key states never reach a provider', async () => {
  const never = () => { throw new Error('network must not run'); };
  await assert.rejects(api.readCallPage('rasen', range, {}, never), /Enable VOICE_TEST/);
  await assert.rejects(api.readCallPage('rasen', range, { VOICE_TEST_ANALYTICS_ENABLED: 'true' }, never), /RASEN_API_KEY/);
});

test('Rasen uses server Bearer auth, test-agent filter, unchanged pagination and read-only/no-store requests', async () => {
  const result = await api.readCallPage('rasen', { ...range, cursor: 'opaque+/=' }, env, async (url, options) => {
    const u = new URL(url);
    assert.equal(u.origin, 'https://api.rasen.ai'); assert.equal(u.searchParams.get('agent_id'), 'test_agent');
    assert.equal(u.searchParams.get('cursor'), 'opaque+/='); assert.equal(u.searchParams.get('limit'), '50');
    assert.equal(options.headers.Authorization, 'Bearer test-only-key'); assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error'); assert.equal(options.cache, 'no-store');
    return json({ items: [call], next_cursor: 'next' });
  });
  assert.equal(result.nextCursor, 'next'); assert.equal(result.items[0].state, 'future_state');
  assert.equal(result.items[0].durationSeconds, null); assert.equal(result.items[0].responseMs, null);
  assert.equal(JSON.stringify(result).includes('9999999999'), false);
});

test('Rasen refuses nonofficial hosts and mismatched agent results', async () => {
  await assert.rejects(api.readCallPage('rasen', range, { ...env, RASEN_API_BASE: 'https://example.com/v1' }, () => { throw new Error('never'); }), /official Rasen/);
  await assert.rejects(api.readCallPage('rasen', range, env, async () => json({ items: [{ ...call, agent_id: 'other_agent' }], next_cursor: null })), /outside/);
});

test('provider 429 retains safe retry guidance, without returning vendor body', async () => {
  await assert.rejects(api.readCallPage('rasen', range, env, async () => new Response('SECRET body', { status: 429, headers: { 'Retry-After': '45' } })), e => e.status === 429 && e.retryAfter === 45 && !e.message.includes('SECRET'));
});

test('malformed and oversized responses fail closed', async () => {
  await assert.rejects(api.readCallPage('rasen', range, env, async () => json({ items: 'not a list' })), /documented format/);
  await assert.rejects(api.readCallPage('rasen', range, env, async () => new Response('x'.repeat(2 * 1024 * 1024 + 1))), /2 MB/);
});

test('Sarvam converts inclusive date end and seconds to ms, discards PII and never follows next URLs', async () => {
  const result = await api.readCallPage('sarvam', { ...range, offset: 50 }, env, async (url, options) => {
    const u = new URL(url);
    assert.equal(u.pathname, '/api/analytics/v1/org/ws/test_app/interactions');
    assert.equal(u.searchParams.get('end_datetime'), '2026-11-01T18:29:59.999Z');
    assert.equal(u.searchParams.get('offset'), '50'); assert.equal(options.headers['X-API-Key'], 'test-only-sarvam');
    return json({ items: [{ interaction_id: '20261101/abc', average_agent_response_time_in_seconds: 1.18, duration_in_seconds: 0, user_contact: 'PRIVATE', audio_url: 'https://secret', start_datetime: '2026-11-01T05:00:00', failure_reason: 'NO_FAILURE_REASON' }], total: 75, next_page_uri: 'https://untrusted.invalid' });
  });
  assert.equal(result.items[0].responseMs, 1180); assert.equal(result.items[0].durationSeconds, 0);
  assert.equal(result.items[0].createdAt, '2026-11-01T05:00:00Z'); assert.equal(result.nextOffset, 51);
  assert.equal(JSON.stringify(result).includes('PRIVATE'), false); assert.equal(JSON.stringify(result).includes('secret'), false);
});

test('usage keeps distinct units, corrections and unknown states', async () => {
  const rows = [{ component: 'tts', unit: 'characters', quantity: 200, events: 2 }, { component: 'stt', unit: 'second', quantity: -2, events: 1 }];
  const result = await api.readUsage(range, env, async () => json({ state: 'future_meter_state', items: rows, next_cursor: null }));
  assert.deepEqual(result.items, rows); assert.equal(result.state, 'future_meter_state');
});

test('transcript checks test-agent ownership before fetching evidence and retains layer/cursor/state', async () => {
  const urls = [];
  const result = await api.readEvidence('rasen', 'call_test', 'transcript', 'page2', env, async url => {
    urls.push(url);
    return urls.length === 1 ? json({ agent_id: 'test_agent' }) : json({ state: 'pending', result_id: 'layer_1', items: [{ index: 1, speaker: 'user', text: 'Hello' }], next_cursor: 'page3', poll_after_seconds: 30 });
  });
  assert.equal(urls.length, 2); assert.ok(urls[1].includes('cursor=page2'));
  assert.equal(result.state, 'pending'); assert.equal(result.resultId, 'layer_1'); assert.equal(result.nextCursor, 'page3');
  let requests = 0;
  await assert.rejects(api.readEvidence('rasen', 'call_test', 'summary', undefined, env, async () => { requests++; return json({ agent_id: 'other' }); }), e => e.status === 404);
  assert.equal(requests, 1);
});

test('summary reads do not enqueue analysis; empty Sarvam transcript remains ambiguous', async () => {
  let requests = 0;
  const summary = await api.readEvidence('rasen', 'call_test', 'summary', undefined, env, async () => ++requests === 1 ? json({ agent_id: 'test_agent' }) : json({ state: 'not_requested', summary: null }));
  assert.equal(summary.state, 'not_requested'); assert.equal(summary.summary, null);
  const empty = await api.readEvidence('sarvam', '20261101/abc', 'transcript', undefined, env, async () => json({ messages: [] }));
  assert.equal(empty.state, 'empty_or_unknown');
  await assert.rejects(api.readEvidence('sarvam', '../secrets', 'transcript', undefined, env), e => e.status === 400);
});

test('means exclude missing and invalid values, retain zero, and do not fabricate empty values', () => {
  assert.deepEqual(model.measuredMean([null, NaN, -2]), { value: null, count: 0 });
  assert.deepEqual(model.measuredMean([null, 0, 100]), { value: 50, count: 2 });
});

test('page overlap deduplicates updates and CSV neutralises spreadsheet formula cells', () => {
  assert.deepEqual(model.mergeCalls([{ id: 'a', state: 'pending' }], [{ id: 'a', state: 'complete' }]), [{ id: 'a', state: 'complete' }]);
  const csv = model.callCsv([{ id: '=HYPERLINK("bad")', provider: 'rasen', state: 'pending' }]);
  assert.ok(csv.includes("'=HYPERLINK")); assert.ok(csv.includes('""bad""'));
});

test('API denies unauthenticated and non-admin access before any provider traffic', async () => {
  const { NextRequest } = require('next/server');
  for (const [session, status] of [[null, 401], [{ role: 'VIEWER' }, 403], [{ role: 'EDITOR' }, 403]]) {
    const route = load('src/app/api/admin/voice-tests/route.ts', {
      '@/lib/auth': { getAdminSession: async () => session },
      '@/lib/voice-test-providers': { ...api, readCallPage: () => { throw new Error('must never fetch'); } },
    });
    const response = await route.GET(new NextRequest('http://localhost/api/admin/voice-tests?provider=rasen'));
    assert.equal(response.status, status); assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  }
});

test('authenticated API validates provider and surfaces safe upstream errors with retry headers', async () => {
  const { NextRequest } = require('next/server');
  const route = load('src/app/api/admin/voice-tests/route.ts', { '@/lib/auth': { getAdminSession: async () => ({ role: 'ADMIN' }) }, '@/lib/voice-test-providers': { ...api, readCallPage: async () => { throw new api.VoiceTestError('Rate limited', 429, 17); } } });
  assert.equal((await route.GET(new NextRequest('http://localhost/api/admin/voice-tests?provider=unknown'))).status, 400);
  const response = await route.GET(new NextRequest('http://localhost/api/admin/voice-tests?provider=rasen'));
  assert.equal(response.status, 429); assert.equal(response.headers.get('Retry-After'), '17');
});

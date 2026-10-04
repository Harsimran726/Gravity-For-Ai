const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function setup(secret, passwordMatches = true) {
  const calls = { queries: 0, cookies: 0, signatures: 0 };
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/actions/auth-actions.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mocks = {
    'zod': require('zod'),
    'next/headers': { cookies: () => ({ set() { calls.cookies++; }, delete() {} }) },
    'next/navigation': { redirect() {} },
    '@/lib/prisma': { prisma: {
      user: { findUnique: async () => { calls.queries++; return { id: 'test-user', email: 'editor@example.com', name: 'Test', role: 'EDITOR', passwordHash: 'test-only' }; } },
      auditLog: { create: async () => ({}) },
    } },
    '@/lib/auth': { ADMIN_COOKIE_NAME: 'test-session', verifyPassword: async () => passwordMatches, signSession: () => { calls.signatures++; return 'test-signed-cookie'; } },
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: id => {
    if (!(id in mocks)) throw Error('Unexpected dependency'); return mocks[id];
  }, process: { env: { NEXTAUTH_SECRET: secret } }, console: { error() {} } });
  const form = new FormData(); form.set('email', 'editor@example.com'); form.set('password', 'test-password-only');
  return { calls, run: () => module.exports.loginAdminAction({}, form) };
}
for (const secret of [undefined, '', '   ']) {
  test(`configuration error returns safely for secret length ${secret?.length ?? 'missing'}`, async () => {
    const h = setup(secret); const result = await h.run();
    assert.equal(result.success, false); assert.match(result.message, /not configured/);
    assert.equal(h.calls.queries, 0); assert.equal(h.calls.cookies, 0); assert.equal(h.calls.signatures, 0);
  });
}
test('configured login still authenticates and sets a signed cookie', async () => {
  const h = setup('x'.repeat(32)); assert.equal((await h.run()).success, true);
  assert.equal(h.calls.cookies, 1); assert.equal(h.calls.signatures, 1);
});
test('incorrect password does not create a session', async () => {
  const h = setup('x'.repeat(32), false); assert.equal((await h.run()).success, false);
  assert.equal(h.calls.cookies, 0); assert.equal(h.calls.signatures, 0);
});

test('existing shorter configured secrets remain compatible', async () => {
  const h = setup('existing-key'); assert.equal((await h.run()).success, true);
  assert.equal(h.calls.cookies, 1); assert.equal(h.calls.signatures, 1);
});

test('real session signer preserves existing keys and rejects tampered cookies', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/auth.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const secret = 'existing-key';
  vm.runInNewContext(code, { module, exports: module.exports, Buffer, process: { env: { NEXTAUTH_SECRET: secret } }, require: id => {
    if (id === 'next/headers') return { cookies() {} };
    if (id === './auth-constants') return { ADMIN_COOKIE_NAME: 'test' };
    return require(id);
  } });
  const session = { id: 'test', email: 'editor@example.com', role: 'EDITOR' };
  const token = module.exports.signSession(session);
  const [payload, signature] = token.split('.');
  assert.equal(signature, require('node:crypto').createHmac('sha256', secret).update(payload).digest('base64url'));
  assert.equal(module.exports.verifySession(token).id, 'test');
  assert.equal(module.exports.verifySession(token + 'x'), null);
});

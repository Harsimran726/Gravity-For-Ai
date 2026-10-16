const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm'), ts = require('typescript');
function load(relative, mocks = {}, env = process.env) {
  const filename = path.resolve(__dirname, '..', relative);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: id => id in mocks ? mocks[id] : require(id), process: { env }, URL, Date, console }, { filename });
  return module.exports;
}
const media = load('src/lib/blog-media.ts');
test('inserts between paragraphs without replacing text', () => {
  const result = media.insertMediaAtCursor('Before\n\nAfter', 8, '![alt](url)');
  assert.equal(result.content, 'Before\n\n![alt](url)\n\nAfter');
  assert.equal(result.cursor, result.content.indexOf('After'));
});
test('supports start and end placement', () => {
  assert.equal(media.insertMediaAtCursor('Text', 0, 'media').content, 'media\n\nText');
  assert.equal(media.insertMediaAtCursor('Text', 4, 'media').content, 'Text\n\nmedia\n\n');
});
test('escapes descriptions and preserves complex URLs', () => {
  const out = media.mediaMarkdown('https://example.com/video(1).mp4', 'Demo [one]\nTwo', true);
  assert.equal(out, '![Demo \\[one\\] Two](<https://example.com/video(1).mp4> "video")');
});
test('rejects unsafe URLs and empty descriptions', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.com/x', 'https://user:pass@example.com/a']) assert.throws(() => media.mediaMarkdown(url, 'Alt', false));
  assert.throws(() => media.mediaMarkdown('https://example.com/a', ' ', false));
});
test('limits file formats and sizes', () => {
  for (const type of ['text/html', 'image/svg+xml', 'application/javascript']) assert.throws(() => media.validateBlogMedia(type, 10));
  assert.throws(() => media.validateBlogMedia('image/png', 11 * 1024 * 1024));
  assert.throws(() => media.validateBlogMedia('video/mp4', 101 * 1024 * 1024));
  assert.throws(() => media.validateBlogMedia('video/mp4', 0));
  assert.equal(media.validateBlogMedia('video/mp4', 50 * 1024 * 1024).extension, 'mp4');
});
async function tokenRequest({ role = 'EDITOR', origin = 'https://gravityforai.com', type = 'image/png', size = 10, pathname = 'blog-media/12345678-1234-1234-1234-123456789abc.png', token = 'test-only-token' } = {}) {
  let issued;
  const route = load('src/app/api/blog/media/route.ts', {
    '@/lib/blog-media': media,
    '@/lib/auth': { getAdminSession: async () => role ? { id: 'user', role } : null },
    'next/server': { NextResponse: { json: (data, opts) => ({ data, status: opts?.status || 200 }) } },
    '@vercel/blob/client': { handleUpload: async (options) => { issued = await options.onBeforeGenerateToken(pathname, JSON.stringify({ type, size })); return { ok: true }; } },
  }, token ? { BLOB_READ_WRITE_TOKEN: token } : {});
  const response = await route.POST({ url: 'https://gravityforai.com/api/blog/media', headers: new Headers({ origin }), json: async () => ({}) });
  return { response, issued };
}
test('only admin and editor may request upload tokens', async () => {
  for (const role of [null, 'VIEWER']) assert.equal((await tokenRequest({ role })).response.status, 400);
  for (const role of ['ADMIN', 'EDITOR']) assert.equal((await tokenRequest({ role })).response.status, 200);
});
test('upload token is scoped, bounded and cannot overwrite', async () => {
  const { issued } = await tokenRequest();
  assert.equal(issued.allowedContentTypes[0], 'image/png');
  assert.equal(issued.maximumSizeInBytes, 10 * 1024 * 1024);
  assert.equal(issued.allowOverwrite, false);
  assert.equal(issued.addRandomSuffix, true);
  assert.ok(issued.validUntil <= Date.now() + 15 * 60 * 1000);
});
test('rejects foreign origin, mismatched extension and out-of-prefix path', async () => {
  for (const options of [{ origin: 'https://other.example' }, { pathname: 'outside.png' }, { type: 'video/mp4' }]) assert.equal((await tokenRequest(options)).response.status, 400);
});
test('missing storage has an actionable message and no leaked token', async () => {
  const { response } = await tokenRequest({ token: '' });
  assert.match(response.data.error, /storage is not connected/);
  assert.ok(!JSON.stringify(response).includes('test-only-token'));
});
test('renderer uses native video without autoplay and retains image alt', () => {
  const { blogMediaComponents } = load('src/components/blog/blog-media-renderer.tsx');
  const video = blogMediaComponents.img({ src: 'https://example.com/a.mp4', alt: 'Demo', title: 'video' });
  assert.equal(video.type, 'video'); assert.equal(video.props.controls, true); assert.equal(video.props.autoPlay, undefined);
  const image = blogMediaComponents.img({ src: 'https://example.com/a.png', alt: 'Workflow' });
  assert.equal(image.type, 'img'); assert.equal(image.props.alt, 'Workflow');
});

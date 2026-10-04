const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { PrismaClient } = require('@prisma/client');

function evaluate(relative, requireFn, env = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  }}).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: requireFn,
    process: { env }, console: { warn() {} } });
  return module.exports;
}

test('Prisma module loads with all URL variables absent', async () => {
  // Real Prisma constructor, no connection or query.
  const { prisma } = evaluate('src/lib/prisma.ts', () => ({ PrismaClient }));
  assert.ok(prisma);
  await prisma.$disconnect();
});

test('configured database aliases retain precedence and are not replaced', () => {
  let options;
  class Capture { constructor(value) { options = value; } }
  const env = { DATABASE_URL: 'postgresql://primary', POSTGRES_PRISMA_URL: 'postgresql://pooled', POSTGRES_URL: 'postgresql://fallback' };
  for (const key of ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL']) {
    evaluate('src/lib/prisma.ts', () => ({ PrismaClient: Capture }), env);
    assert.equal(options.datasources.db.url, env[key]);
    delete env[key];
  }
});

async function sitemap(mode) {
  return evaluate('src/app/sitemap.ts', id => {
    if (id === '@/data/blog-seed-data') return { BLOG_POSTS_SEED: [{ slug: 'seed-post', publishedAt: '2026-09-01' }] };
    if (id === '@/data/case-studies-data') return { CASE_STUDIES: [] };
    if (id === '@/data/city-data') return { CITIES_DATA: { mansa: {} } };
    if (id === '@/data/services-data') return { SERVICES_DATA: { automation: {} } };
    if (id === '@/lib/prisma') {
      if (mode === 'initialization-error') throw Error('Client initialization failed');
      return { prisma: { blogPost: { findMany: async () => {
        if (mode === 'query-error') throw Error('Database unavailable');
        return [{ slug: 'database-post', updatedAt: new Date('2026-10-04') }, { slug: 'seed-post', publishedAt: new Date('2026-10-03') }];
      } } } };
    }
    throw Error('Unexpected dependency: ' + id);
  }).default();
}
for (const mode of ['initialization-error', 'query-error']) {
  test('sitemap retains static and seed URLs on ' + mode, async () => {
    const result = await sitemap(mode);
    assert.ok(result.some(p => p.url === 'https://gravityforai.com'));
    assert.ok(result.some(p => p.url.endsWith('/blog/seed-post')));
    assert.ok(result.some(p => p.url.endsWith('/services/automation')));
  });
}
test('sitemap merges and deduplicates published database entries', async () => {
  const result = await sitemap('success');
  assert.equal(result.filter(p => p.url === 'https://gravityforai.com/blog/seed-post').length, 1);
  assert.ok(result.some(p => p.url.endsWith('/blog/database-post')));
});

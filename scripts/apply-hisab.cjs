// Run explicitly in the intended environment with its runtime DATABASE_URL.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Missing database configuration');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    await client.query(readFileSync(join(__dirname, '../db/hisab.sql'), 'utf8'));
    console.log('Hisab database migration committed.');
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error('Hisab database migration failed:', error.code || error.name);
  process.exitCode = 1;
});

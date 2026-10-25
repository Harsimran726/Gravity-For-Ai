// Prints configuration status only. Never prints secret values.
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
require('@next/env').loadEnvConfig(root, true);

if (process.argv.includes('--init')) {
  execFileSync('git', ['check-ignore', '.env.local'], {cwd: root, stdio: 'pipe'});
  const file = path.join(root, '.env.local');
  let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const settings = {
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
    RAZORPAY_WEBHOOK_SECRET: randomBytes(32).toString('hex'),
    WORKSHOP_ACCESS_SECRET: randomBytes(32).toString('hex'),
    WORKSHOP_CHECKOUT_ENABLED: 'false',
    WORKSHOP_SITE_ORIGIN: 'http://localhost:3100',
  };
  for (const [key, value] of Object.entries(settings)) {
    if (process.env[key]) continue;
    const line = new RegExp(`^${key}=.*$`, 'm');
    if (line.test(content)) content = content.replace(line, `${key}=${value}`);
    else content += `\n${key}=${value}\n`;
    process.env[key] = value;
  }
  fs.writeFileSync(file, content);
  console.log('Local Razorpay configuration prepared in ignored .env.local. Existing configured values preserved.');
}

const required = ['DATABASE_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'WORKSHOP_ACCESS_SECRET'];
for (const key of required) console.log(`${key}: ${process.env[key] ? 'configured' : 'MISSING'}`);
if (process.env.WORKSHOP_ACCESS_SECRET && process.env.WORKSHOP_ACCESS_SECRET.length < 32) console.log('WORKSHOP_ACCESS_SECRET must contain at least 32 characters.');
const mode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'test' : process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'live' : 'not configured';
console.log(`Razorpay mode: ${mode}`);
console.log(`Payment collection: ${process.env.WORKSHOP_CHECKOUT_ENABLED === 'true' ? 'enabled flag set; credentials and tests must also pass' : 'disabled'}`);

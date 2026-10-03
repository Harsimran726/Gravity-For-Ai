const fs = require('fs');
const content = fs.readFileSync('tests/e2e/seo.test.ts', 'utf-8');
const regex = /registerTest\(\s*(\d+)\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
let m;
while ((m = regex.exec(content)) !== null) {
  const [_, tier, feat, id, title] = m;
  if (feat.includes('F6') || feat.includes('F7') || feat.includes('F8') ||
      title.toLowerCase().includes('location') || title.toLowerCase().includes('geo') ||
      title.toLowerCase().includes('city') || title.toLowerCase().includes('canonical')) {
    console.log(`[Tier ${tier}] [${feat}] [${id}] ${title}`);
  }
}

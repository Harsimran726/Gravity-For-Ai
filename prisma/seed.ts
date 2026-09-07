import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Gravity For AI database...');

  // Read password from environment variable - never hardcode in source
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      'SEED_ADMIN_PASSWORD env var is required and must be at least 8 characters.\n' +
      'Set it before running: $env:SEED_ADMIN_PASSWORD="YourSecurePassword"; npx prisma db seed'
    );
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  console.log('🔐 Generating bcrypt hash (12 rounds)...');

  const admin = await prisma.user.upsert({
    where: { email: 'harsimran@gravityforai.com' },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'harsimran@gravityforai.com',
      name: 'Harsimran Singh',
      passwordHash,
      role: 'ADMIN',
      title: 'Founder & Lead AI Engineer',
      bio: 'AI Engineer specializing in Agentic AI and enterprise workflow automation based in Mansa, Punjab.',
      twoFAEnabled: false,
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email} (Role: ${admin.role})`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Log in at: http://localhost:3000/admin/login');
  console.log(`   3. Email: harsimran@gravityforai.com`);
  console.log(`   4. Password: [the SEED_ADMIN_PASSWORD you set]`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

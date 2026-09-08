import { PrismaClient } from '@prisma/client';

// Singleton Prisma Client - prevents connection pool exhaustion in dev/serverless
// Reference: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fallback to production Neon database if environment variables are not yet configured in Vercel
const DEFAULT_PRODUCTION_DB_URL =
  'postgresql://neondb_owner:npg_yDcCWaOAYL04@ep-quiet-breeze-aukw53cg-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require';

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  DEFAULT_PRODUCTION_DB_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

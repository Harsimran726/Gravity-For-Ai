-- ============================================================
-- Gravity For AI: Complete Production PostgreSQL Initialization
-- Paste and run this script directly in Neon or Vercel SQL Editor
-- ============================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFASecret" TEXT,
    "bio" TEXT,
    "title" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "metaDescription" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "bodyContent" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "primaryKeyword" TEXT,
    "secondaryKeywords" TEXT[],
    "geoTargetCity" TEXT,
    "geoAnswer" TEXT,
    "readingTime" INTEGER,
    "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BlogPostTag" (
    "blogPostId" TEXT NOT NULL REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "tagId" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("blogPostId", "tagId")
);

CREATE TABLE IF NOT EXISTS "FaqItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "blogPostId" TEXT REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "pageContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceInterest" TEXT,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "businessName" TEXT,
    "serviceInterest" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "notes" TEXT,
    "googleMeetLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "businessName" TEXT,
    "role" TEXT,
    "city" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "logoUrl" TEXT,
    "avatarUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PricingTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceLabel" TEXT NOT NULL,
    "description" TEXT,
    "featuresList" TEXT[],
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Gravity For AI',
    "companyName" TEXT NOT NULL DEFAULT 'Gravity For AI',
    "tagline" TEXT NOT NULL DEFAULT 'AI Voice Agents, Websites & Agentic Systems',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@gravityforai.com',
    "contactPhone" TEXT,
    "addressLocality" TEXT NOT NULL DEFAULT 'Mansa',
    "addressRegion" TEXT NOT NULL DEFAULT 'Punjab',
    "postalCode" TEXT,
    "addressCountry" TEXT NOT NULL DEFAULT 'IN',
    "googleMapsUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "bookingTimeSlots" TEXT[] DEFAULT ARRAY['10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM']::TEXT[],
    "customDateSlots" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");

-- 4. Initial Founder Admin Seed Account
-- Email: harsimran@gravityforai.com
-- Password: Admin@Gravity2026! (change immediately after first login)
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "title", "updatedAt")
VALUES (
  'founder-admin-harsimran',
  'harsimran@gravityforai.com',
  '$2b$12$Iha5OiP5kXY3/ae8gOY8/.6HYBfQojrFVLhjBMqL9soMExnvtZrFu',
  'Harsimran Singh',
  'ADMIN',
  'Founder & Lead AI Engineer',
  NOW()
)
ON CONFLICT ("email") DO UPDATE
SET "passwordHash" = EXCLUDED."passwordHash", "role" = 'ADMIN';

-- 5. Default Site Settings
INSERT INTO "SiteSettings" ("id", "siteName", "companyName", "contactEmail", "updatedAt")
VALUES ('default-settings', 'Gravity For AI', 'Gravity For AI', 'contact@gravityforai.com', NOW())
ON CONFLICT ("id") DO NOTHING;

BEGIN;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "githubUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "inviteTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "inviteExpiresAt" TIMESTAMP(3);
-- Revoke all legacy invitations, whose raw tokens may have been public.
UPDATE "User" SET "passwordHash"='INVITE:revoked', "inviteTokenHash"=NULL, "inviteExpiresAt"=NULL WHERE "passwordHash" LIKE 'INVITE:%' AND "inviteTokenHash" IS NULL;
UPDATE "User" SET bio=NULL WHERE bio ~* '(INVITED_BY:|TOKEN:|STATUS:(PENDING|ACTIVE))';
COMMIT;

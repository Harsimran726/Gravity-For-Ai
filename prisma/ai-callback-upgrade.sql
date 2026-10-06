CREATE TABLE IF NOT EXISTS "AiCallback" (
 "id" TEXT PRIMARY KEY,"leadId" TEXT NOT NULL UNIQUE REFERENCES "Lead"("id") ON DELETE CASCADE,
 "source" TEXT NOT NULL,"phone" TEXT,"status" TEXT NOT NULL DEFAULT 'QUEUED',
 "consentAt" TIMESTAMP(3),"consentText" TEXT,"tokenHash" TEXT,"attemptId" TEXT UNIQUE,"interactionId" TEXT,
 "requestedAt" TIMESTAMP(3),"completedAt" TIMESTAMP(3),"duration" DOUBLE PRECISION,"disposition" TEXT,
 "summary" TEXT,"transcript" TEXT,"error" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "AiCallback_status_createdAt_idx" ON "AiCallback"("status","createdAt");
CREATE INDEX IF NOT EXISTS "AiCallback_phone_requestedAt_idx" ON "AiCallback"("phone","requestedAt");

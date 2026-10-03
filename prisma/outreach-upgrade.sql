-- AlterTable
ALTER TABLE "OutreachCampaign" ADD COLUMN     "automationEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "followup1Body" TEXT,
ADD COLUMN     "followup1Days" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "followup2Body" TEXT,
ADD COLUMN     "followup2Days" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'CAMPAIGN';

-- AlterTable
ALTER TABLE "OutreachProspect" ADD COLUMN     "permissionGranted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissionNote" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "replySubject" TEXT;

-- CreateTable
CREATE TABLE "OutreachMessage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachSuppression" (
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachSuppression_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "OutreachMailbox" (
    "id" TEXT NOT NULL,
    "lockToken" TEXT,
    "lockUntil" TIMESTAMP(3),
    "nextSendAt" TIMESTAMP(3),
    "rampStartedAt" TIMESTAMP(3),
    "lastInboxSyncAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "OutreachMailbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutreachMessage_messageId_key" ON "OutreachMessage"("messageId");

-- CreateIndex
CREATE INDEX "OutreachMessage_campaignId_sentAt_idx" ON "OutreachMessage"("campaignId", "sentAt");

-- CreateIndex
CREATE INDEX "OutreachMessage_createdAt_status_idx" ON "OutreachMessage"("createdAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachMessage_prospectId_step_key" ON "OutreachMessage"("prospectId", "step");

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "OutreachProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

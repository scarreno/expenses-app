-- Receipt.status values already stored are left unchanged.
-- PENDING stays allowed: the column was added with DEFAULT 'PENDING' and
-- existing rows were never backfilled. PROCESSED remains the confirmed save.
-- New rows that omit status default to EXTRACTING so they stay out of totals.

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "status" SET DEFAULT 'EXTRACTING';

-- AddConstraint
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_status_check" CHECK (
  "status" IN (
    'PENDING',
    'PROCESSED',
    'EXTRACTING',
    'READY_FOR_REVIEW',
    'EXTRACTION_FAILED',
    'DISCARDED'
  )
);

-- CreateTable
CREATE TABLE "ProcessingJob" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lastError" TEXT,
    "idempotencyKey" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receiptId" TEXT,
    "jobId" TEXT NOT NULL,
    "messageKey" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddConstraint
ALTER TABLE "ProcessingJob" ADD CONSTRAINT "ProcessingJob_status_check" CHECK (
  "status" IN (
    'QUEUED',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED'
  )
);

-- AddConstraint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_type_check" CHECK (
  "type" IN (
    'EXTRACTION_SUCCEEDED',
    'EXTRACTION_FAILED'
  )
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingJob_receiptId_key" ON "ProcessingJob"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingJob_userId_idempotencyKey_key" ON "ProcessingJob"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ProcessingJob_status_availableAt_idx" ON "ProcessingJob"("status", "availableAt");

-- CreateIndex
CREATE INDEX "ProcessingJob_lockedUntil_idx" ON "ProcessingJob"("lockedUntil");

-- CreateIndex
CREATE INDEX "ProcessingJob_userId_idx" ON "ProcessingJob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_jobId_type_key" ON "Notification"("jobId", "type");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "ProcessingJob" ADD CONSTRAINT "ProcessingJob_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingJob" ADD CONSTRAINT "ProcessingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ProcessingJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

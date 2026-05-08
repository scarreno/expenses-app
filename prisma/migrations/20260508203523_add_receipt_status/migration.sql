-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

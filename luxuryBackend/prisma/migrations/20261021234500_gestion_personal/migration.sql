-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "deactivatedAt" TIMESTAMP(3);

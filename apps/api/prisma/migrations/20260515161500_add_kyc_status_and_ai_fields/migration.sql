-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('UNSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" 
ADD COLUMN "kycStatus" "KycStatus" NOT NULL DEFAULT 'UNSUBMITTED',
ADD COLUMN "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "aiDailyLimit" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "aiMonthlyBudget" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
ADD COLUMN "aiFeaturesAllowed" JSONB NOT NULL DEFAULT '["rewrite","expand","grammar","readability","caption"]',
ADD COLUMN "aiQuotaResetDate" TIMESTAMP(3),
ADD COLUMN "aiModelRestriction" TEXT,
ADD COLUMN "aiConsentGivenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_kycStatus_idx" ON "User"("kycStatus");
CREATE INDEX "User_aiEnabled_idx" ON "User"("aiEnabled");

-- Create composite indexes for KYC dashboard
CREATE INDEX "User_siteId_kycStatus_kycSubmittedAt_idx" ON "User"("siteId", "kycStatus", "kycSubmittedAt");
CREATE INDEX "User_siteId_isVerified_kycSubmittedAt_idx" ON "User"("siteId", "isVerified", "kycSubmittedAt");

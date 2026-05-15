-- Idempotent Migration: Add KYC status and AI fields
-- Using DO blocks and IF NOT EXISTS to prevent failures on partial application

-- 1. Create Enum safely
DO $$ BEGIN
    CREATE TYPE "KycStatus" AS ENUM ('UNSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns safely
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "kycStatus" "KycStatus" NOT NULL DEFAULT 'UNSUBMITTED',
ADD COLUMN IF NOT EXISTS "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "aiDailyLimit" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS "aiMonthlyBudget" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS "aiFeaturesAllowed" JSONB NOT NULL DEFAULT '["rewrite","expand","grammar","readability","caption"]',
ADD COLUMN IF NOT EXISTS "aiQuotaResetDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "aiModelRestriction" TEXT,
ADD COLUMN IF NOT EXISTS "aiConsentGivenAt" TIMESTAMP(3);

-- 3. Create indexes safely
CREATE INDEX IF NOT EXISTS "User_kycStatus_idx" ON "User"("kycStatus");
CREATE INDEX IF NOT EXISTS "User_aiEnabled_idx" ON "User"("aiEnabled");
CREATE INDEX IF NOT EXISTS "User_siteId_kycStatus_kycSubmittedAt_idx" ON "User"("siteId", "kycStatus", "kycSubmittedAt");
CREATE INDEX IF NOT EXISTS "User_siteId_isVerified_kycSubmittedAt_idx" ON "User"("siteId", "isVerified", "kycSubmittedAt");

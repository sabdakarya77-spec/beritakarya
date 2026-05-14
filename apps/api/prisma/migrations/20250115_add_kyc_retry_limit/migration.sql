-- Create migration: Add KYC retry limit fields to User table

-- Add new columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "kycAttempts" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "kycLockedUntil" TIMESTAMP;

-- Create index for checking locked users
CREATE INDEX IF NOT EXISTS "User_kycLockedUntil_idx" ON "User"("kycLockedUntil");

-- Update existing users to have 0 attempts
UPDATE "User" SET "kycAttempts" = 0 WHERE "kycAttempts" IS NULL;
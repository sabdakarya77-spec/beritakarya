-- Migration: Add Soft Delete & RoleQuota
-- Created: 2026-05-14T10:18:04.954Z
-- Purpose: Add soft delete support and AI quota system

-- Add deletedAt columns to existing tables
ALTER TABLE "Site" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Article" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Category" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create indexes for soft delete queries
CREATE INDEX "Site_deletedAt_idx" ON "Site"("deletedAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "Article_deletedAt_idx" ON "Article"("deletedAt");
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- Create RoleQuota table
CREATE TABLE "RoleQuota" (
    "role" VARCHAR(20) NOT NULL,
    "dailyRequests" INTEGER NOT NULL,
    "dailyTokens" INTEGER NOT NULL,
    "monthlyBudget" DECIMAL(10,2) NOT NULL,
    "allowedFeatures" JSONB NOT NULL,
    "modelRestriction" VARCHAR(50),
    CONSTRAINT "RoleQuota_pkey" PRIMARY KEY ("role")
);

-- Insert default role quotas
INSERT INTO "RoleQuota" ("role", "dailyRequests", "dailyTokens", "monthlyBudget", "allowedFeatures", "modelRestriction") VALUES
('superadmin', 999999, 999999, 99999.00, '["rewrite","expand","headline","seo","grammar","readability","layout","caption"]', NULL),
('wapimred', 500, 100000, 500.00, '["rewrite","expand","headline","seo","grammar","readability","layout","caption"]', NULL),
('editor', 200, 50000, 50.00, '["rewrite","expand","headline","seo","grammar","readability","layout","caption"]', NULL),
('reporter', 100, 25000, 25.00, '["rewrite","expand","grammar","readability","caption"]', 'gpt-3.5-turbo'),
('reader', 0, 0, 0.00, '[]', NULL);

-- Add index on RoleQuota.role (already primary key, but for clarity)
-- No additional index needed as role is PK

-- Migration complete

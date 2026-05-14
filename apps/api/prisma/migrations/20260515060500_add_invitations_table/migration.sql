-- Create migration: Add invitations table for admin user invitations

CREATE TABLE IF NOT EXISTS "Invitation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'reader',
  "siteId" TEXT,
  "invitedBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for token
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_key" ON "Invitation"("token");

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX IF NOT EXISTS "Invitation_token_idx" ON "Invitation"("token");
CREATE INDEX IF NOT EXISTS "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");
CREATE INDEX IF NOT EXISTS "Invitation_siteId_idx" ON "Invitation"("siteId");
CREATE INDEX IF NOT EXISTS "Invitation_invitedBy_idx" ON "Invitation"("invitedBy");

-- Foreign key constraints
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" 
  FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE;
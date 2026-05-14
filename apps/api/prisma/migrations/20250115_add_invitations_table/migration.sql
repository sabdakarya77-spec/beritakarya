-- Create migration: Add invitations table for admin user invitations

CREATE TABLE IF NOT EXISTS "Invitation" (
  "id" String NOT NULL DEFAULT (gen_random_uuid()),
  "email" String NOT NULL,
  "token" String NOT NULL UNIQUE,
  "role" String NOT NULL DEFAULT 'reader',
  "siteId" String?,
  "invitedBy" String NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "acceptedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX IF NOT EXISTS "Invitation_token_idx" ON "Invitation"("token");
CREATE INDEX IF NOT EXISTS "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");
CREATE INDEX IF NOT EXISTS "Invitation_siteId_idx" ON "Invitation"("siteId");
CREATE INDEX IF NOT EXISTS "Invitation_invitedBy_idx" ON "Invitation"("invitedBy");

-- Foreign key constraints
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" 
  FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE;
# 🚀 BeritaKarya Production Deployment Guide

**Version:** 1.0  
**Last Updated:** May 14, 2026  
**Estimated Deployment Time:** 3-5 days (phased approach)  
**Team Required:** DevOps + Backend Developer + Frontend Developer

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Phase 1: Final Preparation](#phase-1-final-preparation)
3. [Phase 2: Backend Deployment](#phase-2-backend-deployment)
4. [Phase 3: Frontend Deployment](#phase-3-frontend-deployment)
5. [Phase 4: Monitoring Setup](#phase-4-monitoring-setup)
6. [Phase 5: Launch](#phase-5-launch)
7. [Rollback Procedures](#rollback-procedures)
8. [Post-Launch Checklist](#post-launch-checklist)

---

## 📋 Pre-Deployment Checklist

### Environment & Infrastructure

- [ ] **Server Provisioned**
  - [ ] VPS with Ubuntu 22.04+ (2 CPU, 4GB RAM minimum)
  - [ ] Domain DNS pointing to VPS IP
  - [ ] SSH access configured with key authentication
  - [ ] Firewall configured (UFW/Firewalld)
  - [ ] Fail2ban installed and configured

- [ ] **SSL Certificate**
  - [ ] Domain validated
  - [ ] SSL certificate obtained (Let's Encrypt recommended)
  - [ ] SSL renewal automation configured (`infra/scripts/renew-ssl.sh`)
  - [ ] Cron job added: `0 3 * * * /opt/beritakarya/infra/scripts/renew-ssl.sh`

- [ ] **Database**
  - [ ] PostgreSQL 15+ installed and running
  - [ ] Database created: `beritakarya_prod`
  - [ ] User created with strong password
  - [ ] Backup strategy configured (`infra/scripts/backup-database.sh`)
  - [ ] Cron job added: `0 2 * * * /opt/beritakarya/infra/scripts/backup-database.sh`

- [ ] **Storage**
  - [ ] Upload directory created: `/opt/beritakarya/uploads`
  - [ ] Permissions set: `chmod 755 uploads`
  - [ ] Sufficient disk space (50GB+ for uploads)

### Application Configuration

- [ ] **Environment Variables** (`.env.production`)
  ```bash
  NODE_ENV=production
  API_URL=https://api.beritakarya.co
  NEXT_PUBLIC_API_URL=https://api.beritakarya.co
  
  # Database
  POSTGRES_USER=beritakarya
  POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
  POSTGRES_DB=beritakarya_prod
  DATABASE_URL=postgresql://beritakarya:STRONG_PASSWORD@localhost:5432/beritakarya_prod
  DIRECT_URL=postgresql://beritakarya:STRONG_PASSWORD@localhost:5432/beritakarya_prod
  
  # Security
  JWT_SECRET=$(openssl rand -base64 64)
  JWT_REFRESH_SECRET=$(openssl rand -base64 64)
  CORS_ORIGIN=https://beritakarya.co,https://www.beritakarya.co
  
  # Services
  REDIS_URL=redis://localhost:6379
  MEILISEARCH_URL=http://localhost:7700
  OPENAI_API_KEY=sk-your-key-here
  SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
  
  # Email
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=your-email@example.com
  SMTP_PASS=your-smtp-password
  
  # CDN
  CDN_URL=https://cdn.beritakarya.co
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```

- [ ] **Configuration Files**
  - [ ] `infra/docker/docker-compose.backend.yml` reviewed
  - [ ] `infra/nginx/nginx.prod.conf` reviewed
  - [ ] `infra/scripts/setup-server.sh` ready
  - [ ] `Procfile` exists

### Code & Dependencies

- [ ] **Code is up-to-date**
  ```bash
  git pull origin main
  git checkout production-ready
  ```

- [ ] **Dependencies installed**
  ```bash
  pnpm install
  pnpm prisma generate
  ```

- [ ] **Migration generated**
  ```bash
  node apps/api/generate-migration.js
  # Verify migration file created in prisma/migrations/
  ```

- [ ] **Build verification**
  ```bash
  pnpm build
  # Should succeed without errors
  ```

### Monitoring & Alerting

- [ ] **Sentry** account created (optional but recommended)
- [ ] **Uptime monitoring** service (UptimeRobot/Pingdom) ready
- [ ] **Alerting** configured (email/Slack/Telegram)

---

## Phase 1: Final Preparation

### Step 1.1: Generate Missing Migration

**Objective:** Create migration for soft delete and RoleQuota

**Actions:**
```bash
# Navigate to API directory
cd apps/api

# Generate migration
node generate-migration.js

# Verify migration directory created
ls prisma/migrations/ | grep add_soft_delete_and_rolequota
```

**Expected Output:**
```
✅ Migration directory: prisma/migrations/20260514140000_add_soft_delete_and_rolequota
✅ migration.sql created
✅ README.md created
```

**If successful, proceed to Step 1.2**

---

### Step 1.2: Review Generated Migration

**Objective:** Ensure migration SQL is correct for your database

**Actions:**
```bash
# Open migration file
cat prisma/migrations/$(ls prisma/migrations/ | grep add_soft_delete_and_rolequota)/migration.sql
```

**Checklist:**
- [ ] ALTER TABLE statements for Site, User, Article, Category
- [ ] CREATE INDEX statements for deletedAt columns
- [ ] CREATE TABLE for RoleQuota with correct schema
- [ ] INSERT statements for 5 default roles
- [ ] No syntax errors

**If migration looks good, proceed to Step 1.3**

---

### Step 1.3: Test Migration Locally (Optional but Recommended)

**Objective:** Test migration on local/development database first

**Prerequisites:** Local PostgreSQL running with `.env` pointing to it

**Actions:**
```bash
# Make sure DATABASE_URL in .env points to local DB
# Create migration in dev mode
pnpm prisma migrate dev --name add_soft_delete_and_rolequota

# This will:
# 1. Generate SQL
# 2. Prompt to apply to database
# 3. Apply if you confirm
# 4. Update _prisma_migrations table
```

**Verify:**
```bash
# Open Prisma Studio
pnpm prisma studio

# Manual checks:
# - Site table has deletedAt column (nullable)
# - User table has deletedAt column
# - Article table has deletedAt column
# - Category table has deletedAt column
# - RoleQuota table exists with 5 rows
# - Indexes exist on deletedAt columns
```

**If all good, proceed to Phase 2**

---

## Phase 2: Backend Deployment

### Step 2.1: Server Setup (One-Time)

**Objective:** Prepare VPS for deployment

**Actions:**
```bash
# SSH into server
ssh root@your-server-ip

# Create directory structure
mkdir -p /opt/beritakarya
cd /opt/beritakarya

# Clone repository
git clone https://github.com/adminberitakarya-Aji/beritakarya.git .
git checkout production-ready  # or main branch

# Copy production environment file
cp .env.production.example .env.production
# Edit .env.production with real values
nano .env.production

# Run server setup script
bash infra/scripts/setup-server.sh

# This will:
# - Install Docker & Docker Compose
# - Configure firewall
# - Install fail2ban
# - Setup log rotation
```

**Verify:**
```bash
docker --version
docker compose version
ufw status
systemctl status fail2ban
```

**Take backups of current database if this is an existing system:**
```bash
# Backup existing DB before migration
docker compose -f infra/docker/docker-compose.backend.yml exec postgres pg_dump -U beritakarya beritakarya_prod > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

---

### Step 2.2: Deploy Backend Services

**Objective:** Start backend API, database, redis, nginx

**Actions:**
```bash
cd /opt/beritakarya

# Pull latest Docker images (if using custom images, skip this)
docker compose -f infra/docker/docker-compose.backend.yml pull

# Build and start services
docker compose -f infra/docker/docker-compose.backend.yml up -d --build

# Watch startup logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f
```

**Expected Output:**
```
beritakarya_postgres_1   | PostgreSQL init process complete; ready for start up.
beritakarya_redis_1     | Redis server started, pid: 1
beritakarya_meilisearch_1 | Mei...
beritakarya_api_1        | 📦 Starting BeritaKarya API...
beritakarya_nginx_1      | nginx started
```

**Wait 30-60 seconds for all services to fully start**

---

### Step 2.3: Verify Backend Health

**Objective:** Ensure API is running and healthy

**Actions:**
```bash
# Health check
curl https://api.beritakarya.co/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-14T...","uptime":12345}

# Metrics endpoint
curl https://api.beritakarya.co/metrics

# Test API response (with actual domain)
curl -H "Host: api.beritakarya.co" https://your-server-ip/health
```

**Check Docker containers:**
```bash
docker compose -f infra/docker/docker-compose.backend.yml ps

# All should show "healthy" or "running"
```

---

### Step 2.4: Apply Database Migration

**Objective:** Sync database schema with latest changes

**Actions:**
```bash
# Run migration deploy
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy

# Expected output:
# Migration ${migrationName} applied successfully

# Verify migrations applied
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate status

# Should show:
# ✔ Migration ${migrationName} applied
```

**Generate Prisma Client:**
```bash
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma generate
```

---

### Step 2.5: Seed Initial Data (Optional)

**Objective:** Create default admin user, categories, etc.

**Actions:**
```bash
# Check if seed script exists
ls src/db/seed.ts

# If exists, run:
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma db seed

# Expected: Admin user created with email admin@beritakarya.co
```

**Manual admin creation if no seed:**
```bash
# Use Prisma Studio or create via API
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma studio
# Then manually create user in Studio at http://localhost:5555
```

---

### Step 2.6: Test Backend API

**Objective:** Verify all critical endpoints work

**Test Checklist:**

1. **Authentication:**
   ```bash
   curl -X POST https://api.beritakarya.co/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@beritakarya.co","password":"YOUR_PASSWORD"}'
   ```
   Expected: JWT token returned

2. **User Profile:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://api.beritakarya.co/api/auth/me
   ```
   Expected: User data with role and quota info

3. **AI Features:**
   ```bash
   curl -X POST https://api.beritakarya.co/api/ai/rewrite \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text":"Pemerintah mengumumkan...","tone":"formal"}'
   ```
   Expected: Rewritten text

4. **Multi-tenancy:**
   ```bash
   # Try accessing different site context
   curl -H "X-Site-ID: site-id-here" \
        https://api.beritakarya.co/api/articles
   ```

5. **File Upload:**
   ```bash
   curl -X POST https://api.beritakarya.co/api/media/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@/path/to/image.jpg"
   ```
   Expected: Media object with URLs

---

## Phase 3: Frontend Deployment

### Step 3.1: Vercel Setup

**Objective:** Deploy Next.js frontend to Vercel

**Actions:**

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import repository: `adminberitakarya-Aji/beritakarya`
   - Select root directory: `apps/web`

2. **Configure Environment Variables**
   In Vercel Project Settings → Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://api.beritakarya.co` |
   | `NODE_ENV` | `production` |
   | (Other vars if needed) | - |

   **Important:** Set for both Production and Preview environments

3. **Configure Build Settings**
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)
   - Vercel will assign a `*.vercel.app` domain

---

### Step 3.2: Configure Custom Domain

**Objective:** Point `beritakarya.co` (and `www`) to Vercel

**Actions:**

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add: `beritakarya.co`
   - Add: `www.beritakarya.co`
   - Vercel will provide DNS records

2. **Update DNS Records**
   At your domain registrar (Cloudflare, GoDaddy, etc.):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: beritakarya.co (apex)
   Value: 76.76.21.21 (or as provided by Vercel)
   ```

3. **Wait for Propagation** (5-30 minutes)

4. **Verify SSL**
   Vercel automatically provisions SSL. Check:
   ```bash
   curl -I https://beritakarya.co
   # Should return 200 and SSL valid
   ```

---

### Step 3.3: Test Frontend

**Objective:** Verify frontend can communicate with backend

**Actions:**

1. **Open Website**
   ```
   https://beritakarya.co
   ```

2. **Test Registration/Login**
   - Click "Register" or "Login"
   - Create test account
   - Verify redirect to dashboard

3. **Test Dashboard**
   - Articles list loads
   - Create new article
   - Navigate to AI sidebar
   - Test AI features (rewrite, grammar, etc.)

4. **Test Multi-tenancy** (if multiple sites)
   - Login as different users
   - Verify data isolation between sites

5. **Test File Upload**
   - Upload image in article editor
   - Verify image appears

6. **Check Console for Errors**
   - Open DevTools (F12)
   - Look for red errors in Console & Network tabs

---

### Step 3.4: Configure CORS (If Needed)

**Objective:** Ensure frontend domain is allowed

**Actions:**
```bash
# Backend: Check CORS_ORIGIN in .env.production
# Should include: https://beritakarya.co,https://www.beritakarya.co

# If CORS errors appear, update and restart:
docker compose -f infra/docker/docker-compose.backend.yml restart api
```

---

## Phase 4: Monitoring Setup

### Step 4.1: Enable Sentry (Optional but Recommended)

**Objective:** Track errors and performance

**Actions:**

1. **Create Sentry Project**
   - Go to [sentry.io](https://sentry.io)
   - Create new project: "BeritaKarya API"
   - Note DSN

2. **Add DSN to .env.production**
   ```bash
   SENTRY_DSN=https://your-key@sentry.io/project-id
   ```

3. **Restart API**
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml restart api
   ```

4. **Verify**
   ```bash
   # Trigger test error (or wait for real one)
   curl -X GET https://api.beritakarya.co/api/test-sentry
   ```

5. **Configure Alerts in Sentry**
   - Alert for new issues
   - Alert for spike in errors
   - Email/Slack notifications

---

### Step 4.2: Setup Uptime Monitoring

**Objective:** Get notified if site goes down

**Actions:**

**Using UptimeRobot (Free):**

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: BeritaKarya API
   - URL: `https://api.beritakarya.co/health`
   - Check Interval: 5 minutes
   - Alert Contacts: Email/Slack/Telegram

3. Add monitor for frontend:
   - URL: `https://beritakarya.co`
   - Keyword: (optional) check for specific text

**Alternative:** Pingdom, StatusCake, Better Stack

---

### Step 4.3: Database Backup Verification

**Objective:** Ensure backups are working

**Actions:**

1. **Manual Backup Test**
   ```bash
   bash infra/scripts/backup-database.sh
   
   # Verify backup file created
   ls -lh backups/
   # Should see: beritakarya_prod_YYYYMMDD_HHMMSS.sql.gz
   ```

2. **Restore Test** (IMPORTANT - do on test database first!)
   ```bash
   # Create test database
   createdb beritakarya_test
   
   # Restore backup
   gunzip -c backups/beritakarya_prod_*.sql.gz | psql -U beritakarya beritakarya_test
   
   # Verify data exists
   pnpm prisma studio --schema=prisma/schema.prisma
   ```

3. **Check Backup Email Notification** (if configured)
   - Should receive email on success/failure

---

### Step 4.4: Log Management

**Objective:** Centralized logging for debugging

**Actions:**

**Winston logs are already configured. Check:**
```bash
# View API logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f api

# View nginx logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f nginx
```

**Optional: Set up ELK or CloudWatch for production:**
- Filebeat for log shipping
- Elasticsearch for storage
- Kibana for visualization

---

### Step 4.5: Performance Monitoring

**Objective:** Track response times and resource usage

**Check existing metrics endpoint:**
```bash
curl https://api.beritakarya.co/metrics
```

**Should return Prometheus metrics:**
```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
...
```

**Integrate with:**
- **Datadog** (paid)
- **New Relic** (paid)
- **Prometheus + Grafana** (self-hosted)

---

## Phase 5: Launch

### Step 5.1: Final Pre-Launch Check

**Objective:** Ensure everything is ready before going live

**Go/No-Go Checklist:**

| Item | Status | Notes |
|------|--------|-------|
| Backend API healthy | [ ] | `/health` returns 200 |
| Database migrated | [ ] | All tables exist |
| Frontend deployed | [ ] | Vercel green check |
| SSL working | [ ] | HTTPS padlock visible |
| Domain propagates | [ ] | `dig beritakarya.co` |
| CORS configured | [ ] | No CORS errors in console |
| AI features work | [ ] | Test rewrite, grammar, etc. |
| File uploads work | [ ] | Images upload successfully |
| Admin user exists | [ ] | Can login to admin panel |
| Monitoring active | [ ] | UptimeRobot monitoring |
| Backups running | [ ] | Daily at 2 AM |
| Sentry configured | [ ] | Test error sent |

**If all ✅, proceed to launch**

---

### Step 5.2: Announce Go-Live

**Timing:** Choose off-peak hours (e.g., 2 AM WIB)

**Actions:**

1. **Final restart of all services** (clean slate)
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml restart
   ```

2. **Check final health**
   ```bash
   curl https://api.beritakarya.co/health
   curl https://beritakarya.co
   ```

3. **Send announcement** (if applicable):
   - Internal team: Slack/Email
   - Stakeholders: Update status
   - Users: Optional email announcement

4. **Monitor closely** first 30 minutes
   - Watch logs: `docker compose logs -f`
   - Check uptime monitoring dashboard
   - Test key user flows manually

---

### Step 5.3: Post-Launch Verification (First 24 Hours)

**Monitor continuously:**

1. **Error Rates** (Sentry/Datadog)
   - Should be near 0%
   - Investigate any spikes immediately

2. **API Response Times**
   - p95 should be < 200ms
   - Investigate slow endpoints

3. **Database Performance**
   - Connection pool usage
   - Slow query log
   - Lock waits

4. **AI Usage & Costs**
   - Check daily quota usage in admin panel
   - Monitor OpenAI bill (cost control)

5. **User Registrations**
   - New users can register
   - KYC workflow functioning
   - Admin approvals working

6. **Content Creation**
   - Articles can be created
   - AI features responding
   - Publishing workflow smooth

---

## 🔄 Rollback Procedures

### Backend Rollback

**Scenario:** Critical bug in API after deployment

**Actions:**

1. **Rollback database migration** (if migration caused issue)
   ```bash
   # List migrations
   pnpm prisma migrate status
   
   # Rollback last migration
   pnpm prisma migrate resolve --rolled-back 20260514140000_add_soft_delete_and_rolequota
   
   # Note: This only marks as rolled back. You may need manual SQL to DROP columns/tables
   ```

2. **Rollback Docker containers** to previous version
   ```bash
   cd /opt/beritakarya
   git log --oneline -5  # Find previous commit
   git checkout <previous-commit-hash>
   
   # Rebuild and restart
   docker compose -f infra/docker/docker-compose.backend.yml up -d --build
   ```

3. **If all else fails, restore from backup**
   ```bash
   # Stop API temporarily
   docker compose -f infra/docker/docker-compose.backend.yml stop api
   
   # Drop database
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres dropdb beritakarya_prod
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres createdb beritakarya_prod
   
   # Restore from backup
   gunzip -c backups/beritakarya_prod_YYYYMMDD_HHMMSS.sql.gz | \
     docker compose -f infra/docker/docker-compose.backend.yml exec -T postgres psql -U beritakarya beritakarya_prod
   
   # Restart API
   docker compose -f infra/docker/docker-compose.backend.yml start api
   ```

### Frontend Rollback

**Scenario:** Vercel deployment has critical bugs

**Actions:**
1. Go to Vercel Dashboard
2. Find deployment with issue
3. Click "Promote to Production" on previous stable deployment
4. Vercel will rollback in seconds

---

## 📝 Post-Launch Checklist

### Week 1: Intensive Monitoring

- [ ] Monitor error rates daily (Sentry dashboard)
- [ ] Check API response times (p95, p99)
- [ ] Review database slow queries
- [ ] Monitor disk usage on VPS
- [ ] Check backup logs (did backups succeed?)
- [ ] Monitor AI usage costs (OpenAI dashboard)
- [ ] Collect user feedback
- [ ] Document any issues encountered

### Week 2-4: Stabilization

- [ ] Tune database queries based on slow query log
- [ ] Add missing indexes if needed
- [ ] Optimize AI prompt for cost reduction
- [ ] Implement additional caching if needed
- [ ] Update documentation based on operational learnings
- [ ] Conduct retrospectives with team

### Month 2-3: Scaling Preparation

- [ ] Set up read replicas if needed
- [ ] Implement Redis caching for frequent queries
- [ ] Configure CDN for static assets
- [ ] Plan for load testing
- [ ] Review and adjust AI quotas based on actual usage

---

## 🆘 Emergency Contacts

| Issue Type | Contact | Escalation |
|------------|---------|------------|
| Server Down | DevOps Team | SMS/Phone |
| Database Issue | DBA / Senior Dev | Slack + Phone |
| Application Bug | Lead Developer | Slack + Email |
| Security Incident | Security Team | Immediate escalation |

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | UptimeRobot |
| API Response Time (p95) | <200ms | Metrics endpoint |
| Error Rate | <0.1% | Sentry |
| Database Query Time (p95) | <50ms | pg_stat_statements |
| AI Cost per User | <$10/mo | Billing dashboard |
| User Adoption (AI features) | >60% | Analytics |

---

## 🎯 Launch Day Timeline

```
06:00 - Final health checks
07:00 - Restart all services (clean slate)
07:15 - Verify all endpoints
07:30 - Test full user flow
08:00 - OFFICIAL LAUNCH 🌟
08:00-12:00 - Intensive monitoring (team on standby)
12:00 - First status report
18:00 - Second status report
24:00 - End of day 1 report
```

---

**Good luck with your production launch! 🚀**

---

## 📚 Additional Resources

- [Production Readiness Report](./PRODUCTION_READINESS_REPORT.md)
- [Database Verification Report](./PRODUCTION_DATABASE_VERIFICATION_REPORT.md)
- [AI Features Documentation](../docs/AI_FEATURES.md)
- [Database Schema](../docs/DATABASE_SCHEMA.md)
- [Editorial Workflow](../docs/EDITORIAL_WORKFLOW.md)

---

**Document Version:** 1.0  
**Last Updated:** May 14, 2026  
**Next Review:** After first production month
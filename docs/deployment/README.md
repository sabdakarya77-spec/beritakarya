# 🚀 Deployment Documentation

**Last Updated:** May 14, 2026  
**Target Environment:** Production (Ubuntu 22.04+, Docker)  
**Deployment Method:** Docker Compose + Vercel (frontend)

---

## 📋 What's Inside

This folder contains deployment guides for BeritaKarya:

| Document | Purpose | Audience |
|----------|---------|----------|
| **`BACKEND.md`** | Backend deployment (API, Database, Redis, Nginx) | DevOps, Backend Devs |
| **`FRONTEND.md`** | (Coming soon) Frontend deployment to Vercel | Frontend Devs, DevOps |

---

## 🎯 Quick Navigation

### Deploying Backend (API + Database)
→ Start with **[BACKEND.md](./BACKEND.md)**

Comprehensive guide covering:
- **5 Phases**: Preparation → Backend Deploy → Frontend Deploy → Monitoring → Launch
- **Checklists** for pre-deployment, deployment, post-deployment
- **Rollback procedures** for emergency recovery
- **Timeline estimate:** 3-5 days (phased approach)

**Read time:** 20-30 minutes (full guide)

---

### Deploying Frontend (Next.js)
→ Check **[FRONTEND.md](./FRONTEND.md)** (coming soon)

Will cover:
- Vercel setup
- Environment configuration
- Custom domain setup
- Build optimization

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│                  (apps/web - Next.js)                      │
│         https://beritakarya.co                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                         NGINX                              │
│              (Reverse Proxy + SSL Termination)             │
│         https://api.beritakarya.co                          │
└───────┬──────────────┬──────────────┬─────────────────────┘
        │              │              │
   ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
   │   API    │ │ Postgres │ │  Redis   │
   │ Node.js  │ │  Port    │ │  Cache   │
   │  app     │ │  5432    │ │  6379    │
   └──────────┘ └──────────┘ └──────────┘
```

---

## 🚀 Quick Start

### First Time Deployment

**Step 1:** Read `BACKEND.md` → **Phase 1: Final Preparation**
- Generate migration: `node apps/api/generate-migration.js`
- Prepare `.env.production`
- Verify server prerequisites

**Step 2:** Follow **Phase 2: Backend Deployment**
- SSH into server
- Deploy Docker containers
- Apply migrations
- Test API

**Step 3:** Deploy frontend to Vercel (see `FRONTEND.md`)

**Step 4:** Setup monitoring (Sentry, UptimeRobot)

**Step 5:** Launch! 🎉

---

### Re-deployment (Updates)

For subsequent deployments after initial setup:

```bash
# 1. Pull latest code
cd /opt/beritakarya
git pull origin main

# 2. Rebuild & restart
docker compose -f infra/docker/docker-compose.backend.yml up -d --build

# 3. Apply any new migrations
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy

# 4. Regenerate Prisma Client
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma generate

# 5. Verify health
curl https://api.beritakarya.co/health
```

---

## 📋 Pre-Deployment Checklist

### Critical Items (Must Complete)

- [x] ✅ Migration generated (`20260514101804_add_soft_delete_and_rolequota`)
- [ ] `.env.production` filled with **real values** (not placeholders)
- [ ] SSL certificate installed & auto-renewal configured
- [ ] Database backup script tested & cron job set
- [ ] Server firewall configured (UFW/Firewalld)
- [ ] Domain DNS pointing to server IP
- [ ] Docker & Docker Compose installed
- [ ] All environment variables documented in `.env.production.example`

**See full checklist:** `BACKEND.md` → Pre-Deployment Checklist

---

## 🐛 Common Deployment Issues

### Issue: Containers won't start
```bash
# Check logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f

# Common causes:
# - Missing .env.production file
# - Invalid DATABASE_URL
# - Port 80/443 already in use
```

### Issue: Database connection failed
```bash
# Verify DATABASE_URL in .env.production
# Check PostgreSQL is running
docker compose -f infra/docker/docker-compose.backend.yml ps postgres

# Test connection
docker compose -f infra/docker/docker-compose.backend.yml exec postgres pg_isready
```

### Issue: Migration fails
```bash
# Check migration status
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate status

# If already applied but schema mismatch:
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate resolve --rolled-back "migration_name"
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy
```

---

## 🔄 Rollback Procedures

### Rollback Database Migration

```bash
# List migrations
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate status

# Rollback last migration (marks as rolled back)
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma resolve --rolled-back "20260514101804_add_soft_delete_and_rolequota"

# Note: This only marks as rolled back. Manual SQL may be needed:
# ALTER TABLE "Site" DROP COLUMN "deletedAt";
# ALTER TABLE "User" DROP COLUMN "deletedAt";
# ... etc
```

### Rollback Docker Deployment

```bash
cd /opt/beritakarya

# Find previous commit
git log --oneline -5

# Checkout previous version
git checkout <commit-hash>

# Rebuild & restart
docker compose -f infra/docker/docker-compose.backend.yml up -d --build
```

### Restore from Backup (Last Resort)

```bash
# Stop API temporarily
docker compose -f infra/docker/docker-compose.backend.yml stop api

# Drop current database
docker compose -f infra/docker/docker-compose.backend.yml exec postgres dropdb beritakarya_prod
docker compose -f infra/docker/docker-compose.backend.yml exec postgres createdb beritakarya_prod

# Restore from backup
gunzip -c backups/beritakarya_prod_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose -f infra/docker/docker-compose.backend.yml exec -T postgres psql -U beritakarya beritakarya_prod

# Restart API
docker compose -f infra/docker/docker-compose.backend.yml start api
```

---

## ⏱️ Deployment Timeline

### Phase 1: Final Preparation (2-3 hours)
- [ ] Generate migration (10 min)
- [ ] Test migration locally (optional, 10 min)
- [ ] Prepare `.env.production` (1 hour)
- [ ] Verify server prerequisites (30 min)

### Phase 2: Backend Deployment (1-2 hours)
- [ ] Server setup (if first time, 30 min)
- [ ] Deploy Docker containers (20 min)
- [ ] Apply migrations (5 min)
- [ ] Generate Prisma Client (5 min)
- [ ] Test API endpoints (20 min)

### Phase 3: Frontend Deployment (1 hour)
- [ ] Connect Vercel (10 min)
- [ ] Set environment variables (10 min)
- [ ] Deploy & configure domain (30 min)
- [ ] Test user flows (10 min)

### Phase 4: Monitoring Setup (2 hours)
- [ ] Enable Sentry (20 min)
- [ ] Setup UptimeRobot (20 min)
- [ ] Verify backup scripts (30 min)
- [ ] Configure alerts (30 min)
- [ ] Test logging (20 min)

### Phase 5: Launch (1 hour)
- [ ] Final health checks (15 min)
- [ ] Go/No-Go decision (5 min)
- [ ] Announce launch (5 min)
- [ ] Monitor first 30 min (30 min)

**Total:** 5-8 hours (can spread over 2-3 days)

---

## 🎯 Success Criteria

Launch successful when:

- ✅ All health checks passing (`/health` returns 200)
- ✅ API response time p95 < 200ms
- ✅ Error rate < 0.1% for 1 hour
- ✅ Frontend loads without errors
- ✅ User registration/login working
- ✅ AI features working
- ✅ File uploads working
- ✅ SSL certificate valid
- ✅ All services running in Docker
- ✅ Backups running successfully
- ✅ Monitoring alerts configured

---

## 🔗 Related Documents

| Document | Purpose |
|----------|---------|
| `../PRODUCTION/PLANNING.md` | Production readiness & AI roadmap |
| `../OPERATIONS/MONITORING.md` | Post-launch monitoring procedures |
| `../DATABASE/INFRASTRUCTURE.md` | Database setup & maintenance |
| `../INFRASTRUCTURE/SCRIPTS.md` | Infrastructure scripts reference |

---

## 🆘 Emergency Contacts

| Issue Type | Primary Contact | Escalation |
|------------|----------------|------------|
| Server Down | DevOps Lead | Tech Lead → CTO |
| Database Down | DBA | DevOps Lead → CTO |
| API Errors | Backend Lead | Tech Lead |
| Frontend Issues | Frontend Lead | Tech Lead |
| Security Incident | Security Team | CTO → CEO |

**On-call rotation:** See `../OPERATIONS/MONITORING.md` → Emergency Contacts

---

## 📝 Notes

### Environment-Specific Configurations

**Development:**
- `docker-compose.yml` (root)
- `apps/api/.env` (local)
- Hot reload enabled

**Staging:**
- `docker-compose.staging.yml` (if exists)
- Test database
- Lower resource limits

**Production:**
- `docker-compose.backend.yml`
- Production database
- Full resource allocation
- SSL termination at nginx

---

### Zero-Downtime Deployments

Current strategy: **Blue-Green not implemented** (simple restart)

For zero-downtime, consider:
1. Load balancer with multiple API servers
2. Rolling updates with Docker Swarm/Kubernetes
3. Database connection draining during restart

**Current acceptable downtime:** 30-60 seconds (during container restart)

---

### Database Migrations in Production

**Best practice:** Run migrations during low-traffic period
```bash
# Schedule during 2 AM maintenance window
# Notify users 1 hour before
# Have backup ready
# Monitor closely during migration
```

**Rollback plan:** Have backup restored within 5 minutes if migration fails

---

**Ready to deploy?** → Open [`BACKEND.md`](./BACKEND.md) and start Phase 1!

---

*"Deploy with confidence, monitor with diligence."*

**Maintained by:** BeritaKarya Engineering Team  
**Last Updated:** May 14, 2026
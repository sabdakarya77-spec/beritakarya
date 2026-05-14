# 📊 Operations & Monitoring Documentation

**Last Updated:** May 14, 2026  
**Audience:** DevOps, On-Call Engineers, Operations Team  
**Time Zone:** WIB (UTC+7)

---

## 📋 What's Inside

This folder contains operational runbooks and monitoring procedures for BeritaKarya:

| Document | Purpose | Audience |
|----------|---------|----------|
| **`MONITORING.md`** | Post-launch monitoring procedures & alert response | Ops, DevOps, On-call |
| **`INCIDENT_RESPONSE.md`** | (Coming soon) Incident handling procedures | Ops, Tech Leads |
| **`MAINTENANCE.md`** | (Coming soon) Scheduled maintenance procedures | DevOps |

---

## 🎯 Quick Navigation

### After Launch (Day-to-Day Operations)
→ Start with **[MONITORING.md](./MONITORING.md)**

This comprehensive runbook includes:
- **Daily, weekly, monthly checks** with specific commands
- **Alert response procedures** for 5 critical scenarios
- **Common issues & solutions** (8+ troubleshooting guides)
- **Performance tuning** (database, API, caching)
- **Cost monitoring** (AI usage, infrastructure)
- **Emergency contacts** with escalation procedures

**Read time:** 20-30 minutes (full), use as reference daily

---

### During Incidents
→ Refer to **`MONITORING.md`** → Alert Response Procedures

Each alert type includes:
- Trigger conditions
- Immediate actions (0-5 min, 5-15 min, etc.)
- Escalation criteria
- Rollback procedures

---

## 📅 Monitoring Schedule

### Daily Checks (3x per day)

| Time | Duration | Tasks |
|------|----------|-------|
| **8:00 AM** | 15 min | Uptime review, Sentry errors, API health, AI quotas, backups, quick DB check |
| **12:00 PM** | 10 min | Load check, slow queries, AI cost projection, user activity |
| **6:00 PM** | 15 min | Full day metrics, backup verification, SSL check, prep for next day |

**Template:** Sentry dashboard, UptimeRobot, `curl` health checks

---

### Weekly Reviews (Monday 9:00 AM)

**Duration:** 30 minutes

- Weekend performance review
- Database maintenance (VACUUM ANALYZE if needed)
- Dependency updates check (`pnpm outdated`)
- User feedback review
- AI quota adjustments

**Deliverable:** Weekly Operations Report to team lead

---

### Monthly Deep Dive (1st Friday)

**Duration:** 2 hours

- Cost analysis (OpenAI, infrastructure)
- Performance review (API response times, DB queries)
- Security audit (access logs, failed logins)
- Backup strategy verification & restore testing
- Capacity planning for next month
- Documentation updates

**Deliverable:** Monthly Operations Report with recommendations

---

## 🚨 Critical Alerts & Response

### Alert Matrix

| Alert | Severity | Response Time | Notification |
|-------|----------|---------------|--------------|
| API Down | Critical | 0-5 min | Slack + Email + SMS |
| Database Down | Critical | 0-5 min | Slack + Email + SMS |
| High Error Rate (>1%) | Warning | 5-15 min | Slack |
| Slow API (p95 >500ms) | Warning | 10-30 min | Slack |
| AI Quota Exceeded (Many Users) | Warning | 15-60 min | Email |
| Backup Failed | Warning | 30-120 min | Email |
| Disk Full (>80%) | Critical | 0-10 min | Slack + SMS |
| CPU High (>90% 10min) | Warning | 10-30 min | Slack |
| SSL Certificate Expiring | Warning | 24h before | Email |

---

### Immediate Response Steps

**For ANY Critical Alert:**

1. **Acknowledge** alert in monitoring system
2. **Check** `MONITORING.md` → Alert Response Procedures section
3. **Diagnose** using provided commands
4. **Escalate** if not resolved within SLA
5. **Document** incident in post-mortem

---

## 📊 Health Check URLs

Always know these endpoints:

| Service | URL | Expected Response | Check Frequency |
|---------|-----|------------------|-----------------|
| **API Health** | `https://api.beritakarya.co/health` | `{"status":"ok"}` (200) | Every 1 min |
| **API Metrics** | `https://api.beritakarya.co/metrics` | Prometheus format (200) | Every 1 min |
| **Frontend** | `https://beritakarya.co` | HTML page (200) | Every 5 min |
| **Database** | Via SSH: `pg_isready` | `accepting connections` | Every 5 min |

---

## 🛠️ Essential Commands

### Docker Services
```bash
# Check status
docker compose -f infra/docker/docker-compose.backend.yml ps

# View logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f [service]

# Restart service
docker compose -f infra/docker/docker-compose.backend.yml restart [service]

# Restart all
docker compose -f infra/docker/docker-compose.backend.yml restart
```

---

### Database
```bash
# Connection check
docker compose -f infra/docker/docker-compose.backend.yml exec postgres pg_isready

# Run SQL query
docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT 1"

# Check active connections
docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Open Prisma Studio
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma studio
# → http://localhost:5555 (via SSH tunnel)

# Migration status
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate status

# Apply migrations
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy
```

---

### Backups
```bash
# Manual backup
bash infra/scripts/backup-database.sh

# List backups
ls -lh backups/

# Test restore (on test DB)
createdb beritakarya_test
gunzip -c backups/beritakarya_prod_*.sql.gz | psql -U beritakarya beritakarya_test
```

---

### Logs
```bash
# API logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f api

# Nginx logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f nginx

# Database logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f postgres

# All logs (grep for errors)
docker compose -f infra/docker/docker-compose.backend.yml logs --tail=100 | grep -i error
```

---

## 🔍 Quick Diagnostic Flowchart

```
API Down?
├─ Yes → Check containers: docker compose ps
│        ├─ All down? → Check server SSH access
│        ├─ API down? → Check API logs: docker compose logs api
│        └─ DB down? → Check postgres logs
│
└─ No → Check health endpoint: curl /health
         ├─ 200 OK → Check Sentry for errors
         └─ 5xx/Timeout → Check logs, DB connection

High Error Rate?
├─ Check Sentry: What's the top error?
│  ├─ Database? → Check DB connection, migrations
│  ├─ OpenAI? → Check API key, quota, circuit breaker
│  └─ Other? → Check recent deployments
│
└─ If deployment caused: Rollback (see DEPLOYMENT/BACKEND.md)

Slow Response?
├─ Check metrics: curl /metrics
├─ Check DB slow queries: pg_stat_statements
├─ Check Redis: redis-cli ping
└─ Check server resources: top, df -h

Backup Failed?
├─ Check script: bash infra/scripts/backup-database.sh (manual)
├─ Check disk space: df -h
├─ Check permissions: ls -la backups/
└─ Check cron: crontab -l
```

---

## 📈 Key Metrics & Thresholds

### API Performance
| Metric | Target | Critical | Monitoring |
|--------|--------|----------|------------|
| Response time (p95) | <200ms | >500ms | /metrics |
| Error rate | <0.1% | >1% | Sentry |
| Uptime | 99.9% | <99% | UptimeRobot |
| Request rate | Baseline | 5x spike | /metrics |

### Database
| Metric | Target | Critical | Monitoring |
|--------|--------|----------|------------|
| Connection count | <50 | >100 | pg_stat_activity |
| Slow queries | <10ms avg | >100ms avg | pg_stat_statements |
| Disk usage | <80% | >90% | df -h |
| Cache hit ratio | >95% | <90% | pg_stat_database |

### AI Costs
| Metric | Target | Critical | Monitoring |
|--------|--------|----------|------------|
| Daily cost | <$200 | >$500 | OpenAI dashboard |
| User quota usage | <80% | >100% | AIUsage table |
| Cache hit rate | >20% | <5% | Redis metrics |
| Circuit breaker trips | <1/day | >10/day | Application logs |

---

## 🔐 Security Monitoring

### Daily Checks
- [ ] Failed login attempts (should be low)
- [ ] Rate limit violations (should be minimal)
- [ ] Unusual API patterns (scan for abuse)
- [ ] Certificate expiration (30 days warning)

### Weekly Checks
- [ ] Access logs for admin panel
- [ ] KYC document access logs (KYCViewLog)
- [ ] AuditLog for sensitive actions
- [ ] User role changes

### Monthly Audit
- [ ] Review all admin users
- [ ] Rotate API keys if needed
- [ ] Update firewall rules
- [ ] Security dependency updates

---

## 💰 Cost Monitoring

### AI Cost Tracking Queries

```sql
-- Daily cost (last 7 days)
SELECT 
  DATE(createdAt) as day,
  SUM("estimatedCost") as total_cost,
  COUNT(*) as requests
FROM "AIUsage"
WHERE createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(createdAt)
ORDER BY day DESC;

-- Cost by role (last 30 days)
SELECT 
  u.role,
  COUNT(*) as requests,
  SUM(ai."estimatedCost") as cost,
  AVG(ai."estimatedCost") as avg_cost_per_request
FROM "AIUsage" ai
JOIN "User" u ON ai."userId" = u.id
WHERE ai."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.role
ORDER BY cost DESC;

-- Top users by cost (last 7 days)
SELECT 
  u.email,
  u.role,
  COUNT(*) as requests,
  SUM(ai."estimatedCost") as cost
FROM "AIUsage" ai
JOIN "User" u ON ai."userId" = u.id
WHERE ai."createdAt" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.email, u.role
ORDER BY cost DESC
LIMIT 10;
```

---

## 🗄️ Maintenance Windows

### Standard Maintenance
- **Time:** Tuesday 2:00 AM - 4:00 AM WIB
- **Frequency:**每周 as needed
- **Communication:** Announce 24h prior in #announcements

**Typical tasks:**
- Database VACUUM ANALYZE
- Dependency updates
- Security patches
- Log rotation
- Certificate renewal

---

### Emergency Maintenance
- Can be done anytime if critical
- Notify team immediately in Slack #devops
- Post-mortem required within 24h

---

## 📞 Emergency Contacts

### Tier 1: Immediate Response (0-15 minutes)

| Issue | Primary | Secondary |
|-------|---------|-----------|
| Server Down | DevOps Lead | Senior Backend |
| Database Down | DBA | DevOps Lead |
| Security Breach | Security Team | CTO |
| Payment/Stripe | Finance Team | CTO |

**Contact Info:**
- **DevOps Slack:** #devops-emergency
- **Phone/SMS:** +62-XXX-XXXX-XXXX (on-call rotation)
- **Email:** ops@beritakarya.co

---

### Tier 2: Escalation (15-60 minutes)

| Role | Contact | When to Escalate |
|------|---------|------------------|
| **Tech Lead** | techlead@beritakarya.co | Issue not resolved by Tier 1 |
| **CTO** | cto@beritakarya.co | Incident affecting all users |
| **CEO** | ceo@beritakarya.co | Security breach or data loss |

---

## 📝 Runbook Maintenance

### Review Schedule
- **Weekly:** Update contact information, test alerts
- **Monthly:** Review and update procedures based on incidents
- **Quarterly:** Full runbook review and drill

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-05-14 | Initial version | AI Assistant |
| | | |

---

## 🔗 Related Documentation

| Topic | Document |
|-------|----------|
| **Deployment procedures** | `../DEPLOYMENT/BACKEND.md` |
| **Database setup** | `../DATABASE/INFRASTRUCTURE.md` |
| **Production planning** | `../PRODUCTION/PLANNING.md` |
| **Infrastructure scripts** | `../INFRASTRUCTURE/SCRIPTS.md` |

---

## ✅ Quick Start for New Ops Engineers

**Day 1: Read**
1. `MONITORING.md` (entire document)
2. `../DEPLOYMENT/BACKEND.md` (Phases 1-5)
3. `../DATABASE/INFRASTRUCTURE.md` (backup/restore sections)

**Day 2: Hands-on**
1. Run all diagnostic commands on staging (if available)
2. Practice backup & restore
3. Test alert simulation (create test error, verify Sentry)

**Day 3: Shadow**
1. Shadow on-call engineer (if possible)
2. Review past incident reports
3. Attend deployment (if scheduled)

---

## 🎯 Operational Excellence Goals

| Goal | Target | Measurement |
|------|--------|-------------|
| Mean Time to Detect (MTTD) | <5 min | Alert timestamps |
| Mean Time to Resolve (MTTR) | <30 min (P1), <2h (P2) | Incident tickets |
| Uptime | 99.9% | UptimeRobot |
| Change Failure Rate | <5% | Deployment logs |
| Cost per User | <$10/mo | Billing data |

---

**Remember:** When in doubt, ask in Slack #devops or escalate to on-call engineer. It's better to ask than to guess in production!

---

*"Monitor proactively, respond decisively."*

**Maintained by:** BeritaKarya Operations Team  
**Last Updated:** May 14, 2026  
**Next Review:** June 14, 2026
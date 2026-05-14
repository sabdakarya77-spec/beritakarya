# 📊 BeritaKarya Post-Launch Monitoring Runbook

**Version:** 1.0  
**Effective Date:** May 14, 2026  
**Owner:** Operations Team  
**Escalation:** See Section 10

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Monitoring Setup](#monitoring-setup)
3. [Daily Checks](#daily-checks)
4. [Weekly Reviews](#weekly-reviews)
5. [Monthly Reviews](#monthly-reviews)
6. [Alert Response Procedures](#alert-response-procedures)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Performance Tuning](#performance-tuning)
9. [Cost Monitoring](#cost-monitoring)
10. [Emergency Contacts](#emergency-contacts)

---

## Overview

This runbook provides standard operating procedures for monitoring BeritaKarya production environment after launch. It includes daily checks, weekly reviews, monthly reviews, and incident response procedures.

**Target Metrics:**
- Uptime: 99.9%
- API Response Time (p95): <200ms
- Error Rate: <0.1%
- Database Query Time (p95): <50ms
- AI Cost per User: <$10/month

---

## Monitoring Setup

### 1. Required Monitoring Tools

| Tool | Purpose | Status | Link |
|------|---------|--------|------|
| **Sentry** | Error tracking & performance | Recommended | [sentry.io](https://sentry.io) |
| **UptimeRobot** | Uptime monitoring | Free tier available | [uptimerobot.com](https://uptimerobot.com) |
| **Datadog/New Relic** | APM & infrastructure | Optional (paid) | - |
| **CloudWatch/ELK** | Log aggregation | Optional | - |
| **OpenAI Dashboard** | AI cost tracking | Required | [platform.openai.com](https://platform.openai.com) |

### 2. Health Check URLs

| Service | URL | Expected Response |
|---------|-----|------------------|
| **API Health** | `https://api.beritakarya.co/health` | `{"status":"ok"}` (200) |
| **API Metrics** | `https://api.beritakarya.co/metrics` | Prometheus metrics (200) |
| **Frontend** | `https://beritakarya.co` | HTML page (200) |
| **Database** | Via Docker/SSH | `SELECT 1` returns 1 |

### 3. Datadog Alerts (If Using)

Create these alerts in your monitoring platform:

| Alert | Condition | Severity | Notification |
|-------|-----------|----------|--------------|
| API Down | `/health` returns non-200 OR no data for 2 min | Critical | Slack + Email + SMS |
| High Error Rate | Error rate > 1% for 5 min | Warning | Slack |
| Slow API | p95 response time > 500ms for 10 min | Warning | Slack |
| High AI Cost | Daily cost > $500 OR user > quota 80% | Warning | Email |
| Disk Full | Disk usage > 80% | Critical | Slack + SMS |
| Backup Failed | Last backup > 24h ago | Warning | Email |
| CPU High | CPU usage > 90% for 10 min | Warning | Slack |

---

## Daily Checks

### Morning Check (8:00 AM WIB)

**Duration:** 15 minutes

**Tasks:**

1. **Check Uptime Monitoring Dashboard**
   ```bash
   # Review UptimeRobot dashboard for any downtime overnight
   # Expected: All monitors green (100% uptime)
   ```

2. **Review Sentry Errors**
   - Open Sentry dashboard
   - Check for new issues in last 24 hours
   - Prioritize: Errors affecting >5 users
   - Action: Acknowledge, assign, or resolve

3. **Check API Health**
   ```bash
   curl https://api.beritakarya.co/health
   # Expected: {"status":"ok","uptime":...}
   ```

4. **Check AI Usage Quotas**
   - Login to admin panel: `https://beritakarya.co/admin`
   - Navigate to AI Usage Dashboard
   - Check if any users at >80% daily quota
   - Action: Adjust quotas if needed

5. **Verify Backups**
   ```bash
   ls -lh backups/ | tail -5
   # Expected: Recent backup file from 2 AM today
   
   # Check backup logs
   cat logs/backup.log | tail -20
   # Expected: "Backup successful" message
   ```

6. **Quick Database Check**
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
   # Expected: Low connection count (<50)
   ```

7. **Review Error Logs**
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml logs --tail=100 api | grep -i error
   # Expected: Few or no errors
   ```

**Report:** Send daily health summary to Slack #devops channel:
```
🌅 Daily Health Check - ${DATE}
✅ Uptime: 100%
✅ API Health: OK
✅ Errors (24h): ${count} (${severity})
✅ AI Quotas: Normal
✅ Backups: Last successful ${time}
⚠️  Notes: [any issues or none]
```

---

### Midday Check (12:00 PM WIB)

**Duration:** 10 minutes

**Tasks:**

1. **Load Check**
   ```bash
   curl https://api.beritakarya.co/metrics | grep -E "http_requests_total|process_cpu"
   # Check request rate and CPU usage
   ```

2. **Database Performance**
   - Check slow queries (if pg_stat_statements enabled)
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"
   ```

3. **AI Cost Projection**
   - Check OpenAI usage dashboard
   - Project daily cost vs budget
   - Alert if >$100/day projected

4. **User Activity**
   - Check active users in dashboard
   - Verify registrations are working
   - Check for spike in failed logins

---

### End of Day Check (6:00 PM WIB)

**Duration:** 15 minutes

**Tasks:**

1. **Full Day Metrics Review**
   - Total API requests: Should be increasing steadily
   - Error rate: Should be <0.1%
   - Avg response time: p95 <200ms
   - AI usage: Compare to quota limits

2. **Database Backup Verification**
   ```bash
   # Confirm 2 AM backup completed successfully
   ls -lh backups/ | grep "$(date -d 'yesterday' +%Y%m%d)"
   
   # Test backup integrity (optional, weekly)
   # See weekly tasks
   ```

3. **SSL Certificate Check**
   ```bash
   echo | openssl s_client -connect api.beritakarya.co:443 2>/dev/null | openssl x509 -noout -dates
   # Should show valid dates, not expired
   ```

4. **Prepare Tomorrow's Launch** (if scheduled)
   - Verify all systems green
   - Double-check backups
   - Ensure team aware of launch time
   - Prepare rollback plan

**Report:** Send evening summary:
```
📊 End of Day Report - ${DATE}
📈 Total Requests: ${num}
⏱️  Avg Response: ${p95}ms
💰 AI Cost Today: ~$${estimated}
✅ Status: HEALTHY
🎯 Tomorrow: [Launch / Normal / Maintenance]
```

---

## Weekly Reviews

### Monday Morning (9:00 AM WIB)

**Duration:** 30 minutes

**Tasks:**

1. **Weekend Performance Review**
   - Check uptime for Saturday-Sunday
   - Review any incidents that occurred
   - Analyze traffic patterns

2. **Database Maintenance**
   ```bash
   # Check database size
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT pg_size_pretty(pg_database_size('beritakarya_prod'));"
   
   # If >10GB, consider archiving old data
   
   # Vacuum analyze (during low traffic)
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "VACUUM ANALYZE;"
   ```

3. **Update Dependencies**
   ```bash
   pnpm outdated
   # Review security updates
   # Schedule updates if critical
   ```

4. **Review User Feedback**
   - Check support tickets
   - Review user complaints about performance
   - Identify common issues

5. **AI Quota Adjustment**
   - Review quota usage by role
   - Adjust if users hitting limits too often
   - Update `RoleQuota` table:
   ```sql
   UPDATE "RoleQuota" SET dailyRequests = 250 WHERE role = 'editor';
   ```

**Deliverable:** Weekly Operations Report sent to team lead

---

### Monthly Deep Dive (1st Friday of Month)

**Duration:** 2 hours

**Tasks:**

1. **Cost Analysis**
   - OpenAI costs: Breakdown by feature, user, site
   - Infrastructure costs: VPS, CDN, storage
   - Compare to budget
   - Optimize if overspending

2. **Performance Review**
   - API response time trends (p50, p95, p99)
   - Database query performance
   - Slowest endpoints
   - Create optimization plan

3. **Security Audit**
   - Review access logs for unusual patterns
   - Check failed login attempts
   - Rotate secrets if needed
   - Update firewall rules if necessary

4. **Backup Strategy Review**
   - Verify all backups are restorable
   - Test restore on staging database
   - Document restore procedure updates
   - Check backup retention policy

5. **Capacity Planning**
   - Traffic growth month-over-month
   - Project next month's resource needs
   - Plan infrastructure upgrades if needed

6. **Documentation Updates**
   - Update runbook with lessons learned
   - Update deployment guide if procedures changed
   - Document any new tools or scripts

**Deliverable:** Monthly Operations Report with:
- Cost breakdown
- Performance metrics
- Incident summary
- Recommendations for next month

---

## Monthly Reviews

### Month-End Financial Reconciliation

**Tasks:**

1. **AI Cost Reconciliation**
   - Download OpenAI invoice
   - Compare to internal tracking (AIUsage table)
   - Discrepancies >5% → investigate

2. **Budget vs Actual**
   ```sql
   -- Run this query to see monthly AI usage by role
   SELECT 
     u.role,
     COUNT(*) as request_count,
     SUM(ai."estimatedCost") as total_cost
   FROM "AIUsage" ai
   JOIN "User" u ON ai."userId" = u.id
   WHERE ai."createdAt" >= '2026-05-01'
   GROUP BY u.role;
   ```

3. **Forecast Next Month**
   - Based on growth rate, project next month's costs
   - Alert finance if exceeding budget
   - Consider quota adjustments

---

## Alert Response Procedures

### Critical Alerts

#### 1. API Down

**Trigger:** `/health` endpoint failing or no heartbeat

**Immediate Actions (0-5 min):**
```
1. Check server status:
   ssh root@server "docker compose -f /opt/beritakarya/infra/docker/docker-compose.backend.yml ps"
   
2. If containers down:
   docker compose -f infra/docker/docker-compose.backend.yml up -d
   
3. Check logs:
   docker compose -f infra/docker/docker-compose.backend.yml logs -f api
   
4. If database connection error:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env.production
   - Restart API container
```

**Escalation:** If not resolved in 10 minutes → Notify Lead DevOps + Tech Lead

**Rollback:** If recent deployment caused issue → Rollback to previous version (see Deployment Guide)

---

#### 2. Database Down

**Trigger:** Cannot connect to PostgreSQL, connection timeouts

**Immediate Actions:**
```
1. Check PostgreSQL status:
   docker compose -f infra/docker/docker-compose.backend.yml exec postgres pg_isready
   
2. If not running:
   docker compose -f infra/docker/docker-compose.backend.yml start postgres
   
3. Check disk space:
   df -h
   # If disk full (>95%), clean up:
   - Remove old logs
   - Clean Docker unused resources: docker system prune -af
   
4. Check connection pool exhaustion:
   SELECT count(*) FROM pg_stat_activity;
   -- If >100 connections, check for leaks
```

**Escalation:** Immediately notify DBA / Senior Backend Dev

---

#### 3. High Error Rate (>1%)

**Trigger:** Sentry alert or metrics showing error spike

**Actions:**
```
1. Check Sentry for top errors:
   - Look for new issues
   - Identify affected endpoints
   - Count of affected users
   
2. Check recent deployments:
   git log --oneline -5
   # If deployment within last hour, suspect it
   
3. Check API logs for error patterns:
   docker compose -f infra/docker/docker-compose.backend.yml logs -f api | grep -i error
   
4. If specific endpoint failing, test manually:
   curl -v https://api.beritakarya.co/api/endpoint/here
   
5. Common causes:
   - Database connectivity → restart API
   - Missing env variable → check .env.production
   - OpenAI API error → check quota, circuit breaker
   
6. If cannot identify quickly:
   - Rollback to previous stable version
   - Restore from backup if data corruption suspected
```

---

#### 4. AI Quota Exceeded (Many Users)

**Trigger:** Multiple users reporting "quota exceeded" errors

**Actions:**
```
1. Check current quota usage:
   SELECT role, COUNT(*) as users, AVG(aiDailyLimit) as avg_limit
   FROM "User" GROUP BY role;
   
2. Check AIUsage for today:
   SELECT userId, COUNT(*) as requests_today
   FROM "AIUsage"
   WHERE "createdAt" >= CURRENT_DATE
   GROUP BY userId
   HAVING COUNT(*) > aiDailyLimit * 0.9;
   
3. If many users hitting limits:
   - Temporarily increase quotas in RoleQuota
   - OR: Adjust algorithm to be more conservative
   
4. Long-term:
   - Review AI_PLAN.md for quota strategy
   - Consider increasing budgets
   - Implement caching to reduce redundant calls
   
5. Communicate to users:
   - Send email about quota limits
   - Provide upgrade path for more quota
```

---

#### 5. Backup Failed

**Trigger:** No backup file for >24h OR backup script error

**Actions:**
```
1. Check backup logs:
   cat logs/backup.log | tail -50
   
2. Run backup manually:
   bash infra/scripts/backup-database.sh
   
3. Common issues:
   - Disk full → free up space
   - Permission error → fix uploads/backups directory permissions
   - Database connection → check DATABASE_URL
   - PostgreSQL not running → start it
   
4. Verify backup created:
   ls -lh backups/
   
5. Send notification to team:
   "Backup failed, manual backup completed at ${time}"
   
6. Schedule fix for automated backup
```

---

## Common Issues & Solutions

### Issue 1: API Returns 500 Internal Server Error

**Diagnosis:**
```bash
# Check API logs
docker compose -f infra/docker/docker-compose.backend.yml logs api --tail=100 | grep -A5 "ERROR"

# Check Sentry for stack trace
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Database connection failed | Check DATABASE_URL, restart postgres container |
| OpenAI API error | Check OPENAI_API_KEY, quota, circuit breaker status |
| Missing environment variable | Add to .env.production, restart API |
| Database migration not applied | Run `pnpm prisma migrate deploy` |
| Out of memory | Increase container memory limit in docker-compose.yml |

---

### Issue 2: Slow API Response (>500ms)

**Diagnosis:**
```bash
# Check metrics endpoint
curl https://api.beritakarya.co/metrics | grep "http_request_duration"

# Check database slow queries
docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**Fixes:**
1. Add missing indexes (check pg_stat_statements)
2. Optimize N+1 queries (use Prisma includes)
3. Implement Redis caching for frequent queries
4. Consider database connection pool tuning

---

### Issue 3: CORS Errors in Browser

**Symptoms:** Browser console shows "Access-Control-Allow-Origin" errors

**Fix:**
1. Check `.env.production` CORS_ORIGIN includes frontend domain
   ```
   CORS_ORIGIN=https://beritakarya.co,https://www.beritakarya.co
   ```

2. Restart API:
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml restart api
   ```

3. Verify config:
   ```bash
   curl -I -H "Origin: https://beritakarya.co" https://api.beritakarya.co/health
   # Should include: access-control-allow-origin: https://beritakarya.co
   ```

---

### Issue 4: AI Features Not Working

**Checklist:**

1. **OpenAI API Key**
   ```bash
   # Verify OPENAI_API_KEY set correctly
   docker compose -f infra/docker/docker-compose.backend.yml exec api env | grep OPENAI
   ```

2. **Quota Limits**
   - Check user's aiEnabled = true
   - Check user hasn't exceeded daily limit
   - Check role's modelRestriction (reporter limited to gpt-3.5-turbo)

3. **Circuit Breaker**
   - If OpenAI down, circuit breaker opens
   - Check logs: "Circuit breaker open for OpenAI"
   - Wait 30s for reset timeout

4. **Test AI endpoint directly:**
   ```bash
   curl -X POST https://api.beritakarya.co/api/ai/rewrite \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text":"test","tone":"formal"}'
   ```

---

### Issue 5: File Uploads Failing

**Common Causes:**

1. **Upload directory not writable**
   ```bash
   ssh root@server
   chmod 755 /opt/beritakarya/uploads
   chown -R node:node /opt/beritakarya/uploads  # or appropriate user
   ```

2. **Cloudinary not configured** (if using Cloudinary)
   - Check CLOUDINARY_* env vars
   - Verify Cloudinary account active
   - Check upload preset exists

3. **File size too large**
   - Default limit: 10MB (check multer config)
   - Increase in code if needed

4. **Disk full**
   ```bash
   df -h /opt/beritakarya/uploads
   # If >90%, clean up old uploads
   ```

---

### Issue 6: SSL Certificate Expired

**Symptoms:** Browser shows "Not Secure" warning

**Fix:**
```bash
# Manual SSL renewal
bash infra/scripts/renew-ssl.sh

# Verify
echo | openssl s_client -connect api.beritakarya.co:443 2>/dev/null | openssl x509 -noout -dates

# Check cron is configured
crontab -l
# Should have: 0 3 * * * /opt/beritakarya/infra/scripts/renew-ssl.sh
```

---

### Issue 7: High Memory Usage

**Diagnosis:**
```bash
# Check container memory
docker stats

# If API container using >80% of limit:
docker compose -f infra/docker/docker-compose.backend.yml exec api ps aux
```

**Fixes:**
1. Increase memory limit in `docker-compose.backend.yml`:
   ```yaml
   services:
     api:
       mem_limit: 2g  # Increase from default
   ```

2. Check for memory leaks:
   - Restart API container
   - Monitor if memory grows over time

3. Add swap space on server (temporary):
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   ```

---

### Issue 8: Email Not Sending

**Checklist:**

1. **SMTP Configuration**
   ```bash
   # Verify SMTP_* env vars set
   docker compose -f infra/docker/docker-compose.backend.yml exec api env | grep SMTP
   
   # Check SMTP credentials are correct
   # Test connection:
   telnet smtp.example.com 587
   ```

2. **Spam/Junk folder** - Check if emails going to spam

3. **Rate limiting** - SMTP provider may limit sending

4. ** logs:**
   ```bash
   docker compose -f infra/docker/docker-compose.backend.yml logs api | grep -i email
   ```

---

## Performance Tuning

### Database Optimization

**Monthly Tasks:**

1. **Identify slow queries:**
   ```sql
   SELECT query, calls, total_time, mean_time, rows
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 20;
   ```

2. **Add missing indexes:**
   ```sql
   -- Example: If query on Article(status, publishedAt) is slow
   CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
   ```

3. **Update statistics:**
   ```sql
   ANALYZE;
   ```

4. **Check for bloat:**
   ```sql
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
   FROM pg_stat_user_tables;
   -- High n_tup_del + n_tup_upd indicates need for VACUUM FULL
   ```

---

### API Optimization

**If response times >200ms p95:**

1. **Enable query caching** (Redis already configured)
   - Cache AI responses
   - Cache frequent article queries

2. **Implement pagination** on all list endpoints
   - Ensure ` LIMIT` and `OFFSET` used

3. **Optimize N+1 queries**
   ```typescript
   // Bad: loops through articles and fetches author each time
   // Good: use Prisma includes
   const articles = await prisma.article.findMany({
     include: { author: true, category: true }
   })
   ```

4. **Compress responses**
   - Already enabled in nginx: `gzip on;`
   - Verify with: `curl -I https://api.beritakarya.co/api/articles | grep content-encoding`

---

### Caching Strategy

**Redis is already configured. Use for:**

1. **AI Response Caching** (Hash-based key: prompt + model + temp)
   ```typescript
   const cacheKey = `ai:${feature}:${hash}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

2. **User Session Caching**
   ```typescript
   const userCacheKey = `user:${userId}`;
   await redis.setex(userCacheKey, 3600, JSON.stringify(user));
   ```

3. **Hot Article Caching**
   ```typescript
   const trendingKey = `articles:trending:${siteId}`;
   await redis.setex(trendingKey, 300, JSON.stringify(articles)); // 5 min TTL
   ```

---

## Cost Monitoring

### AI Cost Tracking

**Daily:**
```sql
-- Total cost yesterday
SELECT 
  SUM("estimatedCost") as daily_cost,
  COUNT(*) as requests
FROM "AIUsage"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '1 day';
```

**By Feature:**
```sql
SELECT 
  action,
  COUNT(*) as requests,
  SUM("estimatedCost") as cost,
  AVG("estimatedCost") as avg_cost_per_request
FROM "AIUsage"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY action
ORDER BY cost DESC;
```

**By User (Top Spenders):**
```sql
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

**Alerts:**
- Set up daily alert if AI cost > $200
- Alert if any user > $10/day average

---

### Infrastructure Costs

**Track these monthly:**
- VPS hosting (Hetzner/DigitalOcean)
- CDN (Cloudflare/Cloudinary)
- Email service (SendGrid/Mailgun)
- Monitoring (Sentry/Datadog)
- OpenAI API

**Spreadsheet or tool to track:**
```
Month | VPS | CDN | Email | Monitoring | OpenAI | Total
May   | $50 | $20 | $10   | $29        | $700   | $809
```

---

## Emergency Contacts

### Tier 1: Immediate Response (0-15 minutes)

| Issue | Primary Contact | Secondary Contact |
|-------|----------------|-------------------|
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

## Runbook Maintenance

**Review Schedule:**
- **Weekly:** Update contact information
- **Monthly:** Review and update procedures based on incidents
- **Quarterly:** Full runbook review and drill

**Change Log:**

| Date | Change | Author |
|------|--------|--------|
| 2026-05-14 | Initial version | AI Assistant |
| | | |

---

## Appendix

### A. Useful Commands Quick Reference

```bash
# Docker services
docker compose -f infra/docker/docker-compose.backend.yml ps
docker compose -f infra/docker/docker-compose.backend.yml logs -f [service]
docker compose -f infra/docker/docker-compose.backend.yml restart [service]

# Database
docker compose -f infra/docker/docker-compose.backend.yml exec postgres psql -U beritakarya
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma studio

# Migrations
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate status
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy

# Backups
bash infra/scripts/backup-database.sh
ls -lh backups/

# Health checks
curl https://api.beritakarya.co/health
curl https://api.beritakarya.co/metrics
```

---

### B. Monitoring Dashboard URLs

| Dashboard | URL | Access |
|-----------|-----|--------|
| Sentry | https://sentry.io/orgs/beritakarya | Team SSO |
| UptimeRobot | https://uptimerobot.com/dashboard | Shared login |
| OpenAI Usage | https://platform.openai.com/usage | API key auth |
| Vercel | https://vercel.com/dashboard | Team access |
| Server (if any) | SSH: root@api.beritakarya.co | SSH key |

---

### C. Maintenance Windows

**Standard Maintenance Window:**
- **Time:** Tuesday 2:00 AM - 4:00 AM WIB
- **Frequency:** Weekly (as needed)
- **Communication:** Announce 24h prior in #announcements

**Emergency Maintenance:**
- Can be done anytime if critical
- Notify team immediately in Slack #devops
- Post-mortem required within 24h

---

**Remember:** When in doubt, ask in Slack #devops or escalate to on-call engineer. It's better to ask than to guess in production!

**Document Version:** 1.0  
**Last Updated:** May 14, 2026  
**Next Review:** June 14, 2026
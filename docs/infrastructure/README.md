# 🔧 Infrastructure Documentation

**Last Updated:** May 14, 2026  
**Audience:** DevOps, System Administrators  
**Stack:** Docker, Nginx, PostgreSQL, Redis, Ubuntu 22.04+

---

## 📋 What's Inside

This folder contains infrastructure-related documentation and configurations:

| Document | Purpose | Audience |
|----------|---------|----------|
| **`DOCKER.md`** | Docker configurations, images, volumes | DevOps |
| **`NGINX.md`** | Nginx configuration, SSL, reverse proxy | DevOps |
| **`SCRIPTS.md`** | Infrastructure scripts reference & usage | DevOps |
| **`docker/`** | Dockerfiles & docker-compose files | DevOps |
| **`nginx/`** | Nginx configuration files | DevOps |
| **`scripts/`** | Bash scripts (backup, SSL, setup) | DevOps |

---

## 🎯 Quick Navigation

### Docker Configuration
→ See **`DOCKER.md`** (or directly: `infra/docker/`)

Contains:
- Dockerfile untuk API (Node.js) dan Web (Next.js)
- docker-compose.backend.yml (production)
- Volume configurations
- Network setup
- Environment variable handling

---

### Nginx Configuration
→ See **`NGINX.md`** (or directly: `infra/nginx/nginx.prod.conf`)

Contains:
- Reverse proxy setup
- SSL/TLS configuration
- Rate limiting rules
- CORS headers
- Static file serving
- Security headers

---

### Infrastructure Scripts
→ See **`SCRIPTS.md`** (or directly: `infra/scripts/`)

Available scripts:
- `setup-server.sh` - Initial server setup
- `backup-database.sh` - Database backup automation
- `renew-ssl.sh` - SSL certificate auto-renewal
- `setup-ssl.sh` - Initial SSL certificate setup

---

## 🏗️ Infrastructure Overview

### Components

```
┌────────────────────────────────────────────────────────────┐
│                        INTERNET                            │
└───────────────┬────────────────────────────────────────────┘
                │ HTTPS (443)
┌───────────────▼────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                │
│  • SSL Termination • Rate Limiting • CORS • Security     │
└─────┬────────────┬────────────┬──────────────────────────┘
      │            │            │
      │ API        │ Static     │ Health Checks
      ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│  API    │ │  Web    │ │ Redis   │
│ Node.js │ │ Next.js │ │  Cache  │
│ :3000   │ │ (Vercel)│ │ :6379   │
└─────────┘ └─────────┘ └─────────┘
      │
      ▼
┌─────────┐
│Postgres │
│ :5432   │
└─────────┘
```

---

## 📦 Docker Services

### Backend Services (`docker-compose.backend.yml`)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **api** | `beritakarya-api:latest` | 3000 | Node.js API server |
| **postgres** | `postgres:15-alpine` | 5432 | PostgreSQL database |
| **redis** | `redis:7-alpine` | 6379 | Cache & session storage |
| **nginx** | `nginx:alpine` | 80, 443 | Reverse proxy + SSL |

---

### Volume Mounts

| Service | Volume | Purpose |
|---------|--------|---------|
| postgres | `postgres_data:/var/lib/postgresql/data` | Persistent DB storage |
| nginx | `./infra/nginx/nginx.prod.conf:/etc/nginx/nginx.conf` | Config |
| nginx | `./infra/ssl:/etc/ssl/beritakarya` | SSL certificates |
| api | `./apps/api:/app` | Code mount (development) |
| api | `/app/node_modules` | Dependencies (anonymous) |

---

## 🔐 Security Configuration

### SSL/TLS

**Certificate:** Let's Encrypt (wildcard: `*.beritakarya.co`)

**Location:** `infra/ssl/`

**Auto-renewal:** `infra/scripts/renew-ssl.sh` (daily at 3 AM)

**TLS Settings:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

---

### Rate Limiting

**Config:** `infra/nginx/nginx.prod.conf`

| Zone | Rate | Applies To |
|------|------|------------|
| `auth_limit` | 10 req/min | `/api/auth/*` endpoints |
| `api_limit` | 100 req/min | All other `/api/*` endpoints |

**Burst:** 20 requests allowed temporarily

---

### Security Headers

Implemented in Nginx:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
server_tokens off;
```

---

## 🔄 Deployment Workflow

### 1. Initial Server Setup

**Script:** `infra/scripts/setup-server.sh`

**Tasks:**
- Install Docker & Docker Compose
- Configure firewall (UFW)
- Setup fail2ban
- Create `beritakarya` user
- Setup directory structure
- Configure log rotation

**Usage:**
```bash
sudo bash infra/scripts/setup-server.sh
```

---

### 2. SSL Certificate Setup

**Script:** `infra/scripts/setup-ssl.sh`

**Prerequisites:**
- Domain DNS pointing to server
- Port 80/443 open
- Certbot installed

**Usage:**
```bash
sudo bash infra/scripts/setup-ssl.sh
```

**Creates:**
- `/etc/ssl/beritakarya/fullchain.pem`
- `/etc/ssl/beritakarya/privkey.pem`
- Nginx config with SSL enabled

---

### 3. Database Backup

**Script:** `infra/scripts/backup-database.sh`

**Schedule:** Daily at 2 AM via cron

**Retention:** 7 days (auto-purge)

**Usage:**
```bash
sudo bash infra/scripts/backup-database.sh
```

**Output:** `backups/beritakarya_prod_YYYYMMDD_HHMMSS.sql.gz`

**Email alerts:** Sent to ops@beritakarya.co on success/failure

---

### 4. SSL Auto-Renewal

**Script:** `infra/scripts/renew-ssl.sh`

**Schedule:** Daily at 3 AM via cron

**Usage:**
```bash
sudo bash infra/scripts/renew-ssl.sh
```

**On success:** Reloads nginx configuration

**Log:** `/var/log/cron.log`

---

## 🛠️ Common Operations

### View Logs

```bash
# API logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f api

# Nginx logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f nginx

# Database logs
docker compose -f infra/docker/docker-compose.backend.yml logs -f postgres

# All logs
docker compose -f infra/docker/docker-compose.backend.yml logs

# Nginx access logs (on host if mounted)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

### Restart Services

```bash
# Restart single service
docker compose -f infra/docker/docker-compose.backend.yml restart api

# Restart all
docker compose -f infra/docker/docker-compose.backend.yml restart

# Full rebuild (after code changes)
docker compose -f infra/docker/docker-compose.backend.yml up -d --build
```

---

### Update Code

```bash
cd /opt/beritakarya
git pull origin main

# Rebuild & restart
docker compose -f infra/docker/docker-compose.backend.yml up -d --build

# Apply new migrations (if any)
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma migrate deploy
docker compose -f infra/docker/docker-compose.backend.yml exec api pnpm prisma generate
```

---

### Check Resource Usage

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h

# CPU load
top

# Check for old images
docker images | grep beritakarya
docker image prune -a (careful!)
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting service (apache2, etc.)
sudo systemctl stop apache2
sudo systemctl disable apache2
```

---

### Container Won't Start

```bash
# Check logs
docker compose -f infra/docker/docker-compose.backend.yml logs [service]

# Common issues:
# - Missing .env.production
# - Invalid environment variables
# - Database not ready (wait a few seconds)
```

---

### SSL Certificate Issues

```bash
# Test SSL configuration
openssl s_client -connect beritakarya.co:443 -servername beritakarya.co

# Check certificate expiry
echo | openssl s_client -connect beritakarya.co:443 2>/dev/null | openssl x509 -noout -dates

# Force renewal (if expiring)
sudo certbot renew --force-renewal
sudo docker compose -f infra/docker/docker-compose.backend.yml reload nginx
```

---

### Database Connection Issues

```bash
# Check if postgres is running
docker compose -f infra/docker/docker-compose.backend.yml ps postgres

# Test connection
docker compose -f infra/docker/docker-compose.backend.yml exec postgres pg_isready

# Check logs
docker compose -f infra/docker/docker-compose.backend.yml logs postgres

# Restart database (careful - data loss if volume lost!)
docker compose -f infra/docker/docker-compose.backend.yml restart postgres
```

---

## 📝 Configuration Files

### Docker Compose

**File:** `infra/docker/docker-compose.backend.yml`

**Purpose:** Production backend orchestration

**Services:**
- `api` - Node.js application
- `postgres` - Database
- `redis` - Cache
- `nginx` - Reverse proxy

**Network:** `beritakarya-network` (bridge)

---

### Nginx

**File:** `infra/nginx/nginx.prod.conf`

**Purpose:** Production reverse proxy

**Key blocks:**
- `http {}` - HTTP settings, rate limiting, upstreams
- `server {}` - HTTPS server (port 443)
- `server {}` - HTTP to HTTPS redirect (port 80)

**Testing:**
```bash
docker run --rm -v $(pwd)/infra/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro nginx:alpine nginx -t
```

---

### Dockerfiles

**API:** `infra/docker/api.Dockerfile`
- Multi-stage build
- Node 20 Alpine
- Non-root user (`apiuser`)
- Health check: `curl -f http://localhost:3000/health`

**Web:** `infra/docker/web.Dockerfile`
- Next.js optimized build
- Standalone output
- Non-root user (`nextjs`)

---

## 📊 Monitoring & Maintenance

### Daily
- [ ] Check container status: `docker compose ps`
- [ ] Review nginx logs for 5xx errors
- [ ] Verify backup cron job ran
- [ ] Check SSL certificate expiry

### Weekly
- [ ] Review Docker disk usage: `docker system df`
- [ ] Clean unused images: `docker image prune -a` (careful!)
- [ ] Check log rotation: `/var/log/nginx/*.log`
- [ ] Verify cron jobs: `crontab -l`

### Monthly
- [ ] Update Docker images (if updates available)
- [ ] Review and rotate API keys
- [ ] Security audit of running containers
- [ ] Test restore from backup

---

## 🔗 Related Documentation

| Topic | Document |
|-------|----------|
| **Deployment** | `../DEPLOYMENT/BACKEND.md` |
| **Backup procedures** | `SCRIPTS.md` → backup-database.sh |
| **SSL setup** | `SCRIPTS.md` → setup-ssl.sh, renew-ssl.sh |
| **Monitoring** | `../OPERATIONS/MONITORING.md` |
| **Database** | `../DATABASE/INFRASTRUCTURE.md` |

---

## 🆘 Emergency Procedures

### All Services Down

1. Check server SSH access
2. `docker compose -f infra/docker/docker-compose.backend.yml ps`
3. Restart all: `docker compose -f infra/docker/docker-compose.backend.yml up -d`
4. Check logs: `docker compose -f infra/docker/docker-compose.backend.yml logs -f`

---

### Database Corruption

1. Stop API: `docker compose -f infra/docker/docker-compose.backend.yml stop api`
2. Restore from latest backup (see `SCRIPTS.md`)
3. Start API: `docker compose -f infra/docker/docker-compose.backend.yml start api`

---

### SSL Certificate Expired

1. Manual renewal: `sudo certbot renew`
2. Reload nginx: `docker compose -f infra/docker/docker-compose.backend.yml reload nginx`
3. Verify: `openssl s_client -connect beritakarya.co:443 -servername beritakarya.co`

---

## 📞 Contact

| Issue | Contact |
|-------|---------|
| Server/Infrastructure | DevOps Team |
| Docker/Deployment | DevOps Lead |
| SSL/Certificates | Infrastructure Team |
| Network/Firewall | SysAdmin |

**On-call:** See `../OPERATIONS/MONITORING.md` → Emergency Contacts

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)

---

**Remember:** Infrastructure is the foundation. Changes should be tested in staging first, documented, and reviewed.

---

*"Reliable infrastructure, reliable journalism."*

**Maintained by:** BeritaKarya Infrastructure Team  
**Last Updated:** May 14, 2026  
**Next Review:** June 14, 2026
# 🔍 Laporan Audit Menyeluruh — BeritaKarya
## Complete System Audit Report

**Tanggal Audit:** 19 Mei 2026  
**Auditor:** Senior News System Development  
**Versi Project:** 1.0.0  
**Stack:** pnpm Monorepo + Turborepo | Express.js API | Next.js 16 Web | PostgreSQL + Prisma | Docker + Nginx

---

## 1. Ringkasan Eksekutif (Executive Summary)

### Skor Audit Keseluruhan: 7.5/10

| Area | Skor | Status |
|------|------|--------|
| Arsitektur Monorepo | ⭐⭐⭐⭐½ | Baik - Struktur terorganisir dengan jelas |
| Keamanan Backend | ⭐⭐⭐½ | Cukup - Ada celah kritis yang perlu diperbaiki |
| Keamanan Frontend | ⭐⭐⭐½ | Cukup - Best practices belum sepenuhnya diterapkan |
| Infrastruktur & DevOps | ⭐⭐⭐½ | Cukup - Docker baik, ada issue script automation |
| Database & Schema | ⭐⭐⭐⭐ | Baik - Schema solid dengan beberapa missing constraints |
| API Design | ⭐⭐⭐⭐ | Baik - Modular, Zod validation, ada beberapa gaps |
| Performance | ⭐⭐⭐⭐ | Baik - Caching, rate limiting sudah ada |
| Testing | ⭐⭐⭐ | Cukup - Unit tests ada tapi coverage rendah |
| Dokumentasi | ⭐⭐⭐⭐ | Baik - Sudah ada audit reports dan deployment guides |

### Verdict
BeritaKarya adalah platform CMS berita multi-tenant yang dibangun dengan fondasi engineering yang solid. Arsitektur monorepo, keamanan middleware, dan infrastruktur Docker sudah well-structured. Namun ada beberapa **celah keamanan kritis** dan **issue operasional** yang harus diperbaiki sebelum go-live production.

---

## 2. Audit Arsitektur & Struktur Project

### 2.1 Struktur Monorepo ✅
```
beritakarya/
├── apps/
│   ├── api/          → Express.js Backend (Port 3001)
│   └── web/          → Next.js 16 Frontend (Port 3000)
├── packages/
│   ├── config/       → Shared configuration (KNOWN_SITE_IDS, dll)
│   ├── types/        → Shared TypeScript types
│   └── utils/        → Shared utilities
├── infra/
│   ├── docker/       → Dockerfiles & docker-compose
│   ├── nginx/        → Nginx configs
│   └── scripts/      → Server setup, backup, SSL scripts
└── scripts/          → Test scripts
```

### 2.2 Temuan Positif Arsitektur
- ✅ Turborepo dengan pnpm workspace - fast builds
- ✅ Clean separation of concerns (apps vs packages)
- ✅ Path aliases (`@beritakarya/*`) configured dengan baik
- ✅ Multi-stage Docker builds untuk size optimization

### 2.3 Issue Arsitektur
- ⚠️ API package.json: scripts dev menggunakan `ts-node-dev` dengan `transpile-only` - tidak ada type-checking saat development
- ⚠️ Web tsconfig.json: `strict: false` - seharusnya `strict: true` untuk code quality

---

## 3. Audit Keamanan Backend (apps/api)

### 3.1 Middleware Chain ✅
Urutan middleware sudah baik:
```
Request → timeout(30s) → helmet → CORS → securityHeaders → jwtVerify 
→ express.json → sanitize(DOMPurify) → requestId → httpLogger → performance 
→ [Route-specific] → Handler → errorMiddleware
```

### 3.2 Security Headers ✅
- `X-Frame-Options: DENY` ✅
- `X-Content-Type-Options: nosniff` ✅
- `Strict-Transport-Security` ✅
- `Content-Security-Policy` ✅
- `Permissions-Policy` ✅

### 3.3 Rate Limiting ✅
- Auth limiter: 30 requests/15 min per IP
- API limiter: 1000 requests/min per IP
- AI limiter: 20 requests/hour per user
- Redis store integration

### 3.4 Temuan Positif Keamanan
- ✅ CSRF Protection dengan csurf
- ✅ XSS Prevention dengan DOMPurify sanitization
- ✅ JWT dengan access/refresh token rotation
- ✅ Helmet security headers
- ✅ CORS dengan whitelist origins
- ✅ Path traversal protection di media upload

### 3.5 🚨 CRITICAL: Issue Keamanan Backend

#### [CRITICAL-1] CSRF Protection Tidak Digunakan
```typescript
// main.ts baris 142-148
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'none' } })
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
  res.json({ success: true, data: { csrfToken: req.csrfToken() } })
})
```
**Issue:** CSRF token endpoint ada, tapi tidak digunakan di route POST/PUT/DELETE manapun. Token di-fetch oleh frontend tapi tidak divalidasi.
**Risk:** MEDIUM - CSRF attack dimungkinkan
**Recommendation:** Apply `csrfProtection` middleware ke semua state-changing routes

#### [CRITICAL-2] Role-Based Access Tanpa Enum Constraint
```typescript
// user.controller.ts line 54
if (!roles.includes(req.user.role))
```
**Issue:** Role disimpan sebagai string di database (`String @default("reader")`) tanpa enum constraint di Prisma schema.
**Risk:** HIGH - Data integrity issue, bisa ada invalid role values
**Recommendation:** Gunakan Prisma enums untuk Role

#### [CRITICAL-3] JWT Secret via Environment Only
```typescript
// env.ts line 8
JWT_SECRET: z.string(), // Required, no default
```
**Issue:** Tidak ada fallback untuk JWT_SECRET. Jika env variable tidak set, aplikasi crash saat import.
**Risk:** MEDIUM - Production deployment risk
**Recommendation:** Add validation check di startup

#### [HIGH-1] Error Messages Leak Internal Info
```typescript
// article.service.ts line 48
throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
```
**Issue:** Custom error objects dengan message bahasa Indonesia expose internal paths
**Risk:** LOW - Information disclosure
**Recommendation:** Gunakan generic error messages di production

#### [HIGH-2] Media Upload - Filename Collision Possible
```typescript
// media.controller.ts
const fullName = `${filename}.webp`  // filename comes from client
```
**Issue:** Filename dari client digunakan langsung tanpa hash. Collision dimungkinkan.
**Risk:** MEDIUM - File overwrite
**Recommendation:** Generate UUID-based filenames

---

## 4. Audit Database (Prisma)

### 4.1 Schema Strengths
- ✅ Soft-delete (`deletedAt`) di User, Article, Category
- ✅ Audit trail lengkap (AuditLog + KYCViewLog)
- ✅ Composite indexes untuk query patterns
- ✅ Unique constraints (`slug+siteId`, `email+siteId`)
- ✅ GDPR compliance (`kycDataExpiresAt`)
- ✅ Direct URL support untuk connection pooling

### 4.2 🚨 Issue Database

#### [DB-1] Role & Article Status Bukan Enum
**Issue:** `User.role` dan `Article.status` menggunakan String tanpa enum constraint
**Risk:** Data integrity compromise
**Recommendation:** Tambahkan enums di Prisma schema

#### [DB-2] AIUsage/Notification/AuditLog Tanpa FK
**Issue:** Tiga tabel menyimpan ID sebagai String tanpa foreign key
**Risk:** Orphan data, referential integrity issues
**Recommendation:** Tambahkan proper FK constraints

#### [DB-3] PageView Menyimpan IP Address Raw
**Issue:** `ipAddress` disimpan tanpa hashing
**Risk:** UU PDP Indonesia violation
**Recommendation:** Gunakan `anonymizeIP()` dari `packages/utils/security.ts`

---

## 5. Audit Frontend (apps/web)

### 5.1 Middleware & Routing ✅
```typescript
// middleware.ts
- Subdomain parsing ✅
- Site ID extraction ✅
- Auth guard untuk /dashboard ✅
- Rewrite rules ✅
- Input sanitization ✅
```

### 5.2 API Client ✅
```typescript
// lib/api.ts
- Axios instance dengan interceptors ✅
- CSRF token handling ✅
- Refresh token mutex ✅
- Site ID injection ✅
```

### 5.3 Auth Store (Zustand) ✅
- Token management dengan httpOnly cookies
- Refresh token rotation
- Auth state persistence

### 5.4 🚨 Issue Frontend

#### [FE-1] Missing Error Boundaries
**Issue:** Hanya ada `global-error.tsx`, tidak ada per-component error boundaries
**Risk:** Single error crash entire page
**Recommendation:** Tambahkan React Error Boundaries

#### [FE-2] Client-Side Data Sanitization Missing
**Issue:** XSS sanitization hanya ada di backend, frontend render HTML blocks tanpa sanitization
**Risk:** XSS via stored XSS from rich text editor
**Recommendation:** Gunakan DOMPurify di frontend sebelum render

#### [FE-3] No Loading States for Server Components
**Issue:** Beberapa page imports `loading.tsx` tapi tidak konsisten
**Risk:** Poor UX dengan blank screens
**Recommendation:** Ensure all async pages have loading.tsx

---

## 6. Audit Infrastructure

### 6.1 Docker Setup ✅
**Positif:**
- Multi-stage builds (deps → builder → runner)
- Image size optimization (~300MB → ~100MB)
- Healthcheck configured
- Non-root user (apiuser:nodejs)

### 6.2 Nginx Configuration ✅
**Positif:**
- SSL with TLS 1.2/1.3
- Rate limiting zones
- CORS headers
- Direct media serving via alias
- HSTS configured

### 6.3 🚨 CRITICAL: Infrastructure Issues

#### [INFRA-1] Backup Script Container Name Mismatch
```bash
# backup-database.sh line 14
docker exec beritakarya_postgres pg_dump ...
```
**Issue:** docker-compose.backend.yml mendefinisikan container sebagai `beritakarya_db`, bukan `beritakarya_postgres`
**Risk:** Backup akan FAIL di production
**Recommendation:** Ubah script ke `beritakarya_db`

#### [INFRA-2] SSL Wildcard Auto-Renewal Gagal
```bash
# setup-ssl.sh
certbot certonly --manual --preferred-challenges=dns
```
**Issue:** Manual DNS challenge tidak bisa auto-renew. Certbot akan prompt interaksi manusia.
**Risk:** SSL expired after 90 days
**Recommendation:** Gunakan DNS API plugin (Cloudflare/GoDaddy)

#### [INFRA-3] Backup Hanya di Lokal VPS
**Issue:** Backup disimpan di `/var/backups/beritakarya` pada VPS yang sama
**Risk:** Data loss jika VPS fail/hacked/ransomware
**Recommendation:** Push ke offsite storage (R2/S3)

#### [INFRA-4] Docker-compose Tidak Ada Redis/MeiliSearch
**Issue:** docker-compose.backend.yml tidak mendefinisikan services Redis dan MeiliSearch
**Risk:** App akan fail saat startup
**Recommendation:** Tambahkan services atau dokumentasikan external deps

---

## 7. Audit Keamanan Tambahan

### 7.1 Secrets Management ⚠️
| Variable | Status | Issue |
|----------|--------|-------|
| DATABASE_URL | ✅ | Via env file |
| JWT_SECRET | ⚠️ | Required, no default - crash if missing |
| SMTP_PASS | ⚠️ | Used for both SMTP and Resend API |
| S3 keys | ✅ | Via env |
| REDIS_PASSWORD | ✅ | Optional |

### 7.2 Input Validation ✅
- Zod schemas di env validation
- DOMPurify sanitization middleware
- Multer file type validation
- Path traversal protection

### 7.3 Logging & Monitoring ⚠️
| Component | Status | Note |
|-----------|--------|------|
| Sentry | ✅ | Error tracking with sensitive data redaction |
| Winston | ✅ | File + console logging |
| HTTP Logger | ✅ | Request/response logging |
| Metrics | ✅ | Prometheus-style metrics |

**Issue:** No centralized log aggregation (ELK/Logstash) - `LOG_HTTP_HOST` ada di schema tapi tidak digunakan

---

## 8. Audit Testing

### 8.1 Test Coverage
- ✅ Unit tests ada di auth.service.test.ts, article.service.test.ts
- ✅ Integration tests (auth, article, ai)
- ✅ Security tests (security.test.ts)
- ❌ Coverage rendah, banyak modules tanpa tests

### 8.2 Vitest Configuration ✅
- Konfigurasi ada di apps/api/vitest.config.mts
- Coverage v8 reporter

---

## 9. Rekomendasi Prioritas Perbaikan

### 🔴 PRIORITAS 1 - Critical (Segera / 1-2 hari)

1. **[INFRA-1]** Fix backup-database.sh container name
2. **[CRITICAL-1]** Implement CSRF validation di backend routes
3. **[DB-1]** Add Role enum di Prisma schema
4. **[DB-1]** Add ArticleStatus enum di Prisma schema

### 🟡 PRIORITAS 2 - High (1 minggu)

5. **[INFRA-2]** Setup automatic SSL renewal dengan DNS API
6. **[INFRA-3]** Add offsite backup (R2/S3)
7. **[CRITICAL-2]** Fix CSRF middleware usage
8. **[DB-3]** Implement IP anonymization untuk PageView

### 🟢 PRIORITAS 3 - Medium (2 minggu)

9. **[FE-2]** Add DOMPurify sanitization di frontend
10. **[INFRA-4]** Add Redis/MeiliSearch ke docker-compose
11. **[DB-2]** Add FK constraints ke AuditLog/Notification/AIUsage
12. **Testing** - Increase test coverage to 60%

### 🔵 PRIORITAS 4 - Low (Ongoing)

13. **[FE-1]** Add React Error Boundaries
14. **[FE-3]** Ensure loading states consistency
15. Add centralized log aggregation
16. Performance optimization untuk image processing

---

## 10. Compliance Check

### UU PDP Indonesia (Perlindungan Data Pribadi) ⚠️
| Aspek | Status | Catatan |
|-------|--------|---------|
| Consent | ✅ | KYC dengan consent form |
| Purpose Limitation | ✅ | Data used only for verification |
| Data Minimization | ⚠️ | Some fields may be excessive |
| Retention | ✅ | kycDataExpiresAt + cleanup cron |
| Security | ⚠️ | IP address stored raw, needs anonymization |
| Rights | ⚠️ | No explicit deletion/export flow |

### Security Best Practices
| Praktik | Status |
|---------|--------|
| Password Hashing (bcrypt) | ✅ |
| JWT with short expiry | ✅ |
| Refresh token rotation | ✅ |
| Rate limiting | ✅ |
| Input sanitization | ✅ |
| Security headers | ✅ |
| CORS | ✅ |
| HTTPS | ✅ |
| Non-root containers | ✅ |

---

## 11. Kesimpulan

BeritaKarya adalah platform CMS berita multi-tenant yang dibangun dengan **fondsai engineering baik**. Tim development menunjukkan pemahaman yang solid tentang security, performance, dan scalability patterns.

**Kekuatan:**
- Arsitektur monorepo yang clean dan well-organized
- Keamanan middleware yang comprehensive
- Multi-tenant support dengan site scoping
- Docker optimization dengan multi-stage builds
- Editorial workflow yang lengkap (draft → publish)

**Area Perbaikan:**
- Celah keamanan CSRF yang tidak digunakan
- Database constraints (enum untuk Role/Status)
- Infrastructure automation (backup script, SSL renewal)
- Frontend sanitization
- Test coverage

**Langkah Selanjutnya:**
1. Fix critical issues (backup script, CSRF, enums)
2. Setup automated SSL renewal
3. Increase test coverage
4. Implement frontend sanitization

---

*Audit Report Generated: 19 Mei 2026*  
*Auditor: Senior News System Development*

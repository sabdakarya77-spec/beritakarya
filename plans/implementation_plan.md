# 🛠️ Implementation Plan — BeritaKarya Audit Remediation

**Total: 15 temuan → 4 Sprint → ~8-10 hari kerja**

---

## Sprint 1: KRITIS — Security Hotfix (Hari 1-2)

### ✅ Task 1.1: Tambah Auth Guard pada Category & Site Routes
**Temuan:** API-2 — Siapapun bisa CRUD site & kategori tanpa login  
**File:** `apps/api/src/main.ts` baris 148-161  
**Perubahan:**
```diff
+import { requireAuth, requireRole } from './middleware/auth.middleware'
+import { siteMiddleware, requireSiteAccess } from './middleware/site.middleware'

-app.post('/api/v1/categories', asyncHandler(categoryController.createCategory))
-app.put('/api/v1/categories/:id', asyncHandler(categoryController.updateCategory))
-app.delete('/api/v1/categories/:id', asyncHandler(categoryController.deleteCategory))
+app.post('/api/v1/categories', requireAuth, siteMiddleware, requireSiteAccess,
+  requireRole(['superadmin','wapimred']), asyncHandler(categoryController.createCategory))
+app.put('/api/v1/categories/:id', requireAuth, siteMiddleware, requireSiteAccess,
+  requireRole(['superadmin','wapimred']), asyncHandler(categoryController.updateCategory))
+app.delete('/api/v1/categories/:id', requireAuth, siteMiddleware, requireSiteAccess,
+  requireRole(['superadmin','wapimred']), asyncHandler(categoryController.deleteCategory))

-app.post('/api/v1/sites', asyncHandler(siteController.createSite))
-app.put('/api/v1/sites/:id', asyncHandler(siteController.updateSite))
-app.delete('/api/v1/sites/:id', asyncHandler(siteController.deleteSite))
-app.post('/api/v1/sites/:id/wapimred', asyncHandler(siteController.assignWapimred))
-app.patch('/api/v1/sites/settings', asyncHandler(siteController.updateSiteSettings))
+app.post('/api/v1/sites', requireAuth, requireRole(['superadmin']),
+  asyncHandler(siteController.createSite))
+app.put('/api/v1/sites/:id', requireAuth, requireRole(['superadmin']),
+  asyncHandler(siteController.updateSite))
+app.delete('/api/v1/sites/:id', requireAuth, requireRole(['superadmin']),
+  asyncHandler(siteController.deleteSite))
+app.post('/api/v1/sites/:id/wapimred', requireAuth, requireRole(['superadmin']),
+  asyncHandler(siteController.assignWapimred))
+app.patch('/api/v1/sites/settings', requireAuth, siteMiddleware, requireSiteAccess,
+  requireRole(['superadmin','wapimred']), asyncHandler(siteController.updateSiteSettings))
```
**Estimasi:** 30 menit  
**Test:** Coba POST /api/v1/categories tanpa token → harus 401

---

### ✅ Task 1.2: Amankan Logout Endpoint
**Temuan:** API-1 — Logout tanpa requireAuth  
**File:** `apps/api/src/modules/auth/auth.controller.ts` baris 86-93  
**Perubahan:**
```diff
-authRouter.post('/logout', asyncHandler(async (req: Request, res: Response) => {
-  const { userId, refreshToken } = z.object({
-    userId: z.string(),
-    refreshToken: z.string()
-  }).parse(req.body)
-  await authService.logoutUser(userId, refreshToken)
+authRouter.post('/logout', requireAuth, asyncHandler(async (req: any, res: Response) => {
+  const { refreshToken } = z.object({
+    refreshToken: z.string()
+  }).parse(req.body)
+  await authService.logoutUser(req.user.userId, refreshToken)
   res.json({ success: true, message: 'Logout berhasil' })
 }))
```
**Estimasi:** 15 menit  
**Test:** POST /logout tanpa Bearer token → 401

---

### ✅ Task 1.3: Hapus .env dari Git & Perbaiki .gitignore
**Temuan:** SEC-1 — .env file committed  
**Langkah:**
```bash
# 1. Tambahkan ke .gitignore
echo -e "\n.env\n.env.local\n.env.production\napps/*/.env\napps/*/.env.local" >> .gitignore

# 2. Hapus dari tracking (tanpa hapus file lokal)
git rm --cached .env
git rm --cached apps/api/.env
git rm --cached apps/web/.env
git rm --cached apps/web/.env.local

# 3. Commit
git add .gitignore
git commit -m "fix(security): remove .env files from git tracking"
```
**Estimasi:** 15 menit

---

## Sprint 2: HIGH — Auth & Data Integrity (Hari 3-4)

### ✅ Task 2.1: Tambah Ownership Check pada Media Endpoints
**Temuan:** API-3/API-4  
**File:** `apps/api/src/modules/media/media.controller.ts`  
**Perubahan pada DELETE /:id:**
```diff
 mediaRouter.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
+  const media = await repo.findMediaById(req.params.id)
+  if (!media) return res.status(404).json({ success: false, error: { message: 'Media tidak ditemukan' }})
+  // Hanya pemilik atau admin yang bisa hapus
+  const isAdmin = ['superadmin','wapimred'].includes(req.user!.role)
+  if (media.userId !== req.user!.userId && !isAdmin) {
+    return res.status(403).json({ success: false, error: { message: 'Akses ditolak' }})
+  }
   await repo.deleteMedia(req.params.id)
   res.json({ success: true, message: 'Media berhasil dihapus' })
 }))
```
Tambahkan juga `siteMiddleware` pada PATCH endpoint.  
**Estimasi:** 1 jam  
**Perlu:** Tambah method `findMediaById` di `media.repository.ts`

---

### ✅ Task 2.2: Perbaiki KYC Cleanup PrismaClient
**Temuan:** DB-3 — Connection leak  
**File:** `apps/api/src/cron/kyc-cleanup.ts`  
```diff
-import { PrismaClient } from '@prisma/client'
+import { prisma } from '../db/client'
 import { StorageService } from '../services/storage.service'
 import { logger } from '../lib/logger'

-const prisma = new PrismaClient()
```
Hapus juga `prisma.$disconnect()` di baris 101 karena singleton tidak boleh di-disconnect.  
**Estimasi:** 15 menit

---

### ✅ Task 2.3: Pindahkan Account Lockout ke Redis
**Temuan:** SEC-3  
**File:** `apps/api/src/lib/accountLockout.ts`  
**Perubahan:** Ganti in-memory Map dengan Redis keys:
- Key: `lockout:{email}` → value: `{attempts: N, lockedUntil: timestamp}`
- TTL: 15 menit (auto-cleanup)
- Fallback ke in-memory jika Redis tidak tersedia  
**Estimasi:** 1 jam

---

### ✅ Task 2.4: Gunakan Redis Store untuk Rate Limiter
**Temuan:** SEC-4  
**File:** `apps/api/src/lib/rateLimit.ts`  
```bash
pnpm --filter @beritakarya/api add rate-limit-redis
```
```diff
+import RedisStore from 'rate-limit-redis'
+import { redis } from './redis'

 export const authLimiter = rateLimit({
+  store: process.env.REDIS_HOST ? new RedisStore({ sendCommand: (...args) => redis.call(...args) }) : undefined,
   windowMs: 1 * 60 * 1000,
   max: 10,
```
**Estimasi:** 45 menit

---

## Sprint 3: MEDIUM — Schema & Infra (Hari 5-7)

### ✅ Task 3.1: Tambah Prisma Enum untuk Role & Status
**Temuan:** DB-1, DB-2  
**File:** `apps/api/prisma/schema.prisma`  
```prisma
enum UserRole {
  reader
  journalist
  wapimred
  superadmin
}

enum ArticleStatus {
  draft
  submitted
  review
  revision
  approved
  scheduled
  published
  archived
}
```
Kemudian update field:
```diff
-  role         String   @default("reader")
+  role         UserRole @default(reader)

-  status       String   @default("draft")
+  status       ArticleStatus @default(draft)
```
**Langkah:**
1. Buat migration: `pnpm --filter @beritakarya/api run db:migrate -- --name add_role_status_enums`
2. Update semua service/controller yang compare string ke enum value
3. Test semua endpoint yang melibatkan role/status  
**Estimasi:** 3 jam (termasuk update semua referensi)

---

### ✅ Task 3.2: Tambah Cron Cleanup BlacklistedToken
**Temuan:** DB-7  
**File baru:** `apps/api/src/cron/token-cleanup.ts`  
```typescript
import { prisma } from '../db/client'
import { logger } from '../lib/logger'

export async function runTokenCleanup() {
  const result = await prisma.blacklistedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  })
  logger.info(`Cleaned up ${result.count} expired blacklisted tokens`)

  // Juga cleanup expired refresh tokens
  const refreshResult = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  })
  logger.info(`Cleaned up ${refreshResult.count} expired refresh tokens`)
}
```
Register di `main.ts`:
```typescript
cron.schedule('0 3 * * *', () => runTokenCleanup()) // Setiap jam 3 pagi
```
**Estimasi:** 30 menit

---

### ✅ Task 3.3: Tambah Redis & Meilisearch ke Docker Compose
**Temuan:** INFRA-1  
**File:** `infra/docker/docker-compose.backend.yml`  
Tambah service:
```yaml
  redis:
    image: redis:7-alpine
    container_name: beritakarya_redis
    expose:
      - "6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: beritakarya_meili
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_KEY}
    expose:
      - "7700"
    volumes:
      - meili_data:/meili_data
    restart: unless-stopped
```
Update API service environment:
```yaml
    environment:
      - REDIS_HOST=redis
      - MEILISEARCH_HOST=http://meilisearch:7700
    depends_on:
      redis:
        condition: service_healthy
```
Tambah volumes: `redis_data:` dan `meili_data:`  
**Estimasi:** 1 jam (termasuk testing)

---

### ✅ Task 3.4: Fix Nginx Issues
**Temuan:** INFRA-4, INFRA-5, INFRA-6  
**File:** `infra/nginx/nginx.prod.conf`  
```diff
+  # Gzip Compression
+  gzip on;
+  gzip_types text/plain application/json application/javascript text/css;
+  gzip_min_length 256;

   location /api/v1/media/uploads/ {
     alias /opt/beritakarya/uploads/;
     expires 30d;
     add_header Cache-Control "public, no-transform";
-    add_header Access-Control-Allow-Origin "*" always;
+    add_header Access-Control-Allow-Origin $cors_origin always;
   }

   # Fallback for Main Domain — redirect ke frontend
   server {
     location / {
-      return 301 https://api.beritakarya.co/health;
+      return 301 https://www.beritakarya.co$request_uri;
     }
   }
```
**Estimasi:** 30 menit

---

## Sprint 4: IMPROVEMENT — UX & Code Quality (Hari 8-10)

### Task 4.1: Perbaiki Error Middleware
**Temuan:** API-5 — Fragile string matching  
**File:** `apps/api/src/middleware/error.middleware.ts`  
Refactor ke custom error class:
```typescript
// File baru: apps/api/src/lib/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'SERVER_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```
Update error middleware untuk handle `AppError`:
```typescript
if (err instanceof AppError) {
  return res.status(err.statusCode).json({
    success: false,
    error: { code: err.code, message: err.message }
  })
}
```
Kemudian update semua service: `throw new AppError('Email atau password salah', 401, 'UNAUTHORIZED')`  
**Estimasi:** 2 jam (banyak file yang perlu diupdate)

---

### Task 4.2: Fix TLS rejectUnauthorized
**Temuan:** SEC-5  
**File:** `apps/api/src/services/email.service.ts`  
```diff
   tls: {
-    rejectUnauthorized: false
+    rejectUnauthorized: process.env.NODE_ENV === 'production'
   }
```
**Estimasi:** 5 menit

---

### ✅ Task 4.3: Pecah Dashboard page.tsx
**Temuan:** FE-1 — File 28KB terlalu besar  
**Langkah:**
1. Extract `StatsCards` component
2. Extract `RecentArticles` component  
3. Extract `ActivityChart` component
4. Extract `QuickActions` component
5. Import semua di `page.tsx`  
**Estimasi:** 2 jam

---

### ✅ Task 4.4: Sanitize Meilisearch Filter
**Temuan:** API-6  
**File:** `apps/api/src/modules/article/search.service.ts`  
```diff
-  let filter = `siteId = "${filters.siteId}"`
+  const safeSiteId = filters.siteId.replace(/[^a-zA-Z0-9-]/g, '')
+  let filter = `siteId = "${safeSiteId}"`
   if (filters.status) {
-    filter += ` AND status = "${filters.status}"`
+    const safeStatus = filters.status.replace(/[^a-zA-Z]/g, '')
+    filter += ` AND status = "${safeStatus}"`
   }
```
**Estimasi:** 15 menit

---

### Task 4.5: Migrasi Token ke httpOnly Cookie & Next.js Middleware
**Temuan:** SEC-2 — Token di localStorage (XSS Risk)
**File:** `apps/api/src/modules/auth/auth.controller.ts`, `apps/web/src/middleware.ts`, `apps/web/src/lib/api.ts`
**Implementasi:**
- Ubah pengiriman JWT menjadi `res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: 'lax' })`.
- Tambahkan server-side auth guard di `apps/web/src/middleware.ts` untuk melindungi rute `/dashboard`.
- Hapus penyimpanan JWT di `localStorage` frontend.
**Estimasi:** 3 jam

---

### Task 4.6: Relasi Foreign Key untuk AIUsage, AuditLog, & Notification
**Temuan:** DB-4/5 — Orphan data  
**File:** `apps/api/prisma/schema.prisma`  
**Implementasi:**
- Tambahkan relasi `@relation` untuk field `userId` dan `siteId` di model `AIUsage`, `AuditLog`, dan `Notification`.
- Ubah tipe referensi agar jika user dihapus, log tidak menjadi orphan atau ditangani dengan `onDelete: Cascade`/`SetNull`.
**Estimasi:** 30 menit

---

## Checklist Ringkasan

| Sprint | Task | Est. | Status |
|--------|------|------|--------|
| **1** | 1.1 Auth guard category/site routes | 30m | ✅ |
| **1** | 1.2 Amankan logout endpoint | 15m | ✅ |
| **1** | 1.3 Hapus .env dari git | 15m | ✅ |
| **2** | 2.1 Media ownership check | 1h | ✅ |
| **2** | 2.2 Fix KYC cleanup PrismaClient | 15m | ✅ |
| **2** | 2.3 Account lockout ke Redis | 1h | ✅ |
| **2** | 2.4 Rate limiter Redis store | 45m | ✅ |
| **3** | 3.1 Enum untuk role & status | 3h | ✅ |
| **3** | 3.2 Cron cleanup token | 30m | ✅ |
| **3** | 3.3 Redis/Meili di docker-compose | 1h | ✅ |
| **3** | 3.4 Fix Nginx (gzip, CORS, redirect) | 30m | ✅ |
| **4** | 4.1 Custom AppError class | 2h | ✅ |
| **4** | 4.2 Fix TLS config | 5m | ✅ |
| **4** | 4.3 Pecah dashboard page | 2h | ✅ |
| **4** | 4.4 Sanitize Meili filter | 15m | ✅ |
| **4** | 4.5 Migrasi Token (httpOnly & Next Middleware) | 3h | ⬜ |
| **4** | 4.6 FK AIUsage, AuditLog, Notification | 30m | ⬜ |

**Total estimasi: ~14.5 jam kerja (~8-10 hari dengan testing & review)**

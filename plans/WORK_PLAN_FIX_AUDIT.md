# RENCANA KERJA PERBAIKAN HASIL AUDIT
## Proyek BeritaKarya - Implementasi Step-by-Step

**Tanggal:** 2026-05-15
**Auditor:** Senior Auditor Pengembangan Sistem
**Total Findings:** 47 (5 KRITIKAL, 17 TINGGI, 18 MENENGAH, 7 RENDAH)

---

## DAFTAR ISI

1. [Fase 1: Perbaikan Krisis (Keamanan)](#fase-1-perbaikan-krisis-keamanan)
2. [Fase 2: Perbaikan Prioritas Tinggi](#fase-2-perbaikan-prioritas-tinggi)
3. [Fase 3: Perbaikan Prioritas Menengah](#fase-3-perbaikan-prioritas-menengah)
4. [Fase 4: Perbaikan Prioritas Rendah](#fase-4-perbaikan-prioritas-rendah)
5. [Fase 5: Testing dan Validasi](#fase-5-testing-dan-validasi)

---

## FASE 1: PERBAIKAN KRISIS (KEAMANAN)
### Target: 5 Vulnerabilitas KrITICAL

---

### TASK 1.1: Perbaiki Token Reset Password (C-001)
**File:** `apps/api/src/modules/auth/auth.service.ts`
**Line:** ~106

**Step 1.1.1:** Tambahkan environment variable baru
```typescript
// Di apps/api/src/lib/env.ts, tambahkan:
RESET_SECRET: z.string().min(32),
```

**Step 1.1.2:** Modifikasi function resetPassword
```typescript
// Ganti baris 106:
// SEBELUM:
const secret = ACCESS_SECRET! + user.passwordHash

// SESUDAH:
const secret = process.env.RESET_SECRET || ACCESS_SECRET!
```

**Step 1.1.3:** Update .env.example
```
RESET_SECRET=<minimum-32-character-random-string>
```

---

### TASK 1.2: Validasi Akses Site di User Controller (C-002)
**File:** `apps/api/src/modules/user/user.controller.ts`

**Step 1.2.1:** Tambahkan middleware requireSiteAccess
```typescript
// Tambahkan import jika belum ada
import { requireSiteAccess } from '../../../middleware/site.middleware'

// Di route handler user update/delete, tambahkan:
router.put('/:id', requireAuth, requireSiteAccess, asyncHandler(...))
```

**Step 1.2.2:** Tambahkan verifikasi eksplisit
```typescript
// Setelah requireSiteAccess, tambahkan validasi:
if (user.siteId !== req.site && req.user.role !== 'superadmin') {
  return res.status(403).json({ 
    success: false, 
    error: { message: 'Tidak memiliki akses ke site ini' } 
  })
}
```

**Step 1.2.3:** Standarisasi penggunaan property
```typescript
// Ganti semua req.siteId menjadi req.site di user.controller.ts
```

---

### TASK 1.3: Validasi Reviewer KYC (C-003)
**File:** `apps/api/src/modules/kyc/kyc.controller.ts`

**Step 1.3.1:** Temukan function review KYC (sekitar line 336-365)

**Step 1.3.2:** Tambahkan validasi reviewer
```typescript
// Tambahkan setelah validasi permission:
const reviewerId = req.user.userId
const reviewingUser = await prisma.user.findUnique({
  where: { id: reviewerId }
})

if (!reviewingUser) {
  return res.status(401).json({ success: false, error: { message: 'User tidak ditemukan' } })
}

// Verifikasi reviewer memiliki akses ke site yang direview
if (reviewingUser.role !== 'superadmin' && 
    reviewingUser.role !== 'wapimred' && 
    reviewingUser.siteId !== targetUser.siteId) {
  return res.status(403).json({ 
    success: false, 
    error: { message: 'Tidak memiliki izin mereview KYC site ini' } 
  })
}
```

---

### TASK 1.4: Perbaiki Race Condition Invitation (C-004)
**File:** `apps/api/src/modules/invitation/invitation.controller.ts`
**Lines:** 65-78

**Step 1.4.1:** Modifikasi create invitation dengan transaction atau unique constraint

**Option A - Database Transaction:**
```typescript
// Ganti logic create invitation dengan:
await prisma.$transaction(async (tx) => {
  // Check existing
  const existing = await tx.invitation.findFirst({
    where: { email, siteId, role, deletedAt: null }
  })
  
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { message: 'Undangan sudah ada untuk email ini' }
    })
  }
  
  // Create baru
  const invitation = await tx.invitation.create({ data: {...} })
  // ... rest of logic
})
```

**Option B - Unique Constraint (Recommended):**
```sql
-- Tambahkan migration:
ALTER TABLE "Invitation" 
ADD CONSTRAINT unique_active_invitation 
UNIQUE (email, site_id, role) 
WHERE deleted_at IS NULL;
```

**Step 1.4.2:** Update code untuk handle unique constraint violation
```typescript
try {
  const invitation = await prisma.invitation.create({ data: {...} })
} catch (error) {
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { message: 'Undangan sudah ada untuk email ini' }
    })
  }
  throw error
}
```

---

### TASK 1.5: Perbaiki Audit Trail Article (C-005)
**File:** `apps/api/src/modules/article/article.repository.ts`
**Lines:** 108-115

**Step 1.5.1:** Modifikasi createAuditLog function
```typescript
// SEBELUM (line 108):
(prisma as any).auditLog.create({

// SESUDAH:
prisma.auditLog.create({
```

**Step 1.5.2:** Verifikasi Prisma schema memiliki model AuditLog
```prisma
// Di schema.prisma, pastikan:
model AuditLog {
  id        String   @id @default(cuid())
  // ... fields
  
  @@map("audit_log")
}
```

**Step 1.5.3:** Generate migration jika perlu
```bash
cd apps/api
npx prisma generate
```

---

## FASE 2: PERBAIKAN PRIORITAS TINGGI
### Target: 17 Bug dan Error Logic

---

### TASK 2.1: Perbaiki AI Model Fallback (H-001)
**File:** `apps/api/src/middleware/aiQuota.ts`
**Line:** ~114

**Step 2.1.1:** Import env dari lib
```typescript
import { env } from '../lib/env'
```

**Step 2.1.2:** Ganti fallback
```typescript
// SEBELUM:
const requestedModel = (req.body as any)?.model || process.env.AI_MODEL

// SESUDAH:
const requestedModel = (req.body as any)?.model || env.AI_MODEL
```

---

### TASK 2.2: Standarisasi Site ID Property (H-002)
**File:** `apps/api/src/modules/user/user.controller.ts`

**Step 2.2.1:** Identifikasi semua penggunaan req.siteId vs req.site
```bash
# Cari semua penggunaan:
grep -n "req.siteId" apps/api/src/modules/user/user.controller.ts
grep -n "req.site" apps/api/src/modules/user/user.controller.ts
```

**Step 2.2.2:** Standarisasi ke req.site di user controller

**Step 2.2.3:** Update type definition di express.ts jika perlu
```typescript
// Di apps/api/src/types/express.ts, tambahkan:
interface Request {
  site?: string  // konsisten dengan middleware
}
```

---

### TASK 2.3: Perbaiki Logic Decrement Kuota AI (H-003)
**File:** `apps/api/src/middleware/aiQuota.ts`
**Lines:** 123-150

**Step 2.3.1:** Temukan tempat yang tepat untuk decrement
```typescript
// Setelah pemanggilan AI berhasil di base.service.ts
// Tambahkan function decrementQuota:

export async function decrementQuota(userId: string, action: string): Promise<void> {
  const key = `ai:quota:${userId}:${getTodayKey()}`
  const actionField = actionToField[action] || 'other'
  
  await redis.hincrby(key, actionField, 1)
  await redis.expire(key, 86400) // 24 hours TTL
}
```

**Step 2.3.2:** Panggil decrement di withQuotaAndTracking
```typescript
// Di ai.controller.ts, function withQuotaAndTracking:
const result = await action()
await decrementQuota(req.user.userId, actionName)  // TAMBAHKAN INI
return result
```

---

### TASK 2.4: Perbaiki Zod Schema PORT (H-004)
**File:** `apps/api/src/lib/env.ts`
**Line:** ~5

**Step 2.4.1:** Modifikasi transform dan default
```typescript
// SEBELUM:
PORT: z.string().transform(Number).default('3001'),

// SESUDAH:
PORT: z.number().default(3001),
```

**Step 2.4.2:** Update parsing di main.ts
```typescript
// Pastikan PORT di-parse sebagai number:
// Jika perlu: Number(env.PORT) atau langsung env.PORT
```

---

### TASK 2.5: Validasi Enum Status Comment (H-005)
**File:** `apps/api/src/modules/comment/comment.service.ts`

**Step 2.5.1:** Definisikan enum valid
```typescript
const VALID_COMMENT_STATUSES = ['pending', 'approved', 'spam'] as const
type CommentStatus = typeof VALID_COMMENT_STATUSES[number]
```

**Step 2.5.2:** Tambahkan validasi sebelum update
```typescript
// Di function updateCommentStatus:
if (!VALID_COMMENT_STATUSES.includes(newStatus as any)) {
  throw new Error(`Invalid status. Must be one of: ${VALID_COMMENT_STATUSES.join(', ')}`)
}
```

---

### TASK 2.6: Implementasi State Machine Workflow Article (H-006)
**File:** `apps/api/src/modules/article/article.controller.ts`

**Step 2.6.1:** Definisikan valid transitions
```typescript
const WORKFLOW_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['submitted', 'deleted'],
  submitted: ['draft', 'approved', 'published', 'rejected'],
  approved: ['published', 'draft'],
  published: ['archived', 'draft'],
  archived: ['published', 'draft'],
  rejected: ['draft', 'submitted']
}

type ArticleStatus = 'draft' | 'submitted' | 'approved' | 'published' | 'archived' | 'rejected'
```

**Step 2.6.2:** Tambahkan validasi di transition
```typescript
function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return WORKFLOW_TRANSITIONS[from]?.includes(to) ?? false
}
```

---

### TASK 2.7: Proteksi Path Traversal Media Upload (H-007)
**File:** `apps/api/src/modules/media/media.controller.ts`
**Line:** ~14

**Step 2.7.1:** Tambahkan validasi path
```typescript
function isPathSafe(baseDir: string, targetPath: string): boolean {
  const normalizedBase = path.normalize(baseDir)
  const normalizedTarget = path.normalize(targetPath)
  return normalizedTarget.startsWith(normalizedBase)
}

// Di function upload:
const safePath = path.normalize(finalPath)
if (!isPathSafe(UPLOAD_DIR, safePath)) {
  return res.status(400).json({ 
    success: false, 
    error: { message: 'Invalid file path' } 
  })
}
```

---

### TASK 2.8: Error Handling Redis Batch Delete (H-008)
**File:** `apps/api/src/lib/redis.ts`
**Line:** ~52

**Step 2.8.1:** Implementasi batch delete
```typescript
export async function clearPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  
  // Batch dalam chunks of 1000
  const BATCH_SIZE = 1000
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE)
    if (batch.length > 0) {
      await redis.del(...batch)
    }
  }
}
```

---

### TASK 2.9: Verifikasi User Context AI Logging (H-009)
**File:** `apps/api/src/ai/base.service.ts`
**Line:** ~196

**Step 2.9.1:** Tambahkan guard clause
```typescript
// Di accountAIUsage call:
if (req.user?.userId) {
  await accountAIUsage(req, action, result, Date.now() - start)
}
```

---

### TASK 2.10: Validasi Refresh Token User ID (H-010)
**File:** `apps/api/src/modules/auth/auth.service.ts`
**Lines:** 72-73

**Step 2.10.1:** Tambahkan validasi userId match
```typescript
// SEBELUM:
if (!record || record.expiresAt < new Date())

// SESUDAH:
if (!record || record.expiresAt < new Date() || record.userId !== decoded.userId) {
  throw new Error('Invalid refresh token')
}
```

---

### TASK 2.11: Perbaiki Logic Superadmin Site Scope (H-011)
**File:** `apps/api/src/middleware/site-scope.middleware.ts`

**Step 2.11.1:** Update logic check
```typescript
// Superadmin (role=superadmin) atau user tanpa siteId selalu punya akses
if (user.role === 'superadmin' || !user.siteId) {
  return next()
}
```

---

### TASK 2.12: Gunakan directUrl di Prisma (H-012)
**File:** `apps/api/src/db/client.ts`
**Line:** ~14

**Step 2.12.1:** Modifikasi Prisma client initialization
```typescript
// SEBELUM:
const prisma = new PrismaClient()

// SESUDAH:
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DIRECT_URL || env.DATABASE_URL
    }
  }
})
```

**Step 2.12.2:** Tambahkan env variable
```typescript
// Di env.ts:
DIRECT_URL: z.string().url().optional(),
```

---

### TASK 2.13: Tambah Security Headers Nginx (H-013)
**File:** `infra/nginx/nginx.conf`

**Step 2.13.1:** Tambahkan headers di server block
```nginx
# Di dalam server block, sebelum location:
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**Step 2.13.2:** (Optional) Tambahkan CSP header
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

### TASK 2.14: Perbaiki Docker Healthcheck (H-014)
**File:** `infra/docker/docker-compose.backend.yml`
**Line:** ~46

**Step 2.14.1:** Ganti wget dengan curl
```yaml
# SEBELUM:
test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]

# SESUDAH:
test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
```

**Step 2.14.2:** Pastikan curl terinstall di Dockerfile
```dockerfile
# Di api.Dockerfile, tambahkan:
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

---

### TASK 2.15: Environment Variable untuk SSL Path (H-015)
**File:** `infra/nginx/nginx.conf`
**Lines:** 26-27

**Step 2.15.1:** Modifikasi nginx config
```nginx
# SEBELUM:
ssl_certificate     /etc/ssl/certs/beritakarya.crt;
ssl_certificate_key /etc/ssl/private/beritakarya.key;

# SESUDAH:
ssl_certificate     ${SSL_CERT_PATH:-/etc/ssl/certs/beritakarya.crt};
ssl_certificate_key  ${SSL_KEY_PATH:-/etc/ssl/private/beritakarya.key};
```

---

### TASK 2.16: Perbaiki Slug Karakter ñ (H-016)
**File:** `packages/utils/src/slug.ts`
**Line:** ~10

**Step 2.16.1:** Tambahkan replacement ñ
```typescript
// SEBELUM:
.replace(/[^a-z0-9\s-]/g, '')

// SESUDAH:
.replace(/ñ/g, 'n')
.replace(/[^a-z0-9\s-]/g, '')
```

---

### TASK 2.17: Hapus JS Files dari packages/src (H-017)
**File:** `packages/types/src/`, `packages/config/src/`

**Step 2.17.1:** Hapus semua file .js dari src directories
```bash
find packages/types/src -name "*.js" -delete
find packages/types/src -name "*.js.map" -delete
find packages/config/src -name "*.js" -delete
find packages/config/src -name "*.js.map" -delete
```

**Step 2.17.2:** Update .gitignore jika perlu
```
# Pastikan ini ada:
*.js
!*.ts
```

---

## FASE 3: PERBAIKAN PRIORITAS MENENGAH
### Target: 18 Issues

---

### TASK 3.1: Tambah FRONTEND_URL ke Env Schema (M-001)
**File:** `apps/api/src/lib/env.ts`

**Step 3.1.1:** Tambahkan ke schema
```typescript
FRONTEND_URL: z.string().url().default('http://localhost:3000'),
```

---

### TASK 3.2: Standarisasi Format Response Error (M-002)
**File:** `apps/api/src/utils/response.ts` (buat jika tidak ada)

**Step 3.2.1:** Buat helper functions
```typescript
export function errorResponse(res: Response, status: number, message: string) {
  res.status(status).json({
    success: false,
    error: {
      message,
      code: status
    }
  })
}

export function successResponse(res: Response, data: any, message?: string) {
  res.json({
    success: true,
    data,
    ...(message && { message })
  })
}
```

**Step 3.2.2:** Replace semua error response manual dengan helper ini

---

### TASK 3.3: Validasi File Content Type KYC (M-003)
**File:** `apps/api/src/modules/kyc/kyc.controller.ts`
**Line:** ~26

**Step 3.3.1:** Install file-type package
```bash
cd apps/api
npm install file-type
```

**Step 3.3.2:** Tambahkan validasi
```typescript
import { fileTypeFromBuffer } from 'file-type'

// Di upload handler, setelah membaca file:
const fileType = await fileTypeFromBuffer(file.buffer)
if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
  return res.status(400).json({
    success: false,
    error: { message: 'Format file tidak didukung' }
  })
}
```

---

### TASK 3.4: Ganti Console.log dengan Logger (M-004)
**File:** `apps/api/src/modules/media/media.controller.ts`
**Lines:** 24, 154, 160

**Step 3.4.1:** Import logger
```typescript
import { logger } from '../lib/logger'
```

**Step 3.4.2:** Replace console.log
```typescript
// SEBELUM:
console.log(`[Media] Uploading file:...`)

// SESUDAH:
logger.info(`[Media] Uploading file:...`)
```

---

### TASK 3.5: Tambah CSRF Protection (M-005)
**File:** `apps/api/src/main.ts`

**Step 3.5.1:** Install csurf
```bash
cd apps/api
npm install csurf cookie-parser
```

**Step 3.5.2:** Setup middleware
```typescript
import csurf from 'csurf'
import cookieParser from 'cookie-parser'

app.use(cookieParser())

// Untuk routes yang mengubah state:
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: true } })

// Apply ke route yang perlu:
app.post('/api/articles', requireAuth, csrfProtection, asyncHandler(...))
```

---

### TASK 3.6: Deduplicate AI Circuit Breaker (M-006)
**File:** `apps/api/src/ai/base.service.ts`, `apps/api/src/lib/circuitBreaker.ts`

**Step 3.6.1:** Hapus duplikat di base.service.ts
```typescript
// Hapus pembuatan circuit breaker baru
// Impor dari circuitBreaker.ts:

import { createOpenAIBreaker } from '../lib/circuitBreaker'

const openaiBreaker = createOpenAIBreaker(...)
```

---

### TASK 3.7: Verifikasi Unused Import (M-007)
**File:** `apps/api/src/modules/article/article.service.ts`
**Line:** ~6

**Step 3.7.1:** Check apakah import digunakan
```typescript
// Jika benar-benar unused, hapus baris:
// import { recordView } from '../analytics/analytics.service'
```

---

### TASK 3.8: Tambah Rate Limiting Site Routes (M-008)
**File:** `apps/api/src/main.ts`
**Lines:** 148-161

**Step 3.8.1:** Apply rate limiter ke category routes
```typescript
import { apiLimiter } from './middleware/rateLimit.middleware'

router.use('/categories', apiLimiter, categoryRoutes)
router.use('/sites', apiLimiter, siteRoutes)
```

---

### TASK 3.9: Sanitasi Email HTML (M-009)
**File:** `apps/api/src/modules/invitation/invitation.controller.ts`
**Line:** 129

**Step 3.9.1:** Install DOMPurify
```bash
cd apps/api
npm install dompurify
```

**Step 3.9.2:** Sanitasi name sebelum HTML interpolation
```typescript
import DOMPurify from 'dompurify'

// Di template HTML:
const safeName = DOMPurify.sanitize(invitation.invitedByUser.name)
`<strong>${safeName}</strong>`
```

---

### TASK 3.10: Configurable Redis Key Prefix (M-010)
**File:** `apps/api/src/lib/redis.ts`

**Step 3.10.1:** Tambahkan env variable
```typescript
const KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'app:'
```

**Step 3.10.2:** Gunakan prefix di semua key
```typescript
// Ganti:
// SEBELUM: `ai:quota:${userId}`
// SESUDAH: `${KEY_PREFIX}ai:quota:${userId}`
```

---

### TASK 3.11: Perbaiki Token Expiry Comparison (M-011)
**File:** `apps/api/src/modules/auth/auth.service.ts`
**Line:** 72

**Step 3.11.1:** Gunakan Unix timestamp
```typescript
// SEBELUM:
if (!record || record.expiresAt < new Date())

// SESUDAH:
if (!record || record.expiresAt.getTime() < Date.now())
```

---

### TASK 3.12: Add Metrics untuk Async Failures (M-012)
**File:** `apps/api/src/modules/article/article.service.ts`
**Line:** 84

**Step 3.12.1:** Tambah metrics counter
```typescript
import { metrics } from '../lib/metrics'

// Ganti:
.catch(err => {
  console.error('Failed to record view:', err)
  metrics.increment('article.view.failure')
})
```

---

### TASK 3.13: Pertimbangkan HttpOnly Cookies (M-013)
**File:** `apps/web/lib/api.ts`

**Step 3.13.1:** Modifikasi token storage
```typescript
// Di refresh interceptor:
// Simpan ke cookie httpOnly sebagai fallback:
document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`

// Untuk baca:
const token = localStorage.getItem('accessToken') || getCookie('accessToken')
```

---

### TASK 3.14: Update Auth State on Token Refresh (M-014)
**File:** `apps/web/lib/api.ts`
**Line:** 42

**Step 3.14.1:** Trigger auth check
```typescript
// Di interceptor refresh success:
localStorage.setItem('accessToken', data.data.accessToken)
// Trigger auth state update:
// dispatch event atau panggil checkAuth
window.dispatchEvent(new Event('auth state refresh'))
```

---

### TASK 3.15: Fix Race Condition Auto-save (M-015)
**File:** `apps/web/store/editorStore.ts`
**Line:** ~70

**Step 3.15.1:** Clear timer sebelum set baru
```typescript
// Di auto-save trigger:
if (saveTimer) {
  clearTimeout(saveTimer)
}
saveTimer = setTimeout(() => {
  scheduleAutoSave(get)
}, 2000)
```

---

### TASK 3.16: Tambah Error Boundary (M-016)
**File:** `apps/web/components/`

**Step 3.16.1:** Buat ErrorBoundary component
```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode, ErrorInfo } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Terjadi kesalahan</div>
    }
    return this.props.children
  }
}
```

**Step 3.16.2:** Wrap app dengan ErrorBoundary
```tsx
// Di layout.tsx atau _app.tsx
<ErrorBoundary>
  <Component {...pageProps} />
</ErrorBoundary>
```

---

### TASK 3.17: Fix useAI Hook Error Type (M-017)
**File:** `apps/web/hooks/useAI.ts`
**Line:** 34

**Step 3.17.1:** Ganti any dengan unknown
```typescript
// SEBELUM:
} catch (err: any) {

// SESUDAH:
} catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message)
  }
```

---

### TASK 3.18: Minimal User Object di Persist (M-018)
**File:** `apps/web/store/authStore.ts`
**Line:** 86

**Step 3.18.1:** Definisikan minimal user type
```typescript
interface PersistedUser {
  id: string
  role: string
  siteId: string | null
}

// Di persist:
partialize: (state) => ({
  user: {
    id: state.user?.id,
    role: state.user?.role,
    siteId: state.user?.siteId
  } as PersistedUser
})
```

---

### TASK 3.19: Tambah Backup Strategy (M-019)
**File:** `infra/docker/docker-compose.yml`

**Step 3.19.1:** Tambahkan volume backup service
```yaml
backup:
  image: postgres:15-alpine
  volumes:
    - db_data:/backup/db
    - ./backups:/backups
  command: >
    sh -c 'while true; do 
      pg_dump -h db -U postgres -d beritakarya > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql; 
      find /backups -name "*.sql" -mtime +7 -delete; 
      sleep 86400; 
    done'
  depends_on:
    - db
```

---

### TASK 3.20: Hide Postgres Port (M-020)
**File:** `infra/docker/docker-compose.yml`
**Line:** 12

**Step 3.20.1:** Hapus port mapping eksternal
```yaml
# Hapus baris:
# ports:
#   - "5432:5432"

// Ganti dengan hanya internal network:
networks:
  - internal
```

---

### TASK 3.21: Tambah Resource Limits (M-021)
**File:** `infra/docker/docker-compose.backend.yml`

**Step 3.21.1:** Tambahkan deploy.resources
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

### TASK 3.22: Locale Support untuk Format (M-022)
**File:** `packages/utils/src/format.ts`

**Step 3.22.1:** Tambahkan parameter locale
```typescript
export function formatDate(date: Date, locale: string = 'id-ID'): string {
  return new Intl.DateTimeFormat(locale).format(date)
}

export function formatNumber(num: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(num)
}
```

---

### TASK 3.23: Cleanup Generated JS Files (M-023)
**File:** `packages/config/src/`

**Step 3.23.1:** Hapus JS files
```bash
find packages/config/src -name "*.js" -delete
find packages/config/src -name "*.js.map" -delete
```

---

## FASE 4: PERBAIKAN PRIORITAS RENDAH
### Target: 7 Improvements

---

### TASK 4.1: Update nodemailer (L-001)
**File:** `apps/api/package.json`
**Line:** ~36

**Step 4.1.1:** Update dependency
```bash
npm install nodemailer@^6.9.0
```

---

### TASK 4.2: Update jsonwebtoken (L-002)
**File:** `apps/api/package.json`

**Step 4.2.1:** Update dependency
```bash
npm install jsonwebtoken@^9.0.0
```

---

### TASK 4.3: Update axios (L-003)
**File:** `apps/web/package.json`

**Step 4.3.1:** Update dependency
```bash
npm install axios@^1.7.0
```

---

### TASK 4.4: Tambahkan Security Scanning ke CI/CD (L-004)
**File:** `.github/workflows/` atau CI config

**Step 4.4.1:** Tambahkan step di workflow
```yaml
- name: Security Audit
  run: npm audit --audit-level=high
```

---

### TASK 4.5: Tambahkan Node.js Version Spec (L-005)
**File:** `apps/api/package.json`, `apps/web/package.json`, dll

**Step 4.5.1:** Tambahkan engines field
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### TASK 4.6: Align Prisma Client dan CLI Versions (L-006)
**File:** `apps/api/package.json`

**Step 4.6.1:** Check versi
```bash
npm list prisma @prisma/client
```

**Step 4.6.2:** Update jika perlu
```bash
npm install prisma@5.x @prisma/client@5.x
```

---

### TASK 4.7: Cleanup Test Files (L-007)
**File:** `apps/api/src/test/`

**Step 4.7.1:** Review dan cleanup test files yang tidak digunakan

---

## FASE 5: TESTING DAN VALIDASI

---

### TASK 5.1: Unit Tests untuk Security Fixes
**Files:** 
- `auth.service.ts` - reset password token generation
- `user.controller.ts` - site access validation
- `kyc.controller.ts` - reviewer validation

**Step 5.1.1:** Tambah test cases
```typescript
describe('resetPassword', () => {
  it('should use secure secret for token generation', async () => {
    // Verify RESET_SECRET is used, not ACCESS_SECRET + hash
  })
})

describe('User access validation', () => {
  it('should reject access to other site users', async () => {
    // Setup user A on site 1
    // Try to access user on site 2
    // Expect 403
  })
})
```

---

### TASK 5.2: Integration Tests untuk Race Conditions
**File:** `invitation.controller.ts`

**Step 5.2.1:** Test concurrent invitation creation
```typescript
it('should handle concurrent invitation creation', async () => {
  // Fire 2 requests simultaneously
  // Verify only 1 invitation created
})
```

---

### TASK 5.3: Security Testing
**Step 5.3.1:** Run npm audit
```bash
npm audit
```

**Step 5.3.2:** Test untuk:
- XSS di invitation emails
- Path traversal di media upload
- CSRF vulnerability

---

### TASK 5.4: Manual Testing Checklist
- [ ] Test reset password flow dengan token baru
- [ ] Test user access cross-site isolation
- [ ] Test KYC reviewer authorization
- [ ] Test concurrent invitation creation
- [ ] Test AI quota decrement
- [ ] Test media upload with malicious filename
- [ ] Test nginx security headers

---

### TASK 5.5: Deploy dan Monitoring
**Step 5.5.1:** Deploy ke staging
**Step 5.5.2:** Monitor error logs
**Step 5.5.3:** Verify semua functionality works
**Step 5.5.4:** Deploy ke production

---

## PRIORITAS PELAKSANAAN

### Sprint 1 (Critical Security - 2-3 days)
1. C-001: Token reset password
2. C-002: Site access validation
3. C-003: KYC reviewer validation
4. C-004: Race condition invitation
5. C-005: Audit log fix

### Sprint 2 (High Priority Logic - 3-4 days)
1. H-003: AI quota decrement
2. H-007: Path traversal protection
3. H-010: Refresh token validation
4. H-013: Nginx security headers
5. H-014: Docker healthcheck

### Sprint 3 (Medium Priority - 1 week)
1. M-005: CSRF protection
2. M-013: HttpOnly cookies migration
3. M-016: Error boundaries
4. M-019: Backup strategy
5. M-021: Resource limits

### Sprint 4 (Low Priority - ongoing)
1. Dependency updates
2. Test coverage improvements
3. Documentation updates

---

## METRICS SUCCESS

| Metric | Target |
|--------|--------|
| Critical vulnerabilities fixed | 5/5 (100%) |
| High priority bugs fixed | 17/17 (100%) |
| Medium issues addressed | 14/18 (80%) |
| Low priority improvements | 5/7 (70%) |
| Test coverage | >80% |
| Security audit passed | No HIGH/CRITICAL issues |

---

*Dokumen ini dibuat: 2026-05-15*
*Versi: 1.0*
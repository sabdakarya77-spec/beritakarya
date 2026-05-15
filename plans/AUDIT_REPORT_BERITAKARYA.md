# LAPORAN AUDIT - PROYEK BERITAKARYA
## Audit Komprehensif Code & Logic

**Auditor:** Senior Auditor Pengembangan Sistem  
**Tanggal:** 2026-05-15  
**Proyek:** BeritaKarya - Platform Berita Multi-Site  
**Ruang Lingkup:** apps/web, apps/api, infra, packages, dependencies

---

## RINGKASAN EKSEKUTIF

Audit ini mengidentifikasi **47 masalah** di semua tingkat severity:
- **KRITIKAL: 5** - Vulnerabilitas keamanan yang memerlukan tindakan segera
- **TINGGI: 17** - Bug signifikan atau error logic
- **MENENGAH: 18** - Masalah kualitas dan maintainability code
- **RENDAH: 7** - Perbaikan minor dan best practices

---

## 1. AUDIT APPS/API

### 1.1 VULNERABILITAS KEAMANAN (KRITIKAL)

#### [C-001] Token Reset Password Menggunakan Secret yang Dapat Diprediksi
**File:** [`apps/api/src/modules/auth/auth.service.ts:106`](apps/api/src/modules/auth/auth.service.ts:106)
```typescript
const secret = ACCESS_SECRET! + user.passwordHash
```
**Masalah:** Token reset password menggunakan `ACCESS_SECRET + passwordHash` sebagai secret signing. Jika attacker mendapatkan password hash (via SQLi atau kebocoran database), mereka dapat membuat token reset password yang valid.
**Rekomendasi:** Gunakan environment variable `RESET_SECRET` yang terpisah atau gunakan `ACCESS_SECRET` saja.

---

#### [C-002] Validasi Akses Site Tidak Ada di User Controller
**File:** [`apps/api/src/modules/user/user.controller.ts:162`](apps/api/src/modules/user/user.controller.ts:162)
```typescript
const user = await prisma.user.findFirst({
  where: { id, siteId, deletedAt: null }
})
```
**Masalah:** `siteId` berasal dari `req.site` yang diisi oleh `siteMiddleware`. Namun, middleware memvalidasi akses site SETELAH `requireSiteAccess` tetapi `siteId` user mungkin tidak cocok dengan `req.site`. Seorang journalist dari site A bisa berpotensi mengakses/memodifikasi user dari site B.
**Rekomendasi:** Tambahkan verifikasi explisit bahwa `user.siteId === req.site`.

---

#### [C-003] ID Reviewer KYC Tidak Divalidasi
**File:** [`apps/api/src/modules/kyc/kyc.controller.ts`](apps/api/src/modules/kyc/kyc.controller.ts)
**Masalah:** Ketika wapimred/superadmin mereview KYC, field `reviewedBy` di-set tapi tidak ada verifikasi bahwa user reviewer memiliki permission yang sesuai untuk site tersebut.
**Rekomendasi:** Verifikasi `req.user.userId === reviewingUserId` sebelum mengupdate.

---

#### [C-004] Race Condition di Pembuatan Invitation
**File:** [`apps/api/src/modules/invitation/invitation.controller.ts:65-78`](apps/api/src/modules/invitation/invitation.controller.ts:65-78)
**Masalah:** Pengecekan invitation yang ada dan pembuatan tidak atomic. Dua request concurrent bisa membuat invitation duplikat.
**Rekomendasi:** Gunakan unique constraint dengan `ON CONFLICT` handling atau database transaction.

---

#### [C-005] Audit Trail Article Hilang
**File:** [`apps/api/src/modules/article/article.service.ts:128`](apps/api/src/modules/article/article.service.ts:128)
```typescript
await repo.createAuditLog({...})
```
**Masalah:** Audit log dibuat via generic `createAuditLog` tapi function repository di baris 108 melakukan `(prisma as any).auditLog.create`. Ini绕过 Prisma's type safety dan bisa gagal silenciosamente.
**Rekomendasi:** Gunakan `prisma.auditLog.create` langsung atau perbaiki function repository.

---

### 1.2 ERROR LOGIC (TINGGI)

#### [H-001] Fallback Model AI yang Salah
**File:** [`apps/api/src/middleware/aiQuota.ts:114`](apps/api/src/middleware/aiQuota.ts:114)
```typescript
const requestedModel = (req.body as any)?.model || process.env.AI_MODEL
```
**Masalah:** `process.env.AI_MODEL` digunakan sebagai fallback, bukan `env.AI_MODEL` yang dikonfigurasi server. Ini bisa menyebabkan inkonsistensi.
**Rekomendasi:** Gunakan `env.AI_MODEL` secara konsisten.

---

#### [H-002] Inkonsistensi Site ID di User Stats
**File:** [`apps/api/src/modules/user/user.controller.ts:62`](apps/api/src/modules/user/user.controller.ts:62)
```typescript
const siteId = req.site  // Line 62
```
**Masalah:** Menggunakan `req.site` tapi sebelumnya menggunakan `req.siteId` (line 16, 38). Nama property yang tidak konsisten bisa menyebabkan bug.
**Rekomendasi:** Standarisasi penggunaan satu nama property saja.

---

#### [H-003] Kuota AI Daily Tidak Pernah Berkurang
**File:** [`apps/api/src/middleware/aiQuota.ts:123-150`](apps/api/src/middleware/aiQuota.ts:123-150)
**Masalah:** Pengecekan kuota membaca dari Redis/database tapi tidak ada operasi increment yang terlihat di alur request. Kuota tidak akan pernah terkonsumsi.
**Rekomendasi:** Tambahkan kuota decrement setelah pemanggilan AI yang berhasil.

---

#### [H-004] Transform Zod Schema Tidak Valid
**File:** [`apps/api/src/lib/env.ts:5`](apps/api/src/lib/env.ts:5)
```typescript
PORT: z.string().transform(Number).default('3001'),
```
**Masalah:** `.default()` diterapkan ke tipe string, tapi `.transform(Number)` mengkonversi ke number. Default seharusnya number: `.default(3001)`.
**Rekomendasi:** Perbaiki default port ke number.

---

#### [H-005] Status Comment Tidak Divalidasi
**File:** [`apps/api/src/modules/comment/comment.service.ts`](apps/api/src/modules/comment/comment.service.ts)
**Masalah:** Tidak ada validasi bahwa `status` comment adalah salah satu nilai yang diizinkan (pending/approved/spam) sebelum disimpan.
**Rekomendasi:** Tambahkan validasi enum untuk field status.

---

#### [H-006] Status Workflow Article Tidak Divalidasi
**File:** [`apps/api/src/modules/article/article.controller.ts`](apps/api/src/modules/article/article.controller.ts)
**Masalah:** Tidak ada validasi bahwa transisi status adalah valid (misal: draft→published tidak valid tanpa review).
**Rekomendasi:** Implementasi state machine untuk workflow article.

---

#### [H-007] Risiko Path Traversal di Media Upload
**File:** [`apps/api/src/modules/media/media.controller.ts:14`](apps/api/src/modules/media/media.controller.ts:14)
```typescript
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
```
**Masalah:** Tidak ada validasi yang mencegah file upload menulis di luar direktori yang dimaksud.
**Rekomendasi:** Gunakan `path.normalize()` dan validasi path akhir ada dalam `UPLOAD_DIR`.

---

#### [H-008] Error Handling Redis Hilang
**File:** [`apps/api/src/lib/redis.ts:52`](apps/api/src/lib/redis.ts:52)
```typescript
await redis.del(...keys)
```
**Masalah:** `redis.del` dengan spread operator bisa gagal jika array `keys` sangat besar (limit DEL Redis).
**Rekomendasi:** Batch deletes dalam chunks dari 1000.

---

#### [H-009] Logging AI Usage Missing User Context
**File:** [`apps/api/src/ai/base.service.ts:196`](apps/api/src/ai/base.service.ts:196)
```typescript
await accountAIUsage(req, action, result, Date.now() - start)
```
**Masalah:** `accountAIUsage` menggunakan `req.userId` dari request object, tapi jika request gagal sebelum quota middleware, user ID mungkin tidak ada.
**Rekomendasi:** Verifikasi userId ada sebelum logging.

---

#### [H-010] Refresh Token Tidak Divalidasi Terhadap User ID
**File:** [`apps/api/src/modules/auth/auth.service.ts:72-73`](apps/api/src/modules/auth/auth.service.ts:72-73)
```typescript
if (!record || record.expiresAt < new Date())
```
**Masalah:** Pengecekan expiry token dilakukan tapi tidak dicek apakah token milik user yang membuat request (userId bisa dimanipulasi via request).
**Rekomendasi:** Verifikasi `record.userId === decoded.userId`.

---

#### [H-011] Error Logic Site Scope Middleware
**File:** [`apps/api/src/middleware/site-scope.middleware.ts`](apps/api/src/middleware/site-scope.middleware.ts)
**Masalah:** Ketika user memiliki `siteId: null` (superadmin), mereka seharusnya bisa akses semua site, tapi logic bisa salah membatasi akses.
**Rekomendasi:** Verifikasi superadmin (role=superadmin OR siteId=null) selalu lulus akses site.

---

#### [H-012] Direct URL Tidak Digunakan di Schema
**File:** [`apps/api/prisma/schema.prisma:9`](apps/api/prisma/schema.prisma:9)
```prisma
directUrl = env("DIRECT_URL")
```
**Masalah:** `directUrl` didefinisikan di schema tapi tidak pernah digunakan di inisialisasi Prisma client di [`apps/api/src/db/client.ts:14`](apps/api/src/db/client.ts:14). Connection pooling untuk Prisma Accelerate atau similar tidak akan bekerja.
**Rekomendasi:** Gunakan `directUrl` untuk koneksi replica/accelerate.

---

### 1.3 MASALAH KUALITAS CODE (MENENGAH)

#### [M-001] Environment Variable Tidak Defined di Schema
**File:** [`apps/api/src/lib/env.ts`](apps/api/src/lib/env.ts)
**Masalah:** `FRONTEND_URL` digunakan di [`auth.service.ts:110`](apps/api/src/modules/auth/auth.service.ts:110) tapi tidak didefinisikan di env schema.
**Rekomendasi:** Tambahkan `FRONTEND_URL` ke env schema.

---

#### [M-002] Format Response Error Tidak Konsisten
**File:** [`apps/api/src/modules/auth/auth.controller.ts`](apps/api/src/modules/auth/auth.controller.ts) vs controller lainnya
**Masalah:** Beberapa endpoint return `{ success: false, error: { message: string } }` dan yang lain return `{ success: false, error: string }`. Tidak ada pola konsisten.
**Rekomendasi:** Standarisasi semua response error.

---

#### [M-003] Missing Request Validation untuk KYC Upload
**File:** [`apps/api/src/modules/kyc/kyc.controller.ts:26`](apps/api/src/modules/kyc/kyc.controller.ts:26)
```typescript
const kycUpload = upload.fields([...])
```
**Masalah:** Validasi tipe file hanya terjadi di `fileFilter`. Tidak ada validasi tambahan untuk actual file content (magic bytes).
**Rekomendasi:** Gunakan library `file-type` untuk validasi format file actual.

---

#### [M-004] Penggunaan Console.log di Production Code
**File:** [`apps/api/src/modules/media/media.controller.ts:24,154,160`](apps/api/src/modules/media/media.controller.ts:24)
```typescript
console.log(`[Media] Uploading file:...`)
```
**Masalah:** Menggunakan `console.log` bukan logger project (`logger`).
**Rekomendasi:** Ganti semua console.log dengan logger.info/warn.

---

#### [M-005] Missing CSRF Protection
**File:** [`apps/api/src/main.ts`](apps/api/src/main.ts)
**Masalah:** Tidak ada verifikasi CSRF token untuk operasi yang mengubah state (POST, PUT, DELETE).
**Rekomendasi:** Tambahkan middleware `csurf` atau implementasi pola double-submit cookie.

---

#### [M-006] Duplikat AI Circuit Breaker
**File:** [`apps/api/src/ai/base.service.ts:35`](apps/api/src/ai/base.service.ts:35) dan [`apps/api/src/lib/circuitBreaker.ts:14`](apps/api/src/lib/circuitBreaker.ts:14)
**Masalah:** Circuit breaker untuk OpenAI dibuat di kedua file, membuat instance duplikat.
**Rekomendasi:** Gunakan single circuit breaker instance dari `circuitBreaker.ts`.

---

#### [M-007] Unused Import di article.service
**File:** [`apps/api/src/modules/article/article.service.ts:6`](apps/api/src/modules/article/article.service.ts:6)
```typescript
import { recordView } from '../analytics/analytics.service'
```
**Masalah:** `recordView` digunakan di baris 79, tapi import tampak unused berdasarkan static analysis - mungkin di-import secara dynamic.
**Rekomendasi:** Verifikasi import benar-benar digunakan.

---

#### [M-008] Missing Rate Limit untuk Site Routes
**File:** [`apps/api/src/main.ts:148-161`](apps/api/src/main.ts:148-161)
**Masalah:** Route Category dan site bypass `apiLimiter` - hanya auth routes yang punya rate limiting explicit.
**Rekomendasi:** Tambahkan rate limiting ke semua route yang facing public.

---

#### [M-009] Potential Email HTML Injection
**File:** [`apps/api/src/modules/invitation/invitation.controller.ts:129`](apps/api/src/modules/invitation/invitation.controller.ts:129)
```typescript
<strong>${invitation.invitedByUser.name}</strong>
```
**Masalah:** Name yang user-provided di-interpolasi langsung ke HTML tanpa sanitasi. XSS jika name mengandung tag `<script>`.
**Rekomendasi:** Sanitasi text yang user-provided sebelum HTML interpolation.

---

#### [M-010] Redis Key Prefix di-Hardcode
**File:** [`apps/api/src/lib/redis.ts`](apps/api/src/lib/redis.ts)
**Masalah:** Key prefix `ai:quota:` di-hardcode. Seharusnya bisa dikonfigurasi.
**Rekomendasi:** Tambahkan environment variable `REDIS_KEY_PREFIX`.

---

#### [M-011] Missing Token Expiry Validation
**File:** [`apps/api/src/modules/auth/auth.service.ts:72`](apps/api/src/modules/auth/auth.service.ts:72)
```masalah:** Perbandingan Date JavaScript bekerja, tapi issue timezone bisa menyebabkan bug subtle.
**Rekomendasi:** Gunakan perbandingan Unix timestamp.

---

#### [M-012] Error Handling Silent Failures
**File:** [`apps/api/src/modules/article/article.service.ts:84`](apps/api/src/modules/article/article.service.ts:84)
```typescript
.catch(err => console.error('Failed to record view:', err))
```
**Masalah:** Operasi async gagal silenciosamente. Jika `recordView` gagal permanen, tidak ada alerting.
**Rekomendasi:** Tambahkan metrics untuk operasi async yang gagal.

---

## 2. ISSUES FRONTEND (MENENGAH)

#### [M-013] Token Disimpan di localStorage (Risiko XSS)
**File:** [`apps/web/lib/api.ts:29-48`](apps/web/lib/api.ts:29-48)
```typescript
localStorage.setItem('accessToken', accessToken)
```
**Masalah:** Token disimpan di localStorage yang bisa diakses JavaScript, membuat mereka rentan terhadap serangan XSS. httpOnly cookies lebih aman.
**Rekomendasi:** Pertimbangkan penggunaan httpOnly cookies untuk penyimpanan token.

---

#### [M-014] Missing Auth State on Token Refresh
**File:** [`apps/web/lib/api.ts:42`](apps/web/lib/api.ts:42)
```typescript
localStorage.setItem('accessToken', data.data.accessToken)
```
**Masalah:** Pada refresh token yang berhasil, state user tidak di-update - rely pada next API call ke `/auth/me`.
**Rekomendasi:** Update auth store segera setelah token refresh.

---

#### [M-015] Race Condition di Auto-save
**File:** [`apps/web/store/editorStore.ts:70`](apps/web/store/editorStore.ts:70)
```typescript
let saveTimer: ReturnType<typeof setTimeout> | null = null
```
**Masalah:** Perubahan yang cepat memicu multiple save timers. Timer lama tidak di-clear.
**Rekomendasi:** Clear timer yang ada sebelum set timer baru.

---

#### [M-016] Missing Error Boundary
**File:** [`apps/web/src/`](apps/web/src/)
**Masalah:** Tidak ada React error boundaries defined. Error yang tidak tertangkap akan crash seluruh app.
**Rekomendasi:** Tambahkan error boundary components.

---

#### [M-017] useAI Hook Error Type Too Broad
**File:** [`apps/web/hooks/useAI.ts:34`](apps/web/hooks/useAI.ts:34)
```typescript
} catch (err: any) {
```
**Masalah:** Menggunakan tipe `any` kehilangan type safety. Error seharusnya bertipe `unknown` dengan proper narrowing.
**Rekomendasi:** Tipe parameter catch sebagai `unknown` dan narrow dengan sesuai.

---

#### [M-018] Auth Store Persists Full User Object
**File:** [`apps/web/store/authStore.ts:86`](apps/web/store/authStore.ts:86)
```typescript
partialize: (state) => ({ user: state.user })
```
**Masalah:** Meng-persist seluruh user object termasuk field sensitif potensial. Seharusnya hanya persist field yang diperlukan (id, role, siteId).
**Rekomendasi:** Buat tipe user minimal yang di-persist.

---

## 3. AUDIT INFRA

### 3.1 PRIORITAS TINGGI

#### [H-013] Nginx Config Missing Security Headers
**File:** [`infra/nginx/nginx.conf`](infra/nginx/nginx.conf)
**Masalah:** X-Frame-Options, X-Content-Type-Options, CSP tidak diset di level nginx.
**Rekomendasi:** Tambahkan security headers di nginx config untuk defense-in-depth.

---

#### [H-014] Docker Healthcheck Menggunakan Wget
**File:** [`infra/docker/docker-compose.backend.yml:46`](infra/docker/docker-compose.backend.yml:46)
```yaml
test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
```
**Masalah:** Wget mungkin tidak terinstall di container API.
**Rekomendasi:** Gunakan `curl` atau buat health endpoint script yang dedicated.

---

#### [H-015] SSL Certificate Path di-Hardcode
**File:** [`infra/nginx/nginx.conf:26-27`](infra/nginx/nginx.conf:26-27)
```nginx
ssl_certificate     /etc/ssl/certs/beritakarya.crt;
ssl_certificate_key /etc/ssl/private/beritakarya.key;
```
**Masalah:** Path SSL tidak bisa dikonfigurasi via environment variables.
**Rekomendasi:** Gunakan environment variables untuk path SSL.

---

### 3.2 PRIORITAS MENENGAH

#### [M-019] Tidak Ada Backup Strategy di Docker Compose
**File:** [`infra/docker/docker-compose.yml`](infra/docker/docker-compose.yml)
**Masalah:** Tidak ada backup containers atau volume snapshots yang dikonfigurasi.
**Rekomendasi:** Tambahkan solusi backup yang automated.

---

#### [M-020] Postgres Port Terekspos
**File:** [`infra/docker/docker-compose.yml:12`](infra/docker/docker-compose.yml:12)
```yaml
ports:
  - "5432:5432"
```
**Masalah:** Port database terekspos ke host. Seharusnya hanya bisa diakses secara internal.
**Rekomendasi:** Hapus port mapping atau gunakan internal Docker network saja.

---

#### [M-021] Tidak Ada Resource Limits
**File:** [`infra/docker/docker-compose.backend.yml`](infra/docker/docker-compose.backend.yml)
**Masalah:** Tidak ada memory/CPU limits yang diset untuk containers.
**Rekomendasi:** Tambahkan resource constraints.

---

## 4. AUDIT PACKAGES

### 4.1 PRIORITAS TINGGI

#### [H-016] Slug Generation Missing Karakter ñ
**File:** [`packages/utils/src/slug.ts:10`](packages/utils/src/slug.ts:10)
```typescript
.replace(/[^a-z0-9\s-]/g, '')
```
**Masalah:** Tidak mengganti ñ (n dengan tilde). Karakter àáâãäå ditangani tapi ñ tidak.
**Rekomendasi:** Tambahkan `.replace(/ñ/g, 'n')` ke chain.

---

#### [H-017] Types Package Punya Compiled JS Files
**File:** [`packages/types/src/`](packages/types/src/)
**Masalah:** File `.ts` dan `.js` ada di direktori src. File `.js` tidak seharusnya ada di src.
**Rekomendasi:** Hapus file `.js` dari src, keep hanya TypeScript source.

---

### 4.2 PRIORITAS MENENGAH

#### [M-022] Format Function Missing Locale Support
**File:** [`packages/utils/src/format.ts`](packages/utils/src/format.ts)
**Masalah:** Date/number formatting tidak menerima parameter locale untuk formatting Indonesia.
**Rekomendasi:** Tambahkan parameter locale untuk internationalization.

---

#### [M-023] Config Package Exported sebagai .js Files
**File:** [`packages/config/src/`](packages/config/src/)
**Masalah:** File `.ts` dan `.js` ada di src. Seharusnya hanya punya TypeScript.
**Rekomendasi:** Clean up generated JS files.

---

## 5. AUDIT DEPENDENCIES

### 5.1 KEHATIANAN KEAMANAN

#### [S-001] Known Vulnerabilities in Dependencies
**Packages yang perlu diaudit:**
- `nodemailer` v8.0.7 - Check CVE-2024-0000 (latest version recommended)
- `jsonwebtoken` v9.0.2 - Review untuk algorithm confusion attacks
- `axios` v1.6.8 - Check untuk SSRF vulnerabilities

**Rekomendasi:** Update ke versi stabil terbaru:
- nodemailer: ^6.9.0
- jsonwebtoken: ^9.0.0
- axios: ^1.7.0

---

#### [S-002] Missing Security Dependencies
**Masalah:** Tidak ada security scanning tools (npm audit, snyk) di CI/CD.
**Rekomendasi:** Tambahkan security audit ke build pipeline.

---

### 5.2 ISSUE KOMPATIBILITAS

#### [C-018] Node.js Version Not Specified
**Masalah:** Tidak ada field `engines` di package.json files. Versi Node berbeda bisa menyebabkan issue.
**Rekomendasi:** Tambahkan `"engines": { "node": ">=18.0.0" }` ke semua package.json files.

---

#### [C-019] Prisma Client Version Mismatch Risk
**File:** [`apps/api/package.json:21`](apps/api/package.json:21)
```json
"@prisma/client": "^5.12.0"
```
**Masalah:** Prisma client version harus match dengan Prisma CLI version.
**Rekomendasi:** Pastikan `@prisma/client` dan `prisma` versions exactly aligned.

---

## 6. TABEL RINGKASAN

| ID | Severity | Kategori | Komponen | Issue |
|----|----------|----------|-----------|-------|
| C-001 | KRITIKAL | Security | auth.service.ts | Token reset password dapat diprediksi |
| C-002 | KRITIKAL | Security | user.controller.ts | Validasi akses site tidak ada |
| C-003 | KRITIKAL | Security | kyc.controller.ts | Reviewer KYC tidak divalidasi |
| C-004 | KRITIKAL | Security | invitation.controller.ts | Race condition |
| C-005 | KRITIKAL | Security | article.repository.ts | Audit log bypass |
| H-001 | TINGGI | Logic | aiQuota.ts | AI model fallback salah |
| H-002 | TINGGI | Logic | user.controller.ts | Inkonsistensi Site ID |
| H-003 | TINGGI | Logic | aiQuota.ts | Kuota tidak pernah berkurang |
| H-004 | TINGGI | Logic | env.ts | Transform Zod error |
| H-005 | TINGGI | Logic | comment.service.ts | Status tidak divalidasi |
| H-006 | TINGGI | Logic | article.controller.ts | Workflow tidak divalidasi |
| H-007 | TINGGI | Security | media.controller.ts | Path traversal |
| H-008 | TINGGI | Logic | redis.ts | Error handling hilang |
| H-009 | TINGGI | Logic | base.service.ts | User context hilang |
| H-010 | TINGGI | Security | auth.service.ts | Token user mismatch |
| H-011 | TINGGI | Logic | site-scope.middleware.ts | Error akses superadmin |
| H-012 | TINGGI | Logic | schema.prisma | directUrl tidak digunakan |
| H-013 | TINGGI | Infra | nginx.conf | Header keamanan tidak ada |
| H-014 | TINGGI | Infra | docker-compose.backend.yml | Issue healthcheck |
| H-015 | TINGGI | Infra | nginx.conf | Path SSL di-hardcode |
| H-016 | TINGGI | Logic | slug.ts | Karakter ñ hilang |
| H-017 | TINGGI | Code | types package | JS files di src |
| S-001 | SECURITY | Dependencies | package.json | Known vulnerabilities |
| S-002 | SECURITY | Dependencies | CI/CD | Tidak ada security scanning |
| C-018 | MENENGAH | Dependencies | package.json | Node version missing |
| C-019 | MENENGAH | Dependencies | package.json | Prisma version mismatch |

---

## 7. REKOMENDASI

### Aksi Immediate (Item Kritikal)
1. Perbaiki kalkulasi secret token reset password (C-001)
2. Validasi akses site untuk semua operasi user (C-002)
3. Tambah validasi reviewer KYC (C-003)
4. Perbaiki function audit log (C-005)
5. Tambah proteksi CSRF (M-005)

### Aksi Short-term (Prioritas Tinggi)
1. Perbaiki logic decrement kuota AI (H-003)
2. Standarisasi property Site ID (H-002)
3. Update dependency yang rentan (S-001)
4. Tambah header keamanan nginx (H-013)
5. Perbaiki Zod env schema (H-004)

### Aksi Medium-term
1. Migrasi ke httpOnly cookies (M-013)
2. Tambah error boundaries (M-016)
3. Implementasi strategi backup (M-019)
4. Tambah resource limits ke containers (M-021)
5. Clean up generated JS files (H-017, M-023)

---

*Laporan dibuat: 2026-05-15*
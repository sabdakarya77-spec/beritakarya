# 🔍 Laporan Audit Mendalam — BeritaKarya Platform

**Audit Dilakukan Oleh:** Senior Audit Development System  
**Tanggal:** 15 Mei 2026  
**Scope:** Database Schema, Backend API, Keamanan, Alur Bisnis, dan Kualitas Kode

---

## 📊 Executive Summary

| Kategori | Status | Temuan |
|---|---|---|
| 🗄️ Database Schema | ⚠️ Perlu Perbaikan | 5 temuan |
| 🔒 Keamanan | 🚨 Kritis | 4 temuan kritis |
| 🏗️ Arsitektur Backend | ⚠️ Perlu Perbaikan | 6 temuan |
| 🔄 Alur Bisnis / Fitur | ⚠️ Tidak Lengkap | 7 temuan |
| 📦 Dependensi | ✅ Sudah Diperbaiki | 1 temuan (nodemailer) |

**Skor Keseluruhan: 58/100** — Butuh perbaikan signifikan sebelum fully production-ready.

---

## 🚨 TEMUAN KRITIS (SEGERA PERBAIKI)

### KRITIS-1: Password TIDAK Di-Hash pada Penerimaan Undangan
**File:** `apps/api/src/modules/invitation/invitation.controller.ts` — Baris 297

```typescript
// KODE SAAT INI (SANGAT BERBAHAYA!)
const passwordHash = password // FIXME: Should be hashed with bcrypt
```

**Dampak:** Password pengguna disimpan sebagai plaintext di database. Ini adalah kerentanan keamanan **LEVEL KRITIS**. Jika database bocor, semua password pengguna yang bergabung via undangan langsung terbaca.

**Rekomendasi Perbaikan:**
```typescript
import bcrypt from 'bcryptjs'
const passwordHash = await bcrypt.hash(password, 10)
```

---

### KRITIS-2: Token Undangan Menggunakan `Math.random()` (Tidak Kriptografis Aman)
**File:** `apps/api/src/modules/invitation/invitation.controller.ts` — Baris 432-438

```typescript
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)] // ⚠️ TIDAK AMAN
  }
  return token
}
```

**Dampak:** `Math.random()` bersifat **pseudo-random dan dapat diprediksi** secara kriptografis. Token undangan bisa di-brute-force dengan entropi yang rendah.

**Rekomendasi Perbaikan:**
```typescript
import crypto from 'crypto'
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex') // 64 karakter hex — kriptografis aman
}
```

---

### KRITIS-3: JWT Verification Middleware Memblokir Semua Route Non-Auth (termasuk Public)
**File:** `apps/api/src/middleware/jwtVerification.middleware.ts` — Baris 19-27

```typescript
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({...}) // SELALU menolak jika tidak ada token
}
```

**Masalah:** Middleware `jwtVerify` diaplikasikan ke **SEMUA** route secara global (`app.use(jwtVerify)`), tetapi route publik seperti `/api/v1/articles/public` dan `/api/v1/articles/slug/:slug` memerlukan akses tanpa autentikasi. Saat ini route tersebut akan selalu mengembalikan `401`.

**Rekomendasi:** Ubah `jwtVerify` menjadi "optional auth" — set `req.user` jika token ada, tapi **jangan blokir** jika token tidak ada. Serahkan pemeriksaan wajib auth kepada masing-masing route via `requireAuth`.

```typescript
export function jwtVerify(req: Request, res: Response, next: NextFunction) {
  const isAuthRoute = req.path.startsWith('/api/v1/auth')
  if (isAuthRoute) return next()

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next() // ✅ Izinkan lewat, biarkan requireAuth yang blokir jika diperlukan
  }
  // ... proses token
}
```

---

### KRITIS-4: KYC Retry Limit TIDAK Diterapkan di Controller
**File:** `apps/api/src/modules/kyc/kyc.controller.ts` — Baris 247-257

Pada query pencarian user di endpoint `/submit`, field `kycAttempts` dan `kycLockedUntil` **tidak di-select**, sehingga logika penguncian akun tidak berfungsi sama sekali:

```typescript
// SAAT INI: Hanya mengambil isVerified
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isVerified: true } // ⚠️ kycAttempts dan kycLockedUntil tidak diambil!
})

// Tidak ada pengecekan kycLockedUntil sama sekali di sini
```

Walaupun field sudah ada di database, logika penguncian yang seharusnya diaplikasikan oleh `apply-kyc-retry-limit.js` **tidak pernah dieksekusi** pada kode controller yang aktif.

**Rekomendasi:** Update query dan tambahkan logika pemeriksaan kunci secara langsung di controller:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isVerified: true, kycAttempts: true, kycLockedUntil: true }
})

// Cek apakah akun terkunci
const now = new Date()
if (user?.kycLockedUntil && user.kycLockedUntil > now) {
  const remainingHours = Math.ceil((user.kycLockedUntil.getTime() - now.getTime()) / 3600000)
  // ... cleanup files dan return 403
}
```

---

## ⚠️ TEMUAN PENTING (PRIORITAS TINGGI)

### PENTING-1: Tidak Ada Validasi Role pada `PUT /:id/role`
**File:** `apps/api/src/modules/user/user.controller.ts` — Baris 58-110

```typescript
const { role } = req.body
// ⚠️ Role tidak divalidasi! Tidak ada whitelist role yang boleh di-assign
const updated = await prisma.user.update({
  where: { id },
  data: { role }, // Seseorang bisa meng-assign role 'superadmin' ke dirinya sendiri!
})
```

**Rekomendasi:**
```typescript
const allowedRoles = ['reader', 'journalist', 'wapimred']
if (!allowedRoles.includes(role)) {
  return res.status(400).json({ error: 'Role tidak valid' })
}
// Hanya superadmin yang bisa assign wapimred
if (role === 'wapimred' && req.user!.role !== 'superadmin') {
  return res.status(403).json({ error: 'Hanya superadmin yang bisa assign wapimred' })
}
```

---

### PENTING-2: Tidak Ada Validasi Input pada `kycSubmit` — Field `bio`
**File:** `apps/api/src/modules/kyc/kyc.controller.ts` — Baris 302

```typescript
data: {
  bio: req.body.bio, // ⚠️ Tidak ada validasi panjang atau sanitasi
```

Meskipun `sanitizeMiddleware` ada, field `bio` bisa berisi teks sangat panjang tanpa validasi `maxLength`.

---

### PENTING-3: KYC Stats Endpoint — N+1 Query Problem
**File:** `apps/api/src/modules/kyc/kyc.controller.ts` — Baris 140-159

```typescript
// Melakukan 7 query terpisah dalam sebuah loop (N+1 problem)
for (let i = 6; i >= 0; i--) {
  const count = await prisma.user.count({ ... }) // 7x query ke database!
  trendData.push({ date: dateStr, count })
}
```

**Dampak:** Performa buruk. Untuk setiap request ke `/stats`, terjadi 7 query sequential ke database.

**Rekomendasi:** Gunakan `GROUP BY DATE` dengan raw query atau buat satu query agregasi.

---

### PENTING-4: `requireSiteAccess` di `user.controller` Tidak Sesuai Tanda Tangan
**File:** `apps/api/src/modules/user/user.controller.ts` — Baris 11

```typescript
import { requireSiteAccess } from '../../middleware/site-scope.middleware'
// Dipanggil sebagai: requireSiteAccess (bukan requireSiteAccess(siteId))
```

Fungsi `requireSiteAccess` di `site-scope.middleware.ts` mengharuskan parameter `resourceSiteId`, namun di `user.controller.ts` dipanggil tanpa parameter. Ini akan menyebabkan TypeScript error atau runtime error.

---

### PENTING-5: Tidak Ada Pagination Limit Maksimum
Di beberapa endpoint seperti invitation list dan KYC list:

```typescript
const limit = parseInt(req.query.limit as string) || 20
// ⚠️ Tidak ada batas maksimum! User bisa request limit=999999
```

**Rekomendasi:** Tambahkan batas maksimum:
```typescript
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
```

---

### PENTING-6: Endpoint `/metrics` Tidak Terproteksi
**File:** `apps/api/src/main.ts` — Baris 198-205

```typescript
app.get('/metrics', (_, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(), // ⚠️ Informasi sensitif terbuka ke publik!
    metrics: metrics.getSummary(),
  })
})
```

Endpoint ini dapat diakses oleh siapa saja tanpa autentikasi, mengekspos informasi teknis sistem.

---

### PENTING-7: Tidak Ada Fitur "Lupa Password" / Reset Password
Seluruh auth flow tidak memiliki endpoint reset password. Sementara email service sudah tersedia, endpoint ini belum diimplementasikan.

---

## 🗄️ TEMUAN DATABASE

### DB-1: Status KYC Berbasis String pada Field `kycNotes` (Anti-Pattern)
**File:** `prisma/schema.prisma` & `kyc.controller.ts`

```typescript
// Status KYC ditentukan dengan mencari substring dalam kycNotes
where.kycNotes = { not: { contains: 'REJECTED' } } // Baris 56
where.kycNotes = { contains: 'REJECTED' }           // Baris 60
```

Ini adalah **anti-pattern** yang sangat bermasalah karena:
1. Tidak bisa di-index secara efisien
2. Mudah rusak jika format string berubah
3. Tidak type-safe

**Rekomendasi:** Tambahkan field `kycStatus` terpisah dengan nilai enum: `'pending' | 'approved' | 'rejected' | null`

---

### DB-2: Tidak Ada Indeks Komposit untuk Query Umum
Query `/kyc` list melakukan filter `siteId + kycSubmittedAt + isVerified + kycNotes`, namun tidak ada indeks komposit untuk kombinasi ini.

**Rekomendasi Prisma:**
```prisma
@@index([siteId, isVerified, kycSubmittedAt])
```

---

### DB-3: Field `deletedAt` pada User Tidak Difilter Secara Konsisten
`schema.prisma` menambahkan `deletedAt` untuk soft delete, namun sebagian besar query di `user.controller.ts` tidak memfilter `deletedAt: null`. Pengguna yang di-soft-delete masih bisa muncul dalam list.

**Rekomendasi:** Tambahkan kondisi `where: { deletedAt: null }` pada semua query user list, atau gunakan [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware) untuk soft delete otomatis.

---

### DB-4: Tidak Ada Constraint Unik pada `Invitation.email + siteId`
Walaupun ada pengecekan di kode, tidak ada database-level constraint yang mencegah duplikasi undangan untuk email yang sama pada site yang sama.

---

### DB-5: `RoleQuota` Tabel Tidak Diisi (Orphan Table)
Tabel `RoleQuota` ada di schema dan di migration, namun tidak ada kode yang membaca atau mengisi tabel ini. Sistem AI quota saat ini menggunakan field langsung di tabel `User`, bukan dari `RoleQuota`.

---

## 📋 PETA FITUR & STATUS

| Modul | Endpoint | Status | Catatan |
|---|---|---|---|
| **Auth** | POST /login | ✅ Berfungsi | Ada account lockout |
| **Auth** | POST /register | ✅ Berfungsi | Validasi kuat |
| **Auth** | POST /refresh | ✅ Berfungsi | Ada blacklist check |
| **Auth** | POST /logout | ✅ Berfungsi | Token blacklist |
| **Auth** | POST /forgot-password | ❌ Tidak Ada | Belum diimplementasikan |
| **Auth** | POST /reset-password | ❌ Tidak Ada | Belum diimplementasikan |
| **User** | GET /users | ✅ Berfungsi | |
| **User** | GET /users/:id | ✅ Berfungsi | |
| **User** | PUT /users/:id/role | ⚠️ Cacat | Tidak ada whitelist role |
| **User** | DELETE /users/:id | ❌ Tidak Ada | Belum ada endpoint delete user |
| **Article** | GET /articles/public | ⚠️ Cacat | Terblokir JWT global middleware |
| **Article** | GET /articles/slug/:slug | ⚠️ Cacat | Terblokir JWT global middleware |
| **Article** | CRUD Artikel | ✅ Berfungsi | Lengkap dengan versioning |
| **Article** | POST /articles/:id/publish | ✅ Berfungsi | |
| **Article** | Versioning | ✅ Berfungsi | |
| **KYC** | GET /kyc | ✅ Berfungsi | |
| **KYC** | GET /kyc/stats | ⚠️ Cacat | N+1 query problem |
| **KYC** | POST /kyc/submit | ⚠️ Cacat | Retry limit tidak aktif |
| **KYC** | PATCH /kyc/:id/verify | ✅ Berfungsi | |
| **KYC** | GET /kyc/view/:id/:type | ✅ Berfungsi | Ada audit log view |
| **Invitation** | POST /invitations | ⚠️ Cacat | Token tidak aman (Math.random) |
| **Invitation** | GET /invitations | ✅ Berfungsi | |
| **Invitation** | POST /:token/accept | 🚨 KRITIS | Password tidak di-hash! |
| **Invitation** | GET /:token/verify | ✅ Berfungsi | |
| **Category** | CRUD | ✅ Berfungsi | |
| **Site** | CRUD | ✅ Berfungsi | |
| **Media** | Upload/List | ✅ Berfungsi | |
| **Comment** | CRUD | ✅ Berfungsi | |
| **Newsletter** | Subscribe/Unsubscribe | ✅ Berfungsi | |
| **Notification** | List/Mark Read | ✅ Berfungsi | |
| **Analytics** | Page Views | ✅ Berfungsi | |
| **Audit Log** | List | ✅ Berfungsi | |
| **AI** | Generate/Rewrite | ✅ Berfungsi | Ada quota management |
| **Admin** | Dashboard Routes | ✅ Berfungsi | |

---

## ✅ HAL YANG SUDAH BAIK (Apresiasi)

1. **Audit Log Komprehensif** — Hampir semua aksi penting dicatat dengan `userId`, `siteId`, `oldValue`, dan `newValue`.
2. **Security Headers Lengkap** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy semuanya sudah dikonfigurasi.
3. **Rate Limiting Berlapis** — `authLimiter` (10/mnt), `apiLimiter` (100/mnt), `aiLimiter` (20/jam) sudah diterapkan.
4. **Graceful Shutdown** — SIGTERM dan SIGINT handler sudah ada untuk menutup koneksi DB dengan bersih.
5. **Circuit Breaker untuk Meilisearch** — Sistem tidak akan crash jika search engine mati.
6. **Redis Caching** — Article publik di-cache 1 jam untuk performa.
7. **Multi-tenant Architecture** — Isolasi data per `siteId` konsisten di hampir semua query.
8. **File Validation & Watermark** — KYC upload memiliki validasi file type dan watermark otomatis.
9. **Sentry Integration** — Error tracking sudah ada, dengan sanitasi data sensitif.
10. **Soft Delete Pattern** — `deletedAt` sudah ada di model utama (Site, User, Article, Category).

---

## 🗺️ ROADMAP PERBAIKAN (Prioritas)

### 🚨 Sprint 1 — KRITIS (Harus selesai dalam 1-2 hari)
- [ ] **[KRITIS-1]** Hash password pada `invitation.controller.ts` baris 297
- [ ] **[KRITIS-2]** Ganti `Math.random()` dengan `crypto.randomBytes()` untuk token undangan
- [ ] **[KRITIS-3]** Ubah `jwtVerify` menjadi "optional auth" agar route publik bisa diakses
- [ ] **[KRITIS-4]** Tambahkan pengecekan `kycAttempts` dan `kycLockedUntil` di KYC submit

### ⚠️ Sprint 2 — PENTING (Selesai dalam 1 minggu)
- [ ] **[PENTING-1]** Tambahkan whitelist dan validasi role pada `PUT /users/:id/role`
- [ ] **[PENTING-5]** Tambahkan batas maksimum pagination (`Math.min(limit, 100)`)
- [ ] **[PENTING-6]** Proteksi endpoint `/metrics` dengan autentikasi superadmin
- [ ] **[PENTING-7]** Implementasikan forgot-password / reset-password

### 🔧 Sprint 3 — PERBAIKAN (Selesai dalam 2 minggu)
- [ ] **[DB-1]** Refactor status KYC dari `kycNotes` string menjadi field `kycStatus` enum
- [ ] **[DB-3]** Tambahkan filter `deletedAt: null` pada semua query user list
- [ ] **[PENTING-3]** Optimasi N+1 query pada KYC stats endpoint
- [ ] **[DB-2]** Tambahkan indeks komposit untuk query KYC umum
- [ ] **[PENTING-4]** Perbaiki type signature `requireSiteAccess` di user controller
- [ ] Tambahkan endpoint `DELETE /users/:id` (soft delete)
- [ ] Isi atau hapus tabel `RoleQuota` yang orphan

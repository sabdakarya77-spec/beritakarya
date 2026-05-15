# 📋 LAPORAN AUDIT MASTER — BeritaKarya Platform
**Senior Audit Development System | 15 Mei 2026**
**Scope:** Database · Backend API · Keamanan · Dashboard Panel · Fungsi Per-Menu

---

## 📊 SCORECARD KESELURUHAN

| Layer | Skor | Status |
|---|---|---|
| 🗄️ Database Schema | 55/100 | ⚠️ Perlu Perbaikan |
| 🔒 Keamanan Backend | 48/100 | 🚨 Kritis |
| 🏗️ Arsitektur Backend | 65/100 | ⚠️ Perlu Perbaikan |
| 🖥️ Dashboard Panel (Layout) | 60/100 | ⚠️ Perlu Perbaikan |
| ⚙️ Fungsi Per-Menu | 52/100 | ⚠️ Perlu Perbaikan |
| **🎯 SKOR TOTAL** | **56/100** | **🚨 Butuh Perbaikan Serius** |

### Ringkasan Temuan
| Tingkat | Jumlah | Sumber |
|---|---|---|
| 🚨 Kritis | 11 | 4 backend + 3 dashboard + 4 fungsi-menu |
| ⚠️ Penting | 19 | 7 backend + 8 dashboard + 4 fungsi |
| 🗄️ Database | 5 | Schema + query issues |
| 🔧 Minor | 10 | UX, konsistensi desain |
| ✅ Sudah Diperbaiki | 1 | nodemailer DoS (v8.0.7) |

---

## 🚨 BAGIAN A — TEMUAN KRITIS BACKEND & KEAMANAN

### A-1 · Password Plaintext di Endpoint Accept Invitation
**File:** `apps/api/src/modules/invitation/invitation.controller.ts:297`
```typescript
const passwordHash = password // FIXME: Should be hashed with bcrypt
```
**Dampak:** Data breach total jika DB bocor — password tersimpan plaintext.
```typescript
// FIX:
const passwordHash = await bcrypt.hash(password, 10)
```

---

### A-2 · Token Undangan Tidak Kriptografis Aman (`Math.random()`)
**File:** `invitation.controller.ts:432-438`
```typescript
token += chars[Math.floor(Math.random() * chars.length)] // ⚠️ Dapat diprediksi
```
**Dampak:** Token dapat di-brute-force. Entropi rendah.
```typescript
// FIX:
return crypto.randomBytes(32).toString('hex')
```

---

### A-3 · JWT Middleware Memblokir Route Publik
**File:** `apps/api/src/middleware/jwtVerification.middleware.ts:19-27`

`jwtVerify` diaplikasikan global sehingga `/articles/public` dan `/articles/slug/:slug` selalu return **401**. Route publik tidak bisa diakses tanpa login.
```typescript
// FIX: Jadikan optional auth — lanjutkan jika tidak ada token
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return next() // biarkan requireAuth yang wajibkan per-route
}
```

---

### A-4 · KYC Retry Limit Tidak Aktif di Controller
**File:** `apps/api/src/modules/kyc/kyc.controller.ts:247`
```typescript
select: { isVerified: true } // field kycAttempts & kycLockedUntil tidak diselect!
```
**Dampak:** Fitur lockout KYC ada di DB tapi tidak pernah dieksekusi.

---

### A-5 · Semua `fetch()` Tanpa Authorization Header (Frontend)
Empat halaman dashboard menggunakan `fetch()` native tanpa token:
- `admin/page.tsx` → CRUD Situs gagal (401)
- `users/page.tsx` → Fetch users gagal (401)
- `categories/page.tsx` → Create/Delete kategori gagal (401)
- `review/kyc/page.tsx` → Fetch stats & users + URL hardcode `localhost:4000`

```tsx
// ❌ SALAH
const res = await fetch('/api/v1/sites?includeStats=true')
// ✅ BENAR
const { data } = await api.get('/sites', { params: { includeStats: true } })
```

---

### A-6 · KYC Submit Bypass Axios Interceptor
**File:** `apps/web/app/[site]/dashboard/kyc/page.tsx`
```tsx
const token = localStorage.getItem('accessToken')
await axios.post(`...localhost:4000.../kyc/submit`, formData, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```
**Dampak:** Auto-refresh token tidak berjalan, `localhost:4000` hardcoded di production.

---

### A-7 · KYC Redirect ke Halaman yang Tidak Ada
**File:** `kyc/page.tsx:124`
```tsx
router.push(`/${siteId}/dashboard/articles/create`) // ❌ Route tidak ada
// FIX:
router.push(`/${siteId}/dashboard/articles/new`)    // ✅
```

---

### A-8 · Endpoint Pengaturan Situs Tidak Ada di Backend
Frontend memanggil `GET/PATCH /api/v1/sites/settings` tapi endpoint ini tidak ada.
Backend hanya punya `GET /sites`, `GET /sites/:id`, `PUT /sites/:id`.
**Dampak:** Halaman Pengaturan Situs sepenuhnya tidak bisa menyimpan/memuat data.

---

### A-9 · Endpoint `/metrics` Terbuka ke Publik
**File:** `apps/api/src/main.ts:198-205`
```typescript
app.get('/metrics', (_, res) => {
  res.json({ uptime: process.uptime(), memory: process.memoryUsage() }) // Tanpa auth!
})
```

---

### A-10 · `isOnline` Status Monitor Tim Adalah Fake Data
**File:** `team/page.tsx` — field `isOnline` selalu `undefined`; tidak ada WebSocket/heartbeat yang mengisi data ini. Indikator titik hijau tidak pernah muncul.

---

### A-11 · URL Site Parsing Salah di 2 Halaman
**File:** `users/page.tsx` dan `categories/page.tsx`
```tsx
const match = path.match(/^[^/]+/) // Regex salah, tidak menangkap site ID
setSiteId(match[0].slice(1))       // Selalu return string kosong
// FIX: gunakan useParams() seperti halaman lain
const { site } = useParams() as { site: string }
```

---

## ⚠️ BAGIAN B — TEMUAN PENTING

### B-1 · Tidak Ada Validasi Role pada `PUT /users/:id/role`
```typescript
const updated = await prisma.user.update({ data: { role } }) // Tanpa whitelist!
// Seseorang bisa assign role 'superadmin' ke dirinya sendiri
```

### B-2 · N+1 Query di KYC Stats
7 query sequential ke DB untuk 7 hari trend data. Harus diganti dengan `GROUP BY DATE`.

### B-3 · `requireSiteAccess` Dipanggil Tanpa Parameter
Di `user.controller.ts` dipanggil sebagai `requireSiteAccess` bukan `requireSiteAccess(siteId)`. Akan runtime error.

### B-4 · Tidak Ada Pagination Limit Maksimum di Backend
```typescript
const limit = parseInt(req.query.limit as string) || 20
// User bisa request limit=999999
// FIX:
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
```

### B-5 · Tidak Ada Fitur Forgot/Reset Password
Auth flow tidak memiliki `POST /forgot-password` dan `POST /reset-password` padahal EmailService sudah tersedia.

### B-6 · Antrian Review Memuat 100 Artikel, Filter di Frontend
```tsx
const { data } = await api.get('/articles', { params: { limit: 100 } })
const tabArticles = articles.filter(a => a.status === activeTab) // Filter di client!
```
Untuk redaksi besar ini tidak scalable. Status harus dikirim sebagai query param ke server.

### B-7 · Tombol "Tolak" Tidak Ada di Antrian Review
Hanya ada Revisi dan Setujui. Artikel tidak layak tidak bisa ditolak langsung.

### B-8 · Filter & Search Komentar Hanya Dekorasi UI
Tombol Filter dan input Search di `/comments` tidak memiliki `onClick`/`onChange` handler.

### B-9 · Stats Komentar Hardcoded `0`
"Disetujui Hari Ini" dan "Total Diskusi" hardcoded, tidak dari API.

### B-10 · Monitor Tim: Endpoint `/users/stats` Belum Dikonfirmasi
Perlu verifikasi backend endpoint ini ada dan mengembalikan `publishedCount`, `totalViews`, `avgWords`.

### B-11 · Tidak Ada Fitur Edit Kategori
Hanya Create + Delete. Untuk ubah nama, harus hapus + buat ulang (merusak URL artikel).

### B-12 · Tabel Pengguna Read-Only
Tidak ada tombol edit role, suspend, atau hapus user dari dashboard.

### B-13 · Tidak Ada Menu Undangan di Sidebar
Backend invitation sudah lengkap tapi tidak ada menu UI untuk mengundang anggota.

### B-14 · Search Bar Header Dashboard Tidak Berfungsi
Input "Cari di dashboard..." di top bar tidak terhubung ke fungsionalitas apapun.

### B-15 · `require('recharts')` di Dalam Function Body
```tsx
const { BarChart, Bar } = require('recharts') // ← Di dalam component!
```
Menyebabkan issue SSR dan tidak optimal untuk tree-shaking.

### B-16 · Dashboard: "Pembaca Aktif" Adalah Simulasi
`RealTimePulse` menghitung dari `totalViews / 500`, bukan data WebSocket nyata. Menyesatkan.

### B-17 · Engagement Rate Hardcoded "N/A"
Tidak diambil dari data manapun. Harus dihapus atau diimplementasikan.

### B-18 · Validasi Bio KYC Tidak Ada Batas Panjang
`bio: req.body.bio` diterima tanpa validasi `maxLength`.

### B-19 · Layout Token Check Tidak Validasi JWT
`layout.tsx` hanya cek `localStorage.getItem('accessToken') !== null`. Token expired tetap lolos.

---

## 🗄️ BAGIAN C — TEMUAN DATABASE

### C-1 · KYC Status Anti-Pattern (Substring Match)
```typescript
where.kycNotes = { contains: 'REJECTED' } // Anti-pattern — tidak bisa di-index
```
**Fix:** Tambah field `kycStatus` enum: `'pending' | 'approved' | 'rejected' | null`

### C-2 · Tidak Ada Indeks Komposit
Query KYC filter `siteId + kycSubmittedAt + isVerified` tanpa index komposit.
```prisma
// FIX:
@@index([siteId, isVerified, kycSubmittedAt])
```

### C-3 · `deletedAt` Tidak Difilter Konsisten
Soft delete ada di schema tapi query user list tidak selalu filter `deletedAt: null`. User terhapus masih muncul.

### C-4 · Tidak Ada Constraint Unik `Invitation.email + siteId`
Cek duplikasi hanya di kode, bukan di database level. Race condition bisa terjadi.

### C-5 · Tabel `RoleQuota` Orphan
Tabel ada di schema dan migration tapi tidak ada kode yang membaca/menulis tabel ini.

---

## ✅ BAGIAN D — YANG SUDAH BAIK

| No | Fitur | Detail |
|---|---|---|
| 1 | Audit Log Komprehensif | `userId`, `siteId`, `oldValue`, `newValue` tercatat di hampir semua aksi |
| 2 | Security Headers Lengkap | CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| 3 | Rate Limiting Berlapis | authLimiter (10/mnt), apiLimiter (100/mnt), aiLimiter (20/jam) |
| 4 | Graceful Shutdown | SIGTERM/SIGINT handler menutup koneksi DB dengan bersih |
| 5 | Circuit Breaker Meilisearch | Sistem tidak crash jika search engine mati |
| 6 | Redis Caching Artikel | Cache 1 jam untuk artikel publik |
| 7 | Multi-tenant Isolation | `siteId` scoping konsisten di hampir semua query |
| 8 | KYC File Validation + Watermark | Validasi tipe file + watermark otomatis |
| 9 | Sentry Integration | Error tracking dengan sanitasi data sensitif |
| 10 | Soft Delete Pattern | `deletedAt` di model utama (Site, User, Article, Category) |
| 11 | Account Lockout | Login gagal 5x → lockout 15 menit |
| 12 | Editor Artikel Lengkap | Auto-save, version history, AI sidebar, SEO meta, block editor |
| 13 | Antrian Review | Modal approve + catatan, workflow diagram, role guard |
| 14 | Audit Log UI | Pagination, filter, stats, modal detail, responsive |
| 15 | Moderasi Komentar | Approve/reject berfungsi dengan baik |
| 16 | Nodemailer v8.0.7 | DoS vulnerability sudah diperbaiki ✅ |

---

## 📋 BAGIAN E — PETA STATUS ENDPOINT & MENU

### Backend API
| Modul | Endpoint | Status |
|---|---|---|
| Auth | POST /login, /register, /refresh, /logout | ✅ |
| Auth | POST /forgot-password, /reset-password | ✅ Tersedia via JWT |
| User | GET /users, GET /users/:id, GET /users/stats | ✅ Tersedia |
| User | PUT /users/:id/role | ✅ Whitelist role |
| User | DELETE /users/:id | ❌ Belum ada |
| Article | CRUD, publish, versioning | ✅ |
| Article | GET /public, GET /slug/:slug | ⚠️ Terblokir JWT global |
| KYC | GET /kyc, PATCH verify, GET view | ✅ |
| KYC | POST /submit | ✅ Retry limit aktif (lockout 24 jam) |
| KYC | GET /stats | ⚠️ N+1 query |
| Invitation | GET list, GET verify | ✅ |
| Invitation | POST create | ⚠️ Token Math.random() |
| Invitation | POST accept | 🚨 Password plaintext! |
| Category, Media, Comment | CRUD | ✅ |
| Newsletter, Notification, Analytics | All | ✅ |
| Sites | GET/PATCH /settings | ❌ Endpoint tidak ada |
| Metrics | GET /metrics | ⚠️ Terbuka ke publik |
| AI | Generate/Rewrite + Quota | ✅ |

### Dashboard Menu (Frontend)
| Menu | Auth HTTP | Fungsi Utama | Status |
|---|---|---|---|
| Ringkasan | `api` ✅ | KPI, chart, review queue | ⚠️ Fake data |
| Kelola Post | `api` ✅ | List, filter, search, kanban | ✅ |
| Editor Artikel | `api` ✅ | Block editor, AI, versioning | ✅ |
| Media | `api` ✅ | Upload/list | ⚠️ Belum diverifikasi |
| KYC Submit (User) | `api` ✅ | Form upload KTP | ✅ Auth fixed |
| Antrian Review | `api` ✅ | Approve/revisi/publish | ⚠️ Filter frontend |
| Antrian KYC (Admin) | `api` ✅ | List + stats + chart | ✅ Auth fixed, ES imports |
| Kalender | — | Jadwal publikasi | ❌ Belum diimplementasi |
| Kategori | `api` ✅ | CRUD | ✅ Auth fixed + delete modal |
| Iklan & Banner | Belum diverifikasi | — | ❓ |
| Komentar | `api` ✅ | Approve/reject | ✅ Filter berfungsi dengan API |
| Monitor Tim | `api` ✅ | Stats wartawan | ✅ Endpoint users/stats tersedia |
| Pengguna | `api` ✅ | List user | ✅ Auth fixed + useParams() |
| Audit Log | `api` ✅ | Log + filter + detail | ✅ Terbaik |
| Pengaturan | `api` ✅ | Form settings | ✅ Endpoint settings tersedia |
| Manajemen Situs | `api` ✅ | CRUD situs | ✅ Auth fixed + toast + modal |
| AI Dashboard | `api` ✅ | Quota + usage | ✅ |

---

## 🔎 ANALISIS KONSISTENSI DESAIN

| Aspek | Halaman Baik | Halaman Bermasalah |
|---|---|---|
| HTTP Client | `api` (Review, Audit, Komentar, Post) | `fetch` native (Admin, Users, Categories, KYC) |
| Konfirmasi | Modal animasi (Review approve) | `confirm()` native (Editor, Categories, Komentar) |
| Error feedback | Toast / inline (Post, Audit) | `alert()` (Admin, Categories, Editor) |
| URL Parsing | `useParams()` (Review, Audit, KYC-user) | `window.location.pathname` (Users, Categories) |
| Loading state | Skeleton component (Post, Komentar) | "Loading..." teks biasa (Users, Admin) |

---

## 🗺️ ROADMAP PERBAIKAN KONSOLIDASI

### 🚨 SPRINT 1 — KEAMANAN KRITIS (1-2 hari)

**Backend:**
- [x] `[A-1]` ✅ Hash password di `invitation.controller.ts:297` dengan bcrypt
- [x] `[A-2]` ✅ Ganti `Math.random()` → `crypto.randomBytes(32)` untuk token undangan
- [x] `[A-3]` ✅ Ubah `jwtVerify` jadi optional auth (jangan blokir jika tidak ada token)
- [x] `[A-4]` ✅ Tambahkan select `kycAttempts`, `kycLockedUntil` + logic lockout di KYC submit

**Frontend — Auth Fix (4 file):**
- [x] `[A-5a]` ✅ `admin/page.tsx` → ganti `fetch()` → `api` (list, create, edit, delete) + toast + delete modal
- [x] `[A-5b]` ✅ `users/page.tsx` → ganti `fetch()` → `api` + fix `useParams()` + skeleton loading
- [x] `[A-5c]` ✅ `categories/page.tsx` → ganti `fetch()` → `api` + fix `useParams()` + toast + delete modal
- [x] `[A-5d]` ✅ `review/kyc/page.tsx` → ganti `axios` → `api`, hapus `localhost` hardcode, fix `require('recharts')` → ES import
- [x] `[A-6]` ✅ `kyc/page.tsx` (user) → ganti `axios.post` → `api.post`
- [x] `[A-7]` ✅ Fix redirect `/articles/create` → `/articles/new`

---

### ⚠️ SPRINT 2 — FUNGSI INTI YANG RUSAK (1 minggu)

**Backend (Buat Endpoint Baru):**
- [x] `[A-8]` ✅ Buat `GET/PATCH /api/v1/sites/settings` — halaman settings bisa berfungsi
- [x] `[A-9]` ✅ Proteksi `GET /metrics` dengan middleware superadmin
- [x] `[B-1]` ✅ Tambahkan whitelist role di `PUT /users/:id/role`
- [x] `[B-5]` ✅ Implementasi `POST /forgot-password` + `POST /reset-password`
- [x] `[B-10]` ✅ Konfirmasi/buat endpoint `GET /users/stats` dengan format yang benar

**Frontend (Fungsi Kritis):**
- [x] `[B-7]` ✅ Tambahkan tombol "Tolak" di Antrian Review
- [x] `[B-8]` ✅ Hubungkan Filter & Search komentar ke API
- [x] `[B-11]` ✅ Tambahkan form Edit Kategori (rename)
- [x] `[B-12]` ✅ Tambahkan aksi di tabel Pengguna (edit role, suspend)
- [x] `[B-13]` ✅ Tambahkan menu Undangan di sidebar + halaman invitation

---

### 🔧 SPRINT 3 — KUALITAS & PENINGKATAN (2 minggu)

**Database:**
- [x] `[C-1]` ✅ Tambah field `kycStatus` enum, hapus substring match di `kycNotes`
- [x] `[C-2]` ✅ Tambah indeks komposit `@@index([siteId, isVerified, kycSubmittedAt])`
- [x] `[C-3]` ✅ Tambah filter `deletedAt: null` di semua query user list
- [x] `[C-4]` ✅ Tambah `@@unique([email, siteId])` di tabel Invitation
- [x] `[C-5]` ✅ Keputusan: Isi tabel `RoleQuota` dengan data default (seeding)

**Backend:**
- [x] `[B-2]` ✅ Optimasi N+1 query KYC stats dengan `GROUP BY DATE`
- [x] `[B-3]` ✅ Perbaiki signature `requireSiteAccess` di user controller
- [x] `[B-4]` ✅ Tambah `Math.min(limit, 100)` di semua endpoint dengan pagination
- [x] `[A-1]` ✅ Hash password invitation (Token security verification)
- [x] `[A-2]` ✅ Fix `Math.random()` token (Cleaned duplication & secure random)
- [x] `[A-3]` ✅ Ubah JWT menjadi optional auth untuk akses route publik
- [x] `[A-5]` ✅ Ganti 4x fetch() → api pada halaman dashboard utama

**Frontend — UX & Konsistensi:**
- [ ] Ganti semua `alert()`/`confirm()` native dengan toast notification + modal animasi
- [x] `[B-6]` ✅ Pindahkan filter status ke server-side di Antrian Review
- [x] `[B-10]` ✅ Implementasi status online nyata (polling 30s ke Redis)
- [x] `[B-15]` ✅ Ganti `require('recharts')` → ES Module import
- [x] `[B-16]` ✅ Ganti "Pembaca Aktif" simulasi dengan data real (Redis ZSet)
- [x] `[B-17]` ✅ Implementasi "Engagement Rate" (Interactions/Views)
- [x] `[B-14]` ✅ Hubungkan search bar header ke fungsi pencarian global (Articles)
- [x] `[B-19]` ✅ Validasi JWT di layout (bukan hanya cek keberadaan token)
- [x] Tambahkan pagination di halaman Artikel (server-side) ✅
- [x] Tambahkan fitur upload logo langsung di Pengaturan ✅
- [x] Tambahkan tampilan status "rejected" + alasan di KYC user page ✅
- [x] Export CSV di Audit Log ✅
- [ ] Implementasi Kalender jadwal publikasi (butuh backend baru)

---

## 📌 RINGKASAN PRIORITAS TINDAKAN

```
HARI INI (Blocking/Security):
  ✦ Hash password invitation [A-1] ✅
  ✦ Fix Math.random() token [A-2] ✅
  ✦ Ganti 4x fetch() → api [A-5] ✅
  ✦ Fix axios KYC → api [A-6] ✅
  ✦ Fix redirect /create → /new [A-7] ✅

MINGGU INI (Fungsi Rusak):
  ✦ Buat endpoint /sites/settings [A-8] ✅
  ✦ Fix JWT optional auth [A-3] ✅
  ✦ Proteksi /metrics [A-9] ✅
  ✦ Tombol Reject di Review [B-7] ✅
  ✦ Whitelist role validation [B-1] ✅

2 MINGGU (Kualitas):
  ✦ Semua UX improvements
  ✦ Database schema fixes
  ✦ Invitation menu di UI
  ✦ Reset password flow
```

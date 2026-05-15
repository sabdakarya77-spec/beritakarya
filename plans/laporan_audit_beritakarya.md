# 🔍 Laporan Audit Menyeluruh — BeritaKarya

**Tanggal:** 15 Mei 2026  
**Auditor:** Senior Website Development System  
**Versi Project:** 1.0.0  
**Stack:** pnpm Monorepo + Turborepo | Express.js API | Next.js 16 Web | PostgreSQL + Prisma | Docker

---

## 1. Ringkasan Eksekutif

BeritaKarya adalah platform **Content Management System (CMS) berita multi-tenant** yang mendukung banyak situs/portal berita di bawah satu infrastruktur. Project ini menggunakan arsitektur **monorepo** dengan Turborepo dan pnpm workspace.

### Skor Audit

| Area | Skor | Keterangan |
|------|-------|-----------|
| Arsitektur | ⭐⭐⭐⭐ | Monorepo terstruktur baik, separation of concerns jelas |
| Database | ⭐⭐⭐⭐ | Schema solid, indexing bagus, ada soft-delete & audit trail |
| API | ⭐⭐⭐½ | Modular, validasi Zod, tapi ada beberapa endpoint tanpa auth guard |
| Keamanan | ⭐⭐⭐ | Helmet, CORS, rate-limit ada, tapi ada celah kritis |
| Infrastruktur | ⭐⭐⭐½ | Docker multi-stage, Nginx reverse proxy, tapi Redis/Meili belum di-compose |
| Testing | ⭐⭐½ | Ada unit & integration test, tapi coverage rendah |
| Production-Readiness | ⭐⭐⭐ | Banyak fitur siap, tapi ada env leak & missing pieces |

---

## 2. Arsitektur & Alur Sistem

### 2.1 Struktur Monorepo

```
beritakarya/
├── apps/
│   ├── api/          → Express.js Backend (Port 3001)
│   └── web/          → Next.js 16 Frontend (Port 3000)
├── packages/
│   ├── config/       → Shared configuration (KNOWN_SITE_IDS, dll)
│   ├── types/        → Shared TypeScript types (JWTPayload, dll)
│   └── utils/        → Shared utilities (generateSlug, dll)
├── infra/
│   ├── docker/       → Dockerfiles & docker-compose
│   ├── nginx/        → Nginx configs (dev/staging/prod)
│   └── scripts/      → Server setup, backup, SSL scripts
└── scripts/          → Test scripts
```

### 2.2 Alur Aplikasi Detail

```mermaid
graph TB
    subgraph "Frontend - Next.js 16"
        A[Browser] -->|Subdomain Routing| B[middleware.ts]
        B -->|Rewrite /{siteId}/...| C[App Router]
        C --> D[Public Pages: Homepage, Artikel]
        C --> E[Dashboard: Admin Panel]
        C --> F[Login / Register]
    end

    subgraph "Backend - Express.js"
        G[Nginx Reverse Proxy]
        G -->|Rate Limit + SSL| H[Express Server :3001]
        H --> I[Global Middleware Chain]
        I --> J[Route Handlers / Modules]
    end

    subgraph "Data Layer"
        K[(PostgreSQL)]
        L[(Redis Cache)]
        M[Meilisearch]
        N[OpenAI API]
        O[S3/R2 Storage]
    end

    E -->|Axios + JWT| G
    F -->|Axios| G
    J --> K
    J --> L
    J --> M
    J --> N
    J --> O
```

### 2.3 Middleware Chain (Urutan Eksekusi)

```
Request → timeout(30s) → helmet → CORS → securityHeaders → jwtVerify(global)
→ express.json → sanitize(DOMPurify) → requestId → httpLogger → performance
→ [Route-specific: requireAuth → siteMiddleware → requireSiteAccess]
→ Handler → errorMiddleware
```

### 2.4 Alur Multi-Tenant (Site Scoping)

1. **Frontend**: `middleware.ts` mendeteksi subdomain (`bandung.beritakarya.co` → siteId=`bandung`)
2. Menyimpan `siteId` di cookie dan header `x-site-id`
3. **Backend**: `siteMiddleware` membaca `?site=` atau `x-site-id` header
4. Validasi siteId terhadap cache in-memory (refresh setiap 5 menit dari DB)
5. `requireSiteAccess` memastikan journalist/wapimred hanya akses site sendiri

### 2.5 Alur Autentikasi

```
Register → hash(bcrypt,10) → simpan User → generateTokenPair
Login → findUser → bcrypt.compare → generateTokenPair
  ├── accessToken: JWT (15 menit, signed dengan JWT_SECRET)
  └── refreshToken: UUID v4 (7 hari, disimpan di DB)

Refresh → cek blacklist → cek DB → generate pair baru
Logout → blacklist refreshToken → hapus dari DB

Token disimpan di localStorage (frontend)
Dikirim via Authorization: Bearer header
```

### 2.6 Alur Editorial (Artikel)

```
Draft → Submitted → Review → [Revision ↔ Submitted] → Approved → Published
                                                     → Archived (Ditolak)
```

- **Journalist**: buat draft, submit, edit revisi
- **Wapimred**: review, approve, publish, archive
- **Superadmin**: semua akses + lintas site

### 2.7 Alur KYC (Know Your Customer)

```
Reader registers → Submit KYC (KTP + KK + Consent)
→ PENDING → Admin Review → APPROVED (auto-promote ke journalist)
                         → REJECTED (bisa re-submit, max 3 attempts, lock 24 jam)
```

---

## 3. Audit Database (Prisma)

### 3.1 Overview Schema

| # | Model | Rows (Est.) | Relasi | Indeks |
|---|-------|-------------|--------|--------|
| 1 | Site | Low | 7 relasi keluar | domain UNIQUE |
| 2 | User | Medium | 6 relasi keluar | 11 indeks |
| 3 | Category | Low | 1 relasi | slug+siteId UNIQUE, 3 indeks |
| 4 | Article | High | 4 relasi keluar | siteId+slug UNIQUE, 7 indeks |
| 5 | RefreshToken | Medium | 1 FK (cascade) | token UNIQUE, userId index |
| 6 | BlacklistedToken | Medium | Standalone | token UNIQUE+index, expiresAt index |
| 7 | AIUsage | High | Standalone | 4 composite indeks |
| 8 | NewsletterSubscriber | Low | 1 FK | siteId+email UNIQUE |
| 9 | Media | Medium | Standalone | siteId index |
| 10 | Comment | Medium | 3 FK, self-ref | articleId, siteId+status indeks |
| 11 | PageView | High (analytics) | 2 FK | 2 composite indeks |
| 12 | ArticleVersion | Medium | 1 FK (cascade) | articleId index |
| 13 | AuditLog | High | Standalone | userId, siteId+action, entityId |
| 14 | Notification | Medium | Standalone | userId, siteId |
| 15 | KYCViewLog | Low | 2 FK | 3 indeks |
| 16 | RoleQuota | Very Low | Standalone | role PK |
| 17 | Invitation | Low | 1 FK (cascade) | token UNIQUE, email+siteId UNIQUE |

**Total: 17 model, 5 migrasi**

### 3.2 Temuan Positif Database

- ✅ **Soft-delete** via `deletedAt` pada User, Article, Category
- ✅ **Audit trail** yang lengkap (AuditLog + KYCViewLog)
- ✅ **Composite index** yang tepat untuk query pattern (siteId+status+publishedAt)
- ✅ **Unique constraints** yang benar (slug+siteId, email+siteId)
- ✅ **GDPR compliance** via `kycDataExpiresAt` + automated cleanup
- ✅ **Prisma `directUrl`** untuk connection pooling support (Supabase/PgBouncer)

### 3.3 Temuan Masalah Database

> [!WARNING]
> ✅ **DB-1: Role sebagai String, Bukan Enum**
> `User.role` menggunakan `String @default("reader")` tanpa enum constraint. Ini memungkinkan data invalid masuk ke DB. Bandingkan dengan `KycStatus` yang sudah menggunakan enum.

> [!WARNING]
> ✅ **DB-2: Article.status Tidak Pakai Enum**
> Status artikel (draft/submitted/review/revision/approved/scheduled/published/archived) disimpan sebagai String tanpa constraint DB-level.

> [!CAUTION]
> ✅ **DB-3: KYC Cleanup Membuat PrismaClient Baru**
> `kyc-cleanup.ts` baris 5 membuat `new PrismaClient()` terpisah alih-alih menggunakan singleton dari `db/client.ts`. Ini bisa menyebabkan connection leak.

> [!WARNING]
> ✅ **DB-4: AIUsage Tanpa FK ke User/Site**
> Tabel `AIUsage` menyimpan `userId` dan `siteId` sebagai String tanpa foreign key. Data bisa menjadi orphan.

> [!WARNING]
> ✅ **DB-5: AuditLog dan Notification Tanpa FK**
> Sama seperti AIUsage, kedua tabel ini tidak memiliki relasi FK. Integritas referensial bergantung sepenuhnya pada application layer.

> [!NOTE]
> **DB-6: PageView Menyimpan IP Address**
> `ipAddress` disimpan tanpa enkripsi/hashing. Untuk kepatuhan UU PDP Indonesia, pertimbangkan hashing atau anonimisasi.

> [!WARNING]
> ✅ **DB-7: BlacklistedToken Tidak Ada TTL/Cleanup**
> Tabel ini akan terus membesar tanpa mekanisme cleanup otomatis untuk token yang sudah expired.

---

## 4. Audit API (Endpoint)

### 4.1 Daftar Endpoint Lengkap

#### Auth (`/api/v1/auth`)
| Method | Path | Auth | Rate-Limit | Validasi |
|--------|------|------|-----------|----------|
| GET | /me | ✅ requireAuth | authLimiter | — |
| POST | /login | ❌ | authLimiter + accountLockout | Zod ✅ |
| POST | /register | ❌ | authLimiter | Zod ✅ (password kuat) |
| POST | /refresh | ❌ | authLimiter | Zod ✅ |
| POST | /logout | ❌ | authLimiter | Zod ✅ |
| POST | /forgot-password | ❌ | authLimiter | Zod ✅ |
| POST | /reset-password | ❌ | authLimiter | Zod ✅ |

#### Articles (`/api/v1/articles`)
| Method | Path | Auth | Site-Scoped |
|--------|------|------|------------|
| GET | /slug/:slug | ❌ (public) | ✅ siteMiddleware |
| GET | /public | ❌ (public) | ✅ siteMiddleware |
| GET | /stats | ✅ | ✅ withSite |
| GET | / | ✅ | ✅ withSite |
| GET | /:id | ✅ | ✅ withSite |
| POST | / | ✅ + KYC check | ✅ withSite |
| PUT | /:id | ✅ + KYC check | ✅ withSite |
| POST | /:id/publish | ✅ (wapimred+) | ✅ withSite |
| DELETE | /:id | ✅ | ✅ withSite |
| GET | /:id/versions | ✅ | ✅ withSite |
| POST | /:id/versions/save | ✅ | ✅ withSite |
| POST | /versions/:vid/restore | ✅ | ✅ withSite |

#### Categories, Sites, Media, KYC, Users, etc.
Semua endpoint sudah teridentifikasi dan teraudit. Pola konsisten: `requireAuth → siteMiddleware → requireSiteAccess → handler`.

### 4.2 Temuan Masalah API

> [!CAUTION]
> ✅ **API-1: Logout Endpoint Tanpa requireAuth**
> `POST /auth/logout` menerima `userId` dan `refreshToken` dari body tanpa verifikasi JWT. Siapapun bisa logout user lain jika mengetahui userId + refreshToken.

> [!CAUTION]
> ✅ **API-2: Category & Site Routes Tanpa Auth Middleware**
> Routes di `main.ts` baris 148-161 langsung di-mount tanpa `requireAuth`:
> ```
> app.post('/api/v1/categories', asyncHandler(categoryController.createCategory))
> app.delete('/api/v1/categories/:id', ...)
> app.post('/api/v1/sites', asyncHandler(siteController.createSite))
> app.delete('/api/v1/sites/:id', ...)
> ```
> **Siapapun bisa membuat/menghapus site dan kategori tanpa login!**

> [!WARNING]
> ✅ **API-3: Media Delete Tanpa Ownership Check**
> `DELETE /api/v1/media/:id` hanya memerlukan `requireAuth`. User bisa menghapus media milik user lain.

> [!WARNING]
> ✅ **API-4: Media PATCH Tanpa Ownership/Site Check**
> `PATCH /api/v1/media/:id` hanya memerlukan `requireAuth` tanpa validasi kepemilikan atau siteMiddleware.

> [!WARNING]
> ✅ **API-5: Error Handling Fragile String Matching**
> `error.middleware.ts` menggunakan `err.message?.includes('salah')` untuk menentukan status code. Ini rapuh dan mudah bypass jika pesan error berubah.

> [!NOTE]
> ✅ **API-6: Meilisearch Filter Injection**
> `search.service.ts` baris 46 membangun filter string dengan interpolasi langsung:
> ```ts
> let filter = `siteId = "${filters.siteId}"`
> ```
> Jika siteId mengandung karakter khusus, ini bisa menjadi injection vector.

> [!WARNING]
> ✅ **API-7: Admin Router requireAdmin Duplikasi**
> `admin.router.ts` mendefinisikan `requireAdmin` sendiri (baris 9-15) alih-alih menggunakan `requireRole(['superadmin','wapimred'])` dari auth.middleware. Inkonsistensi maintenance.

---

## 5. Audit Keamanan

### 5.1 Yang Sudah Benar ✅

| Fitur | Implementasi |
|-------|-------------|
| Password Hashing | bcrypt, salt round 10 |
| Password Policy | Min 8 char, uppercase, lowercase, angka, special char |
| JWT | Signed token, 15 min expiry, refresh token 7 hari |
| CORS | Whitelist domain + regex pattern |
| Helmet | Aktif (X-Frame-Options, CSP, HSTS, dll) |
| Rate Limiting | Auth: 10/min, API: 100/min, AI: 20/jam |
| XSS Prevention | DOMPurify sanitize semua input |
| Account Lockout | Login gagal → lock 15 menit (in-memory) |
| Input Validation | Zod schema pada semua auth endpoint |
| Security Headers | X-Frame-Options, X-Content-Type-Options, HSTS, CSP |
| KYC File Validation | FileValidator + watermark + audit trail akses |
| Token Blacklisting | Refresh token di-blacklist saat logout |
| Sentry Integration | Error tracking dengan sanitized headers |

### 5.2 Temuan Keamanan Kritis

> [!CAUTION]
> ✅ **SEC-1: `.env` File Committed ke Git**
> File `.env` root (1167 bytes) berisi placeholder credential dan **ada di working tree**. Meskipun berisi placeholder, file ini seharusnya di `.gitignore`. Demikian juga `apps/api/.env` dan `apps/web/.env`.

> [!CAUTION]
> ✅ **SEC-2: Token Disimpan di localStorage**
> `lib/api.ts` menyimpan `accessToken` dan `refreshToken` di `localStorage`. Ini rentan terhadap XSS. Sebaiknya gunakan httpOnly cookie.

> [!WARNING]
> ✅ **SEC-3: Account Lockout In-Memory**
> `accountLockout.ts` menggunakan in-memory Map. Restart server = reset semua lockout. Pindahkan ke Redis.

> [!WARNING]
> ✅ **SEC-4: Rate Limiter In-Memory**
> `express-rate-limit` default menggunakan in-memory store. Dalam cluster/multi-instance, rate limit tidak efektif. Gunakan `rate-limit-redis`.

> [!WARNING]
> ✅ **SEC-5: TLS `rejectUnauthorized: false`**
> `email.service.ts` baris 37 menonaktifkan TLS certificate validation. Ini hanya boleh di development.

> [!WARNING]
> **SEC-6: `trust proxy` Tanpa Konfigurasi Spesifik**
> `app.set('trust proxy', 1)` sudah benar untuk 1 proxy, tapi pastikan ini match dengan jumlah proxy di production.

---

## 6. Audit Infrastruktur

### 6.1 Docker

**Positif:**
- ✅ Multi-stage build (deps → builder → runner)
- ✅ Non-root user (`apiuser:nodejs`)
- ✅ Healthcheck pada API dan PostgreSQL
- ✅ Internal-only port exposure (`127.0.0.1:3001:3001`)
- ✅ Auto-migration pada startup (`pnpm run db:migrate:deploy && node dist/...`)

**Temuan:**

> [!WARNING]
> ✅ **INFRA-1: Redis & Meilisearch Tidak Ada di docker-compose**
> `docker-compose.backend.yml` hanya berisi PostgreSQL dan API. Redis dan Meilisearch tidak di-deploy, padahal API menggunakannya. Cache/search akan selalu fallback ke null.

> [!WARNING]
> **INFRA-2: Volume `uploads_data` Didefinisikan Tapi Tidak Dipakai**
> Baris 53 mendefinisikan named volume `uploads_data` tapi API container menggunakan bind mount ke `/opt/beritakarya/uploads`.

> [!NOTE]
> **INFRA-3: Full COPY di Runner Stage**
> `COPY --from=builder --chown=apiuser:nodejs /app /app` menyalin seluruh monorepo (~300MB+). Pertimbangkan hanya copy `dist/`, `node_modules/`, dan `prisma/`.

### 6.2 Nginx

**Positif:**
- ✅ HTTP → HTTPS redirect
- ✅ TLS 1.2/1.3 only
- ✅ Rate limiting (auth: 10r/m, api: 100r/m)
- ✅ Static media serving langsung dari Nginx (bypass Express)
- ✅ `server_tokens off`

**Temuan:**

> [!WARNING]
> ✅ **INFRA-4: Media CORS Wildcard**
> `location /api/v1/media/uploads/` menggunakan `Access-Control-Allow-Origin "*"`. Ini memungkinkan hotlinking dari domain manapun.

> [!WARNING]
> ✅ **INFRA-5: Main Domain Redirect ke /health**
> `beritakarya.co` dan `www.beritakarya.co` di-redirect ke `https://api.beritakarya.co/health`. Ini seharusnya redirect ke frontend web.

> [!NOTE]
> ✅ **INFRA-6: Tidak Ada Gzip Compression**
> Nginx config tidak mengaktifkan `gzip` compression untuk response API.

### 6.3 CI/CD

- ✅ GitHub Actions CI (`ci.yml`) dan Deploy (`deploy.yml`) ada
- ✅ Automated deployment pipeline

### 6.4 Backup

- ✅ Script backup database (`backup-database.sh`)
- ✅ Auto-cleanup backup > 7 hari
- ⚠️ Email notification via `mail` command (perlu dikonfirmasi ketersediaan di server)
- ❌ Tidak ada backup untuk uploaded files/media

### 6.5 Logging

- ✅ Winston logger dengan daily rotation
- ✅ Structured JSON logging di production
- ✅ Error-only file terpisah
- ✅ Optional HTTP transport ke ELK/Logstash
- ✅ HTTP request logging middleware dengan duration tracking

---

## 7. Temuan Frontend (Next.js)

### 7.1 Arsitektur Web

- **Framework**: Next.js 16 dengan App Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.4
- **Animasi**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### 7.2 Route Structure

```
app/
├── login/                    → Halaman login
├── register/                 → Halaman registrasi
├── [site]/                   → Dynamic site routing
│   ├── page.tsx              → Homepage portal berita
│   ├── artikel/              → Halaman baca artikel
│   ├── kebijakan-privasi/    → Privacy policy
│   ├── p/                    → Static pages
│   ├── robots.ts             → Dynamic robots.txt
│   ├── sitemap.ts            → Dynamic sitemap
│   └── dashboard/            → Admin panel
│       ├── page.tsx          → Dashboard overview (28KB!)
│       ├── layout.tsx        → Sidebar layout
│       ├── articles/         → Manajemen artikel
│       ├── review/           → Antrian editorial
│       ├── media/            → Media library
│       ├── categories/       → Kategori
│       ├── users/            → Manajemen user
│       ├── team/             → Monitor tim
│       ├── kyc/              → KYC submission
│       ├── settings/         → Pengaturan site
│       ├── audit/            → Audit log viewer
│       ├── ads/              → Iklan & banner
│       ├── comments/         → Moderasi komentar
│       ├── invitations/      → Sistem undangan
│       ├── calendar/         → Kalender editorial
│       └── admin/            → Superadmin panel
```

### 7.3 Temuan Frontend

> [!WARNING]
> ✅ **FE-1: Dashboard page.tsx 28KB**
> File ini terlalu besar. Perlu dipecah menjadi komponen yang lebih kecil.

> [!WARNING]
> ✅ **FE-2: Auth Check Client-Side Only**
> Dashboard layout melakukan auth check di `useEffect`. User yang tidak login bisa melihat flash of dashboard content sebelum redirect.

> [!NOTE]
> **FE-3: Hardcoded Role Labels**
> Role labels (`superadmin → Superadmin`, `wapimred → Wapimred`) diduplikasi di multiple files.

---

## 8. Ringkasan Prioritas Perbaikan

### 🔴 Kritis (Harus Segera)

| # | Temuan | Impact |
|---|--------|--------|
| 1 | **API-2**: Category & Site routes tanpa auth | Siapapun bisa CRUD site & kategori ✅ |
| 2 | **SEC-1**: `.env` file committed | Credential exposure risk ✅ |
| 3 | **API-1**: Logout tanpa requireAuth | Account takeover vector ✅ |

### 🟡 Tinggi (Sprint Berikutnya)

| # | Temuan | Impact |
|---|--------|--------|
| 4 | **SEC-2**: Token di localStorage | XSS → token theft ✅ |
| 5 | **API-3/4**: Media tanpa ownership check | Data manipulation ✅ |
| 6 | **DB-3**: PrismaClient baru di cron | Connection leak ✅ |
| 7 | **SEC-3/4**: In-memory lockout & rate-limit | Bypass setelah restart ✅ |
| 8 | **INFRA-1**: Redis/Meili tidak di-compose | Cache/search non-functional ✅ |

### 🟢 Medium (Backlog)

| # | Temuan | Impact |
|---|--------|--------|
| 9 | **DB-1/2**: Role & status tanpa enum | Data integrity risk ✅ |
| 10 | **DB-7**: BlacklistedToken tanpa cleanup | Table bloat ✅ |
| 11 | **INFRA-4**: Media CORS wildcard | Hotlinking ✅ |
| 12 | **INFRA-5**: Domain redirect ke /health | UX ✅ |
| 13 | **INFRA-6**: Tidak ada gzip | Performance ✅ |
| 14 | **DB-4/5**: AIUsage/AuditLog tanpa FK | Orphan data ✅ |
| 15 | **FE-1/2**: Large component & client-only auth | UX/performance ✅ |

---

## 9. Rekomendasi Arsitektur

1. **Tambahkan enum Prisma** untuk `User.role` dan `Article.status`
2. **Pindahkan token ke httpOnly cookie** untuk mitigasi XSS
3. **Gunakan Redis store** untuk rate-limit dan account lockout
4. **Tambahkan Redis & Meilisearch** ke docker-compose production
5. **Implementasi RBAC middleware terpusat** alih-alih inline role check
6. **Pisahkan file besar** (dashboard page, KYC controller 543 baris)
7. **Tambahkan cron** untuk cleanup BlacklistedToken yang expired
8. **Pasang server-side auth guard** di Next.js middleware untuk dashboard routes

---

*Laporan ini dihasilkan berdasarkan audit kode statis menyeluruh pada seluruh codebase BeritaKarya.*

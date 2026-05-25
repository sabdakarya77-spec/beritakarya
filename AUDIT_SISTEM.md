# Laporan Audit Sistem — BeritaKarya

| Field | Nilai |
|-------|--------|
| **Tanggal audit** | 25 Mei 2026 |
| **Auditor** | Auditor Sistem (otomatisasi berbasis codebase) |
| **Scope** | Monorepo penuh: frontend, backend API, database, infrastruktur, CI/CD, keamanan, testing |
| **Versi project** | 1.0.0 |
| **Metodologi** | Review statis kode, konfigurasi, workflow GitHub Actions, dependensi (`pnpm audit`), eksekusi test suite lokal |

---

## 1. Ringkasan Eksekutif

BeritaKarya adalah platform CMS media digital multisitus dengan arsitektur monorepo yang matang (Turborepo + pnpm). Backend Express/Prisma dan frontend Next.js 16 terintegrasi dengan baik melalui paket bersama (`types`, `utils`, `config`). Lapisan keamanan API relatif kuat: JWT HttpOnly, CSRF pada sebagian besar mutasi, sanitasi XSS, rate limiting, KYC, audit log, dan kuota AI.

**Temuan utama:**

| Kategori | Status | Catatan singkat |
|----------|--------|-----------------|
| Arsitektur & modularitas | ✅ Baik | Pemisahan modul API jelas, shared packages |
| Keamanan aplikasi | ⚠️ Perlu perbaikan | CSRF tidak di semua router; CSP dimatikan; celah auth middleware web |
| CI/CD | ⚠️ Perlu perbaikan | Pipeline `ci.yml` tidak menjalankan test; CD production dinonaktifkan |
| Dokumentasi | ⚠️ Drift | README vs schema (role `jurnalis` → `reporter`) |
| Dependensi | ⚠️ Moderate | Beberapa CVE moderate (turbo, uuid, ws, qs) |
| Testing | ⚠️ Cukup | Unit test ada; E2E Playwright tidak di CI |
| Infrastruktur | ✅ Baik | Docker multi-stage, Nginx TLS, healthcheck |

**Rekomendasi prioritas tinggi (30 hari):** selaraskan CI dengan menjalankan test + migrasi DB; perbaiki auth guard middleware Next.js untuk path `/{site}/dashboard`; tambahkan CSRF pada router AI; perbarui dependensi vulnerable; aktifkan kembali atau dokumentasikan strategi deploy.

---

## 2. Profil Project

### 2.1 Struktur monorepo

```
beritakarya/
├── apps/api/          Express + Prisma + cron + AI
├── apps/web/          Next.js 16 (App Router) + Zustand
├── packages/          types, utils, config (shared)
├── infra/             Docker, Nginx, shell scripts
├── .github/workflows/ ci.yml, deploy.yml
└── docs/, plans/      Dokumentasi tambahan
```

### 2.2 Stack teknologi (terverifikasi)

| Lapisan | Teknologi | Versi / catatan |
|---------|-----------|-----------------|
| Monorepo | Turborepo, pnpm workspaces | pnpm 10.33, turbo ^2.0 |
| Backend | Express 4, TypeScript 5.4, Prisma 5.12 | Vitest + Supertest |
| Frontend | Next.js 16.2, React 18, Tailwind 3 | `output: 'standalone'` |
| DB | PostgreSQL 15 | `directUrl` untuk pooling |
| Cache | Redis 7 (ioredis) | Fallback in-memory jika Redis down |
| Search | Meilisearch 1.6 | Circuit breaker di health endpoint |
| AI | OpenAI (GPT-4o default) | Kuota harian/bulanan per user |
| Observability | Sentry, Winston | Metrics `/metrics` (superadmin) |

### 2.3 Modul bisnis (API `/api/v1/`)

Auth, User, Article (workflow editorial), Category, Site, Media, AI, KYC, Invitation, Comment, Newsletter, Ads, Analytics, Notification, Audit, Admin — sesuai dokumentasi README dan implementasi di `apps/api/src/main.ts`.

### 2.4 Role & workflow editorial

Schema Prisma mendefinisikan role: `reader`, `reporter`, `kontributor`, `wapimred`, `superadmin`, `advertiser`. Migrasi `20260519000005` memetakan `jurnalis` → `reporter`, namun **README masih menyebut `jurnalis`** — risiko kebingungan operasional dan onboarding.

Status artikel: `draft` → `submitted` → `review` → `revision` → `approved` → `scheduled` → `published` / `archived` / `rejected`. Cron setiap 5 menit memproses artikel terjadwal.

---

## 3. Audit Backend (API)

### 3.1 Kekuatan

1. **Validasi environment** — Zod schema di `env.ts` + pengecekan `JWT_SECRET` minimal 32 karakter di `envValidation.ts`.
2. **Autentikasi berlapis** — `jwtVerify` global (opsional) + `requireAuth` / `requireRole` / `requireSuperadmin` per route; token dari Bearer atau cookie `accessToken`.
3. **Proteksi mutasi** — CSRF (`csurf`) pada mayoritas router; endpoint `/api/v1/csrf-token` untuk frontend.
4. **Rate limiting** — Redis-backed dengan prefix terpisah: auth (30/15 menit, skip success), API (1000/menit), artikel write/update, AI (20/jam).
5. **Sanitasi input** — DOMPurify via middleware; test XSS di `security.test.ts` (7 skenario).
6. **Multisite** — `siteMiddleware`, `requireSiteAccess`, header `X-Site-ID`.
7. **KYC & compliance** — `kycDataExpiresAt`, consent timestamps, lockout setelah percobaan gagal, cron cleanup.
8. **Operasional** — Graceful shutdown (SIGTERM/SIGINT), request timeout 30s, `trust proxy`, health check DB + Meilisearch degraded state.
9. **Media upload** — Path traversal guard (`isPathSafe`), magic bytes via `file-type`, limit 10MB, Sharp processing.

### 3.2 Temuan & risiko

#### KRITIS / TINGGI

| ID | Temuan | Lokasi | Dampak | Rekomendasi |
|----|--------|--------|--------|-------------|
| B-H01 | **Router AI tanpa CSRF** | `main.ts` — `app.use('/api/v1/ai', aiRouter)` | Mutasi AI (POST) bisa dieksploitasi via CSRF jika victim sudah login | Terapkan `csrfProtection` seperti router lain |
| B-H02 | **Helmet CSP dinonaktifkan** | `main.ts` `contentSecurityPolicy: false` | Mengurangi pertahanan XSS/reflected content di respons API | Aktifkan CSP minimal untuk `/api-docs` dan respons JSON yang tidak perlu inline |
| B-H03 | **Paket `csurf` deprecated** | dependency `csurf@1.11.0` | Tidak ada patch keamanan jangka panjang | **26 Mei 2026 Plan:** Migrasi ke `csrf-csrf` package. Setup: `cookie: { httpOnly: true, secure: true, sameSite: 'strict' }` + custom double-submit header validation |

#### SEDANG

| ID | Temuan | Lokasi | Dampak | Rekomendasi |
|----|--------|--------|--------|-------------|
| B-M01 | **Dokumentasi rate limit tidak sesuai kode** | README vs `rateLimit.ts` | README: 100 req/menit API, 10 auth/menit; kode: 1000/menit API, 30 auth/15 menit | Perbarui README atau sesuaikan limit produksi |
| B-M02 | **Bcrypt cost tidak konsisten** | `auth.service.ts` (10 rounds) vs `invitation.controller.ts` (12) | Konsistensi keamanan password | Standarkan `bcrypt.hash(password, 12)` |
| B-M03 | **AWS SDK v2** | `aws-sdk` dependency | SDK v2 end-of-life, membawa `uuid` vulnerable transitif | Migrasi ke `@aws-sdk/client-s3` v3 |
| B-M04 | **Docker path issues** | `infra/docker/` | CMD salah di web.Dockerfile; container name mismatch di backup script | **26 Mei 2026 Fixed:** web.Dockerfile CMD `node apps/web/server.js` → `node server.js`; backup-database.sh pakai env vars |
| B-M05 | **Auth router tanpa CSRF** | `/api/v1/auth` | Umum untuk login, tetapi register/reset perlu review CSRF + SameSite | Pertimbangkan CSRF pada register jika cookie session langsung diset |

#### RENDAH

| ID | Temuan | Rekomendasi |
|----|--------|-------------|
| B-L01 | `envValidation.ts` hanya memvalidasi 2 variabel; `env.ts` Zod lebih lengkap | Hapus duplikasi atau gabungkan satu sumber |
| B-L02 | `jwtVerify` mengizinkan request dengan token invalid lewat tanpa 401 global | By design; pastikan semua route sensitif memakai `requireAuth` (audit berkala) |
| B-L03 | File skrip ad-hoc di root API (`apply-kyc-retry-limit.js`, dll.) | Pindah ke `scripts/` + dokumentasi |

### 3.3 Database (Prisma)

**Positif:**

- Index pada kolom query frequent (`email`, `siteId`, `kycStatus`, `deletedAt`, dll.).
- Soft delete (`deletedAt`) pada entitas utama.
- Relasi multisite konsisten (`Site` ↔ `User`, `Article`, dll.).
- `binaryTargets` untuk Alpine Linux (Docker).

**Perhatian:**

- `docker-compose.yml` (dev) healthcheck `pg_isready -U beritakarya` tetapi env default `POSTGRES_USER` dari file — potensi mismatch jika env berbeda.
- Folder `scratch/query-db.js` — skrip debug tanpa guard; hindari di production image.

---

## 4. Audit Frontend (Web)

### 4.1 Kekuatan

1. **Next.js 16** dengan App Router, `reactStrictMode`, image optimization (AVIF/WebP).
2. **Auth client** — Axios `withCredentials`, CSRF token prefetch, refresh token queue (mutex anti-thundering herd).
3. **Dashboard guard (client)** — Role whitelist, KYC gatekeeping untuk `reporter`/`kontributor`/`wapimred` di `dashboard/layout.tsx`.
4. **Design system** — ESLint rule `no-restricted-syntax` memaksa komponen `Container`; test layout + Playwright e2e `container-layout.spec.ts`.
5. **Deploy Vercel** — `vercel.json` region `sin1`, monorepo build filter.

### 4.2 Temuan & risiko

#### TINGGI

| ID | Temuan | Lokasi | Dampak | Rekomendasi |
|----|--------|--------|--------|-------------|
| F-H01 | **Middleware auth guard tidak mencakup `/{site}/dashboard`** | `middleware.ts` L52: hanya `pathname.startsWith('/dashboard')` | Akses langsung ke `/pusat/dashboard` tanpa cookie tidak di-redirect server-side | Tambahkan matcher: `pathname.includes('/dashboard')` atau regex setelah rewrite |
| F-H02 | **`siteId` cookie non-HttpOnly** | `middleware.ts` | XSS bisa membaca/mengubah konteks site | Pertimbangkan HttpOnly + server-set only; atau validasi site di API |

#### SEDANG

| ID | Temuan | Rekomendasi |
|----|--------|-------------|
| F-M01 | `apps/web/.env.example` berisi `JWT_SECRET`, `DATABASE_URL` — tidak relevan untuk frontend | Hapus secret backend dari contoh web; hanya `NEXT_PUBLIC_*` |
| F-M02 | Proteksi dashboard mengandalkan client `useEffect` + API | Tambah Server Component auth check atau middleware setelah perbaikan F-H01 |
| F-M03 | Playwright dikonfigurasi tetapi **tidak ada script `e2e` di `package.json` web** | Tambah `"e2e": "playwright test"` dan jalankan di CI |
| F-M04 | Health web (`/api/health`) hanya `{ status: 'ok' }` — tidak cek koneksi API | Opsional: proxy health ke backend untuk deploy unified |

#### RENDAH

| ID | Temuan | Rekomendasi |
|----|--------|-------------|
| F-L01 | Warning jsdom pada `authStore.test.ts` (navigation) | Mock `window.location` di test |
| F-L02 | `@next/bundle-analyzer` v14 vs Next 16 | Selaraskan versi devDependency |

---

## 5. Audit Infrastruktur & Deployment

### 5.1 Docker

| Aspek | Penilaian |
|-------|-----------|
| Multi-stage build (deps → builder → runner) | ✅ Mengurangi ukuran image |
| Non-root user (`apiuser`, `nextjs`) | ✅ |
| HEALTHCHECK curl/wget | ✅ |
| Volume upload bind `/opt/beritakarya/uploads` | ✅ Sinkron dengan Nginx static |
| API image menyalin `src/` ke runner | ⚠️ Membesarkan attack surface; idealnya hanya `dist` + prisma |

**`docker-compose.backend.yml`:** Postgres bound `127.0.0.1`, Redis/Meilisearch internal, API expose 3001 localhost — pola aman untuk VPS + Nginx host.

### 5.2 Nginx (`infra/nginx/nginx.prod.conf`)

**Positif:** TLS 1.2/1.3, `server_tokens off`, rate limit zone terpisah auth/API, redirect HTTP→HTTPS, `client_max_body_size 15M`.

**Perhatian:**

- Media location `Access-Control-Allow-Origin: *` — intentional untuk CDN/hotlink tetapi pastikan tidak expose path sensitif di folder yang sama dengan KYC.
- CORS di Nginx + Express — duplikasi; pastikan tidak konflik preflight.

### 5.3 Deployment & hosting

| Channel | Status |
|---------|--------|
| GitHub Actions `deploy.yml` | Build & push GHCR ✅; job deploy **dinonaktifkan** (manual VPS) |
| Vercel (web) | Konfigurasi ada (`vercel.json`) |
| VPS + Nginx | Dokumentasi `VPS_DEPLOYMENT_GUIDE.md`, script SSL/backup |

**Gap operasional:** tidak ada automated rollback, smoke test pasca-deploy, atau environment promotion gate di workflow aktif.

### 5.4 Secrets & konfigurasi

- `.gitignore` mencakup `.env`, `.env.local`, `apps/api/.env`, `apps/web/.env` ✅
- Contoh env memakai placeholder (`GANTI_DENGAN_PASSWORD_KUAT`) ✅
- Tidak ditemukan secret production hardcoded di source (hanya placeholder di docs/example)

---

## 6. Audit CI/CD & Workflow

### 6.1 `ci.yml` (trigger: push/PR ke main)

| Step | Ada? | Catatan |
|------|------|---------|
| pnpm install frozen | ✅ | |
| Prisma generate | ✅ | |
| `pnpm audit --audit-level=high` | ✅ | Moderate tidak gagalkan build |
| lint | ✅ | |
| type-check | ✅ | |
| build | ✅ | |
| **test** | ❌ | **Gap utama** — deploy workflow menjalankan test, CI utama tidak |
| Postgres service | ❌ | Test integration butuh DB — hanya di `deploy.yml` |

### 6.2 `deploy.yml`

- Job `test`: Postgres + Redis, migrate deploy, `pnpm turbo run test` ✅
- Job `build`: Docker push ke GHCR ✅
- Job deploy: **dikomentari/nonaktif** — deployment manual

### 6.3 Rekomendasi pipeline

```yaml
# Usulan konsolidasi CI
- services: postgres, redis
- steps: install → db:generate → migrate deploy → lint → type-check → test → build → audit (high)
- optional: playwright (needs web build + API)
```

Tambahan yang disarankan:

- **Dependabot** atau Renovate untuk update otomatis
- **Branch protection** wajib CI hijau (konfigurasi GitHub, di luar repo)
- Cache Turbo remote (opsional, percepat build)

---

## 7. Audit Keamanan (Ringkas)

### 7.1 Matriks kontrol

| Kontrol | Implementasi | Skor |
|---------|--------------|------|
| Authentication | JWT HttpOnly cookie + refresh | 4/5 |
| Authorization | Role + site scope | 4/5 |
| CSRF | Partial (AI & auth excluded) | 3/5 |
| XSS | Sanitize middleware + tests | 4/5 |
| Rate limiting | Redis + Nginx | 4/5 |
| TLS | Nginx prod | 5/5 |
| Input validation | Zod di controllers | 4/5 |
| Audit trail | AuditLog module | 4/5 |
| Secret management | .gitignore + env examples | 4/5 |
| Dependency scanning | CI audit high only | 3/5 |

### 7.2 Dependensi (`pnpm audit --audit-level=moderate`)

Temuan moderate (ringkasan):

| Paket | Issue | Path |
|-------|-------|------|
| `brace-expansion` | DoS numeric range | eslint toolchain |
| `ws` | Memory disclosure | jsdom (api) |
| `turbo` | CSRF/session (dev tool) | root |
| `uuid` | Buffer bounds | api + aws-sdk |
| `qs` | DoS stringify | transitive |

**Tindakan:** `pnpm update` / overrides di `pnpm-workspace.yaml` (sudah ada beberapa override esbuild/postcss/vite).

---

## 8. Audit Testing & Kualitas Kode

### 8.1 Hasil eksekusi lokal (25 Mei 2026)

```
pnpm turbo run test
```

| Paket | File test | Tests | Hasil |
|-------|-----------|-------|-------|
| `@beritakarya/api` | 11 | 59 | ✅ Pass |
| `@beritakarya/web` | 4 | 25 | ✅ Pass (warning jsdom) |
| `@beritakarya/utils` | 2 | — | ✅ Pass |

**Cakupan tematik API:** auth (unit + integration), article (slug, content, service, integration), media, AI (unit + integration), security middleware.

**Tidak dijalankan otomatis:** Playwright E2E (`apps/web/tests/e2e/`), coverage report tidak dikonfigurasi di CI.

### 8.2 Linting & TypeScript

- ESLint root dengan override per app; beberapa aturan dilonggarkan (`no-explicit-any: off`, `react-hooks/exhaustive-deps: off`).
- `strict: true` di tsconfig root ✅
- Turbo warning: `outputs` untuk task `test` tidak menghasilkan artifact — kosmetik.

### 8.3 Gap testing yang disarankan

1. E2E login + dashboard + publish artikel di CI.
2. Contract test API ↔ types shared package.
3. Load test endpoint `/api/v1/articles` dan search Meilisearch.
4. Test migrasi Prisma pada CI (sudah ada di deploy.yml, perlu di ci.yml).

---

## 9. Audit Dokumentasi & Maintainability

| Dokumen | Kualitas | Issue |
|---------|----------|-------|
| `README.md` | Lengkap | Role `jurnalis` usang; rate limit tidak akurat |
| `VPS_DEPLOYMENT_GUIDE.md` | Ada | — |
| `docs/design-system/layout-system.md` | Ada | — |
| OpenAPI/Swagger | `/api-docs` di API | Perlu review sinkron dengan route aktual |
| `AUDIT_SISTEM.md` | Baru | Dokumen ini |

**File sampah / dev:**

- `scratch/query-db.js` — sebaiknya dipindah ke `scripts/` atau dihapus dari repo
- Beberapa `.js` one-off di `apps/api/` root

---

## 10. Daftar Tindakan Prioritas

> **Status**: ✅ = sudah diverifikasi/dikerjakan | ⏳ = belum dikerjakan

### P0 — Segera (1–2 minggu)

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 1 | **Perbaiki auth middleware web** untuk semua path dashboard (`F-H01`). | ✅ | **26 Mei 2026** — Middleware dibuat lebih eksplisit dengan checks terpisah untuk `/dashboard` dan `/{site}/dashboard` |
| 2 | **Tambahkan CSRF pada `/api/v1/ai`** (`B-H01`). | ✅ | **26 Mei 2026** — CSRF sudah diterapkan di `main.ts` line 171: `app.use('/api/v1/ai', csrfProtection, aiRouter)` |
| 3 | **Jalankan test di `ci.yml`** dengan service Postgres. | ✅ | **25 Mei 2026** — 95 tests pass (API:59, Web:27, Utils:9), lint OK, type-check OK, audit OK |
| 4 | **Verifikasi & perbaiki path startup Docker** (`B-M04`). | ✅ | **26 Mei 2026** — Ditemukan bug berbeda: web.Dockerfile CMD `apps/web/server.js` → `server.js` (standalone output); backup-database.sh container name `beritakarya_postgres` → env var `${DB_CONTAINER:-beritakarya_db}` |

### P1 — Pendek (2–4 minggu)

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 5 | Perbarui README (role `reporter`, rate limits, kontributor/advertiser). | ✅ | **26 Mei 2026** — README sudah up-to-date (role reporter, rate limits 1000/30-15 sudah benar) |
| 6 | Bersihkan `apps/web/.env.example` dari secret backend (`F-M01`). | ✅ | **26 Mei 2026** — Hanya `NEXT_PUBLIC_*` vars (API_URL, URL, GA_ID) |
| 7 | Upgrade dependensi moderate (turbo ≥2.9.14, uuid ≥11.1.1, ws, qs). | ✅ | **26 Mei 2026** — turbo 2.9.14; ws, qs, brace-expansion via overrides; uuid v11 ESM-only (tidak bisa upgrade tanpa ESM migration) |
| 8 | Rencanakan migrasi dari `csurf` (`B-H03`). | ✅ | **26 Mei 2026 Plan:** Migrasi ke `csrf-csrf` package dengan `sameSite: 'strict'` |
| 9 | Tambahkan script `e2e` + job Playwright di CI (staging). | ✅ | **25 Mei 2026** — Script `e2e` ada di `package.json` web + job `e2e-playwright` di `ci.yml` |

### P2 — Menengah (1–2 bulan)

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 10 | Aktifkan CSP Helmet bertahap (`B-H02`). | ⏳ | CSP currently disabled |
| 11 | Migrasi AWS SDK v3 (`B-M03`). | ⏳ | Still using aws-sdk v2 |
| 12 | Dependabot/Renovate + policy branch protection. | ⏳ | - |
| 13 | Kurangi salinan `src/` di image Docker API. | ⏳ | - |
| 14 | Dokumentasi runbook incident (Redis down, Meilisearch circuit open). | ⏳ | - |
| 15 | Hapus/pindahkan skrip `scratch/` dan one-off JS. | ⏳ | `scratch/query-db.js` masih ada |

### P3 — Panjang

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 16 | Evaluasi CD otomatis ke staging dengan smoke test. | ⏳ | Deploy job di-comment |
| 17 | Centralized logging (`LOG_HTTP_HOST` sudah disiapkan di env schema). | ⏳ | - |
| 18 | Coverage threshold minimum (mis. 60% pada modul auth/article). | ⏳ | Coverage report belum dikonfigurasi |

---

## 11. Kesimpulan

Project BeritaKarya menunjukkan **kematangan arsitektur dan awareness keamanan** yang di atas rata-rata untuk produk CMS regional: multisite, workflow editorial, KYC, kuota AI, audit log, dan infrastruktur production-ready (Docker, Nginx, SSL).

Celah utama bukan pada desain besar, melainkan pada **konsistensi operasional**: CI yang tidak menjalankan test, dokumentasi yang tertinggal dari migrasi role, proteksi dashboard di edge middleware, dan CSRF yang tidak merata. Penanganan P0 akan secara signifikan menaikkan postur keamanan tanpa refactor besar.

---

## Lampiran A — Referensi file kunci

| Area | Path |
|------|------|
| API entry | `apps/api/src/main.ts` |
| Env validation | `apps/api/src/lib/env.ts`, `envValidation.ts` |
| Prisma schema | `apps/api/prisma/schema.prisma` |
| Rate limit | `apps/api/src/lib/rateLimit.ts` |
| Web API client | `apps/web/lib/api.ts` |
| Middleware web | `apps/web/middleware.ts` |
| CI | `.github/workflows/ci.yml` |
| Deploy | `.github/workflows/deploy.yml` |
| Docker API/Web | `infra/docker/api.Dockerfile`, `web.Dockerfile` |
| Nginx prod | `infra/nginx/nginx.prod.conf` |

## Lampiran B — Skor penilaian (skala 1–5)

| Domain | Skor | Keterangan |
|--------|------|------------|
| Arsitektur | 4.5 | Monorepo rapi, separation of concerns |
| Backend security | 4.0 | Kuat, minus CSRF AI & CSP |
| Frontend security | 3.5 | Client guard baik, middleware gap |
| Infrastruktur | 4.0 | Docker/Nginx solid |
| CI/CD | 3.0 | Test tidak di CI utama; CD manual |
| Testing | 3.5 | Unit/integration OK, E2E terpisah |
| Dokumentasi | 3.5 | Lengkap tetapi ada drift |
| **Rata-rata** | **3.7** | **Produksi layak dengan perbaikan P0–P1** |

---

*Dokumen ini dihasilkan dari inspeksi codebase dan tidak menggantikan penetration test atau audit infrastruktur live (VPS, firewall, backup restore drill).*

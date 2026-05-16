# BeritaKarya — Platform Media Digital Multisitus

Platform manajemen konten (CMS) modern berbasis monorepo untuk mengelola jaringan media digital. Dibangun dengan Next.js (frontend), Express.js (backend API), dan PostgreSQL sebagai database utama.

---

## 🏗️ Arsitektur Project

```
beritakarya/                    ← Monorepo Root (Turborepo + pnpm)
├── apps/
│   ├── api/                    ← Backend REST API (Express.js + TypeScript)
│   │   ├── src/
│   │   │   ├── modules/        ← Fitur utama (auth, article, kyc, dll)
│   │   │   ├── middleware/     ← Auth, CSRF, rate-limit, sanitize, dll
│   │   │   ├── ai/             ← Integrasi OpenAI (rewrite, grammar, dll)
│   │   │   ├── cron/           ← Scheduled tasks (KYC cleanup, token cleanup)
│   │   │   ├── db/             ← Prisma client
│   │   │   └── lib/            ← Logger, env, monitoring, rate limit
│   │   └── prisma/             ← Schema database & migration history
│   └── web/                    ← Frontend (Next.js + TypeScript)
├── packages/
│   ├── types/                  ← Shared TypeScript types
│   ├── utils/                  ← Shared utilities
│   └── config/                 ← Shared ESLint/TS config
├── infra/
│   ├── docker/                 ← Dockerfile & docker-compose
│   ├── nginx/                  ← Konfigurasi Nginx (dev/staging/prod)
│   └── scripts/                ← Shell scripts (setup, SSL, backup)
└── plans/                      ← Catatan perencanaan & arsitektur
```

---

## 🔧 Tech Stack

| Komponen      | Teknologi                                        |
|---------------|--------------------------------------------------|
| **Monorepo**  | Turborepo + pnpm workspaces                      |
| **Backend**   | Express.js 4, TypeScript, Prisma ORM             |
| **Frontend**  | Next.js 16, React 18, Tailwind CSS               |
| **Database**  | PostgreSQL 15                                    |
| **Cache**     | Redis 7 (via ioredis)                            |
| **Search**    | Meilisearch v1.6                                 |
| **AI**        | OpenAI API (GPT-4o)                              |
| **Auth**      | JWT (cookie-based) + CSRF Protection             |
| **Container** | Docker + Docker Compose                          |
| **Web Server**| Nginx (host-level reverse proxy)                 |
| **SSL**       | Let's Encrypt (Certbot, wildcard DNS-01)         |
| **Monitoring**| Sentry, Winston Logger                           |

---

## 🧩 Modul API (`/api/v1/`)

| Modul          | Endpoint              | Deskripsi                                    |
|----------------|-----------------------|----------------------------------------------|
| Auth           | `/auth`               | Login, register, refresh token, logout       |
| User           | `/users`              | CRUD user, profil                            |
| Article        | `/articles`           | CRUD artikel, workflow editorial             |
| Category       | `/categories`         | Manajemen kategori                           |
| Site           | `/sites`              | Manajemen multisitus                         |
| Media          | `/media`              | Upload & manajemen gambar/file               |
| AI             | `/ai`                 | Rewrite, expand, grammar, readability        |
| KYC            | `/kyc`                | Verifikasi identitas jurnalis                |
| Invitation     | `/invitations`        | Undangan user oleh admin                     |
| Comment        | `/comments`           | Komentar artikel                             |
| Newsletter     | `/newsletter`         | Subscriber newsletter                        |
| Advertisement  | `/ads`                | Manajemen iklan per slot                     |
| Analytics      | `/analytics`          | Page view & statistik konten                 |
| Notification   | `/notifications`      | Notifikasi in-app                            |
| Audit          | `/audit`              | Audit log semua aksi editorial               |
| Admin          | `/admin`              | Panel administrasi superadmin                |

---

## 👥 Sistem Role

| Role          | Kemampuan                                                                       |
|---------------|---------------------------------------------------------------------------------|
| `reader`      | Membaca konten publik, berkomentar                                               |
| `jurnalis`    | Menulis & submit artikel (perlu KYC approved)                                   |
| `wapimred`    | Review, approve, reject artikel; kelola kategori & pengaturan site               |
| `superadmin`  | Akses penuh: semua site, semua user, buat/hapus site                            |

---

## 🛡️ Fitur Keamanan

- **JWT Cookie-based Auth** — Token disimpan di HttpOnly cookie, bukan localStorage
- **CSRF Protection** — Token CSRF untuk semua mutasi (POST/PUT/PATCH/DELETE)
- **Rate Limiting** — Redis-backed: 100 req/menit API umum, 10 req/menit auth
- **Helmet.js** — Security headers (HSTS, XSS, frame options)
- **Input Sanitization** — DOMPurify untuk semua input user
- **KYC Lock** — Akun terkunci sementara setelah 3x gagal verifikasi
- **Soft Delete** — Data tidak dihapus permanen, hanya ditandai `deletedAt`
- **AI Quota System** — Daily limit & monthly budget per user/role

---

## 🚀 Cara Menjalankan Lokal (Development)

### Prasyarat

- Node.js 20+
- pnpm 10+
- PostgreSQL 15 (native atau Docker)
- Redis 7 (opsional untuk dev, required untuk rate-limiting)
- Meilisearch (opsional untuk dev)

### Langkah Setup

```bash
# 1. Clone repository
git clone https://github.com/sabdakarya77-spec/beritakarya.git
cd beritakarya

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit kedua file tersebut sesuai konfigurasi lokal Anda

# 4. Generate Prisma client
pnpm --filter @beritakarya/api run db:generate

# 5. Jalankan migrasi database
pnpm --filter @beritakarya/api run db:migrate

# 6. (Opsional) Seed data awal
pnpm --filter @beritakarya/api run db:seed

# 7. Jalankan semua aplikasi
pnpm dev
```

Aplikasi akan berjalan di:
- **Frontend (Web):** http://localhost:3000
- **Backend (API):** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api-docs

---

## 📦 Scripts Tersedia

### Root (Turborepo)

| Script         | Deskripsi                                  |
|----------------|--------------------------------------------|
| `pnpm dev`     | Jalankan semua apps dalam mode development |
| `pnpm build`   | Build semua apps untuk production          |
| `pnpm test`    | Jalankan semua test suite                  |
| `pnpm lint`    | Lint semua apps                            |
| `pnpm type-check` | TypeScript check semua apps            |

### API (`apps/api`)

| Script                    | Deskripsi                          |
|---------------------------|------------------------------------|
| `pnpm run db:generate`    | Generate Prisma Client             |
| `pnpm run db:migrate`     | Buat & jalankan migrasi baru (dev) |
| `pnpm run db:migrate:deploy` | Deploy migrasi (production)    |
| `pnpm run db:studio`      | Buka Prisma Studio (DB GUI)        |
| `pnpm run db:seed`        | Seed data awal                     |

---

## 🗄️ Skema Database

Database menggunakan **PostgreSQL 15** dengan Prisma ORM. Model utama:

- **Site** — Entitas situs/publikasi
- **User** — Pengguna dengan role dan data KYC
- **Article** — Artikel dengan workflow editorial (draft → review → published)
- **ArticleVersion** — Riwayat versi artikel
- **Category** — Kategori global & per-situs
- **RefreshToken / BlacklistedToken** — Manajemen session
- **KYCViewLog** — Audit trail akses dokumen KYC
- **AIUsage** — Tracking penggunaan fitur AI
- **RoleQuota** — Kuota AI per role
- **AuditLog** — Log semua aksi editorial
- **Notification** — Notifikasi in-app
- **PageView** — Analitik halaman
- **Media** — Manajemen file/gambar
- **Advertisement** — Iklan per slot
- **NewsletterSubscriber** — Subscriber newsletter
- **Invitation** — Sistem undangan user
- **Comment** — Komentar artikel dengan nested replies

---

## 📂 Environment Variables

Lihat file contoh untuk masing-masing aplikasi:

- **API:** `apps/api/.env.example`
- **Web:** `apps/web/.env.example`
- **Production (VPS):** `.env.production.example`
- **Docker (infra):** `infra/docker/.env` _(di-gitignore, buat manual di VPS)_

---

## 🔄 Alur Deployment Production

Untuk panduan deployment lengkap ke VPS, lihat:

👉 **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)**

---

## 🧪 Testing

```bash
# Jalankan semua test
pnpm test

# Test hanya API
pnpm --filter @beritakarya/api test
```

Test menggunakan **Vitest** dengan **Supertest** untuk integration test.

---

## 📋 Backup Database

Script backup tersedia di `infra/scripts/backup-database.sh`.

```bash
# Jalankan manual
bash infra/scripts/backup-database.sh
```

Backup disimpan di `/var/backups/beritakarya/` dan dirotasi otomatis setiap 7 hari.

---

## 📄 Lisensi

Project ini bersifat proprietary dan dikembangkan untuk BeritaKarya.

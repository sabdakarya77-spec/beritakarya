# 👨‍💻 Review Senior Developer — Plans BeritaKarya
**Reviewer:** Senior System Website News Development  
**Tanggal:** 2026-05-16  
**Scope:** Review terhadap 4 file: `laporan_audit_beritakarya.md`, `AUDIT_REPORT_BERITAKARYA.md`, `WORK_PLAN_FIX_AUDIT.md`, `implementation_plan.md`

---

## 1. KESIMPULAN UMUM

Keempat file tersebut merupakan dokumentasi audit dan perencanaan yang **sangat berkualitas**. Audit dilakukan secara sistematis, temuan dikategorikan dengan baik, dan rencana implementasi cukup actionable. Namun ada beberapa **gap strategis** dan **risiko eksekusi** yang perlu diperhatikan sebelum memulai sprint.

---

## 2. KONFLIK ANTAR DOKUMEN

> [!WARNING]
> **Ada dua "work plan" yang berbeda format dan scope:**
> - `WORK_PLAN_FIX_AUDIT.md` → 47 tasks, 5 fase, sangat detail per kode
> - `implementation_plan.md` → 15 temuan, 4 sprint, format diff pragmatis
>
> Keduanya belum "terhubung" satu sama lain. Eksekutor bisa bingung harus mengikuti dokumen yang mana. **Rekomendasi:** Tetapkan `implementation_plan.md` sebagai panduan utama (lebih ringkas dan prioritasnya jelas), dan gunakan `WORK_PLAN_FIX_AUDIT.md` sebagai referensi detail teknis per task.

---

## 3. GAP YANG BELUM TERCAKUP DI PLANS

### 3.1 Tidak Ada Rollback Plan
Beberapa task berisiko tinggi terhadap breaking change di production, terutama:
- **Task 3.1** (`implementation_plan.md`): Migrasi `User.role` dan `Article.status` dari String ke Enum Prisma.
  - Ini adalah **database migration yang destructive**. Jika ada data legacy yang tidak sesuai enum (misalnya role = `"editor"` yang tidak terdaftar), migration akan gagal atau data corrupt.
  - **Plan yang hilang:** Perlu script validasi data sebelum migration, dan rollback migration script jika gagal.

### 3.2 Urutan Dependency Task Tidak Dieksplisitkan
Beberapa task saling bergantung tapi tidak disebutkan:
- `TASK 1.5` (Audit Log Fix) bergantung pada `TASK 3.1` (Enum Prisma) karena `AuditLog.action` mungkin perlu diperbaiki juga.
- `TASK 2.3` (Account Lockout ke Redis) bergantung pada Redis yang sudah running — tapi Redis baru ditambahkan di `TASK 3.3` (Docker Compose).
- **Risiko:** Sprint 2 bisa gagal jika Redis belum tersedia di environment.

### 3.3 Tidak Ada Environment-Specific Testing Plan
Kedua dokumen work plan hanya menyebut "deploy ke staging" di akhir, tapi tidak ada:
- Checklist perbedaan konfigurasi staging vs production
- Cara memverifikasi bahwa fix security (misalnya header nginx) sudah aktif di staging sebelum ke production

### 3.4 Migration Strategy untuk Token localStorage → httpOnly Cookie
`M-013` di `WORK_PLAN_FIX_AUDIT.md` dan Task di `laporan_audit_beritakarya.md` menyebut migrasi token ke httpOnly cookie. Namun:
- **Tidak ada plan migrasi user yang sudah login.** Jika cookie tiba-tiba dipakai, semua session aktif yang pakai localStorage akan logout mendadak (breaking UX).
- **Rekomendasi:** Perlu migration window dengan dukungan dual-mode (baca localStorage ATAU cookie) sebelum fully migrate ke cookie.

---

## 4. TEMUAN TAMBAHAN YANG BELUM ADA DI AUDIT

Selama membaca 4 file tersebut, saya menemukan beberapa celah yang belum diidentifikasi:

### 4.1 Missing: Prisma Schema — `AuditLog` dan `Notification` Tidak Ada Created/UpdatedAt
Dari `laporan_audit_beritakarya.md` section DB-5, disebutkan `AuditLog` dan `Notification` tanpa FK. Namun gap lain: tanpa `createdAt`, filtering log berdasarkan waktu menjadi tidak mungkin atau tidak efisien. Perlu dipastikan kedua model ini memiliki `createdAt` yang diindeks.

### 4.2 Missing: API Versioning Strategy
Semua endpoint sudah di `/api/v1/...` — bagus. Tapi tidak ada rencana tentang bagaimana v2 akan dihandle jika ada breaking change di masa depan. Ini relevan karena platform multi-site dengan banyak consumer.

### 4.3 Missing: GDPR/UU PDP untuk Data Purge
`laporan_audit_beritakarya.md` menyebut `kycDataExpiresAt` untuk compliance, tapi tidak ada audit tentang:
- Apakah ada endpoint untuk "right to erasure" (user minta hapus data)?
- Apakah `PageView.ipAddress` sudah ada mekanisme cleanup/anonimisasi setelah N hari?

### 4.4 Missing: Monitoring & Alerting Plan Post-Fix
Setelah semua fix diimplementasikan, tidak ada plan untuk:
- Alert jika AI quota tiba-tiba 0 (mungkin bug baru)
- Alert jika rate limiter trigger terlalu sering (indikasi attack)
- Dashboard monitoring untuk track performa setelah optimasi

---

## 5. PENILAIAN RISIKO EKSEKUSI

| Task | Risiko | Keterangan |
|------|--------|-----------|
| ✅ Prisma Enum Migration (role + status) | 🔴 TINGGI | Data existing mungkin tidak kompatibel dengan enum baru |
| Token localStorage → httpOnly Cookie | 🟡 MENENGAH | Breaking UX untuk user aktif jika tidak ada migration window |
| ✅ Redis/Meili ke Docker Compose | 🟡 MENENGAH | Perlu downtime atau zero-downtime deployment strategy |
| ✅ Auth Guard Category/Site Routes | 🟢 RENDAH | Sudah ada middleware, tinggal apply — risiko minimal |
| Fix TLS `rejectUnauthorized` | 🟢 RENDAH | 1 baris, tapi perlu pastikan prod cert valid terlebih dahulu |

---

## 6. REKOMENDASI PRIORITAS TAMBAHAN (DARI SAYA)

### Segera Sebelum Sprint Dimulai:
1. ✅ **Validasi data existing** untuk `User.role` dan `Article.status` — pastikan tidak ada nilai diluar enum sebelum migration.
   ```sql
   SELECT DISTINCT role FROM "User";
   SELECT DISTINCT status FROM "Article";
   ```

2. ✅ **Buat rollback migration script** untuk setiap destructive migration (Prisma enum, unique constraint invitation).

3. ✅ **Tetapkan** `implementation_plan.md` sebagai master plan, dan update statusnya (checklist `⬜` → `✅`) setelah setiap task selesai.

### Tambahan yang Saya Rekomendasikan (Belum di Plan):
4. **Tambahkan `updatedAt` index** pada `Article` untuk query sorting terbaru — berguna untuk editorial dashboard yang sering query "artikel terbaru yang diupdate".

5. **Implementasikan `server-side auth guard` di Next.js middleware** sebelum migrasi httpOnly cookie — ini adalah prerequisite yang disebutkan di rekomendasi arsitektur tapi tidak masuk sprint plan.

6. **Audit log untuk aksi admin** (site CRUD, user role change) saat ini tidak jelas apakah tercatat — perlu verifikasi bahwa `AuditLog` diisi di setiap operasi sensitif.

---

## 7. URUTAN EKSEKUSI YANG DISARANKAN

Berdasarkan dependency dan risiko, urutan yang paling aman:

```
[Hari 1-2] Sprint 1 KRITIS (Auth Guard, Logout Fix, .env cleanup)
     ↓
[Hari 3]   Validasi data DB (DISTINCT role, status) → Go/No-Go untuk enum migration
     ↓
[Hari 4-5] Sprint 2 HIGH (Media ownership, KYC fix, Redis store)
     ↓  [Redis harus tersedia sebelum Sprint 2 task 2.3]
[Hari 4]   Paralel: Tambah Redis + Meilisearch ke Docker Compose (INFRA-1)
     ↓
[Hari 6-7] Sprint 3 MEDIUM (Prisma Enum migration dengan safety net)
     ↓
[Hari 8-9] Sprint 3 lanjutan (Nginx fixes, Cron cleanup)
     ↓
[Hari 10]  Sprint 4 IMPROVEMENT + Full regression testing
```

---

## 8. KESIMPULAN AKHIR

Keempat file ini merupakan fondasi yang **sangat solid** untuk project BeritaKarya menuju production-ready. Audit dilakukan dengan standar profesional, dan plan implementasinya realistis. 

**Tiga hal yang paling penting sebelum eksekusi:**
1. ✅ Unify kedua work plan — tetapkan satu sebagai master
2. ✅ Buat rollback plan untuk database migration (enum)  
3. ✅ Pastikan Redis tersedia di infra sebelum mengerjakan task yang bergantung padanya

Dengan memperhatikan gap tersebut, saya yakin tim dapat menyelesaikan semua sprint dalam **10 hari kerja** seperti yang diestimasi.

---

*Review dibuat: 2026-05-16*  
*Oleh: Senior System Website News Development*

# UI/UX Execution Playbook - BeritaKarya

**Tanggal:** 2026-05-23
**Status:** Draft operasional
**Dokumen pendamping:** `docs/UI_UX_PRIORITY_ACTION_PLAN.md`
**Tujuan:** Mengubah daftar prioritas UI/UX menjadi paket eksekusi yang bisa langsung dikerjakan tim per sprint, per hari, dan per file.

---

## Cara Pakai Dokumen Ini

Dokumen ini dipakai setelah tim menyepakati prioritas di `UI_UX_PRIORITY_ACTION_PLAN.md`.

Gunakan playbook ini untuk:

- menentukan urutan kerja mingguan,
- membagi tugas per area,
- memastikan setiap perubahan punya definisi selesai,
- menghindari perubahan visual yang tidak berdampak,
- dan menjaga agar peningkatan UX tetap terukur.

Dokumen ini sengaja lebih operasional daripada strategis.

---

## Prinsip Eksekusi

Sebelum mengubah UI, tim perlu sepakat pada 5 prinsip berikut:

1. **Jangan tambah ornamen sebelum masalah inti selesai.**
2. **Setiap link dan CTA harus punya tujuan nyata.**
3. **Setiap komponen harus jelas siapa user-nya: pembaca, editor, admin, atau advertiser.**
4. **Setiap perubahan visual harus meningkatkan clarity, trust, atau speed.**
5. **Jika dua solusi sama bagusnya, pilih yang lebih sederhana dan lebih mudah dipelihara.**

---

## Outcome Yang Ditargetkan

Setelah playbook ini dieksekusi, target minimum yang diharapkan:

- user tidak lagi menemukan navigasi yang membingungkan,
- homepage terasa lebih fokus dan lebih mudah dipindai,
- dashboard lebih cepat dipakai untuk tugas harian,
- settings dan admin lebih tenang secara visual,
- dan tim punya baseline UI yang lebih disiplin untuk fitur berikutnya.

---

## Paket Sprint

### Sprint 1 - Trust Layer

**Durasi:** 3-5 hari

**Target hasil:**

- semua link publik valid,
- arah logo benar,
- CTA penting tidak lagi palsu,
- dan konteks multi-site konsisten.

**Area kerja:**

- `apps/web/components/layout/Navbar.tsx`
- `apps/web/components/layout/SiteFooter.tsx`
- `apps/web/components/layout/MobileMenu.tsx`
- `apps/web/components/layout/MobileBottomNav.tsx`
- `apps/web/app/[site]/p/[slug]/page.tsx`

**Checklist implementasi:**

- Audit semua `href` publik dan tandai mana yang valid, placeholder, atau rusak.
- Ubah semua logo ke `/${site}` aktif.
- Hilangkan hardcode `/pusat/dashboard`.
- Putuskan CTA mana yang harus:
  - dihubungkan ke flow nyata,
  - diganti jadi link yang benar,
  - atau disembunyikan sementara.
- Cocokkan footer dengan halaman legal/info yang benar-benar tersedia.

**Definition of done:**

- tidak ada link publik yang menuju halaman kosong atau route yang tidak ada,
- semua elemen identitas site tetap berada di site context yang benar,
- tidak ada CTA besar yang tidak punya aksi nyata,
- pengujian manual desktop dan mobile lolos.

**Validasi manual:**

- klik semua link navbar desktop,
- klik semua link footer,
- klik semua menu mobile,
- login dari site non-`pusat` lalu buka dashboard dari mobile menu,
- pastikan kembali ke site aktif, bukan ke root atau `pusat`.

---

### Sprint 2 - Homepage Focus

**Durasi:** 4-6 hari

**Target hasil:**

- homepage lebih fokus,
- blok konten tidak saling berebut perhatian,
- dan discovery lebih jelas.

**Area kerja:**

- `apps/web/components/pages/SiteHomePage.tsx`
- `apps/web/components/ui/NewsCard.tsx`
- komponen hero terkait bila perlu

**Checklist implementasi:**

- Tentukan struktur final bagian atas homepage:
  - `hero`,
  - `fokus editor`,
  - `main feed`.
- Evaluasi apakah blok berikut harus selalu tampil atau kondisional:
  - video,
  - foto jurnalistik,
  - opini,
  - newsletter,
  - populer,
  - ads.
- Ubah elemen `Populer` menjadi fitur nyata atau label non-interaktif.
- Ringankan sidebar kanan.
- Pastikan area sponsor jelas dibedakan dari konten editorial.

**Definition of done:**

- user bisa memahami struktur homepage dalam satu kali scroll awal,
- feed utama terlihat lebih cepat,
- sidebar tidak terasa terlalu berat,
- dan tidak ada elemen yang tampak interaktif padahal tidak bekerja.

**Validasi manual:**

- buka homepage desktop,
- ukur berapa cepat feed utama muncul tanpa scroll berlebihan,
- uji homepage di mobile,
- cek apakah hierarchy tetap terbaca saat data artikel sedikit,
- cek apakah ads tetap jelas sebagai elemen sponsor.

---

### Sprint 3 - Dashboard Efficiency

**Durasi:** 4-6 hari

**Target hasil:**

- dashboard lebih cepat dipakai,
- aksi penting lebih mudah ditemukan,
- dan hierarchy kerja lebih jelas per role.

**Area kerja:**

- `apps/web/app/[site]/dashboard/page.tsx`
- `apps/web/app/[site]/dashboard/articles/page.tsx`
- `apps/web/components/dashboard/DashboardHeader.tsx`
- `apps/web/components/dashboard/QuickActions.tsx`
- `apps/web/app/[site]/dashboard/review/page.tsx`

**Checklist implementasi:**

- Tampilkan aksi artikel utama tanpa hover.
- Tonjolkan insight utama per role di dashboard overview.
- Jadikan `QuickActions` lebih kontekstual.
- Tambahkan sinyal prioritas di review queue:
  - breaking,
  - lama antre,
  - author,
  - kategori.
- Kurangi elemen yang hanya dekoratif tetapi tidak membantu pengambilan keputusan.

**Definition of done:**

- user baru bisa menemukan aksi utama tanpa perlu eksplor hover,
- dashboard overview memberi arahan kerja yang jelas,
- review queue lebih mudah diprioritaskan,
- dan seluruh layar terasa lebih fungsional daripada dekoratif.

**Validasi manual:**

- login sebagai reporter, wapimred, superadmin, advertiser,
- cek apakah halaman overview memberi sinyal tindakan yang tepat,
- cek artikel list tanpa hover,
- cek review queue dengan data kosong dan data berisi,
- cek responsive di tablet dan laptop.

---

### Sprint 4 - Visual Discipline

**Durasi:** 4-5 hari

**Target hasil:**

- readability naik,
- micro-typography lebih manusiawi,
- dan visual language lebih konsisten.

**Area kerja:**

- `apps/web/app/globals.css`
- `apps/web/components/layout/Navbar.tsx`
- `apps/web/components/layout/SiteFooter.tsx`
- `apps/web/app/[site]/dashboard/settings/page.tsx`
- `apps/web/app/[site]/dashboard/admin/page.tsx`
- komponen lain yang banyak memakai `text-[9px]`, `text-[10px]`, dan uppercase

**Checklist implementasi:**

- Buat aturan minimum ukuran teks untuk label penting.
- Kurangi uppercase dan tracking lebar di area yang sering dibaca.
- Batasi animasi `pulse`, `bounce`, `glow`, dan shadow dekoratif.
- Sederhanakan visual settings dan admin.
- Definisikan tone visual berbeda untuk:
  - public editorial,
  - dashboard operasional,
  - admin system.

**Definition of done:**

- ukuran teks kecil tidak lagi menyulitkan baca,
- motion hanya dipakai saat membantu fokus,
- settings terasa lebih tenang,
- admin terasa lebih profesional dan cepat dipakai.

**Validasi manual:**

- audit visual pada resolusi mobile, laptop, dan desktop besar,
- cek area settings selama 5-10 menit penggunaan terus-menerus,
- pastikan tidak ada elemen penting yang kalah menonjol dari dekorasi.

---

## Breakdown Harian

Contoh pembagian kerja operasional untuk 2 minggu pertama:

### Hari 1

- inventaris semua link publik,
- tandai route valid dan invalid,
- buat daftar CTA palsu,
- siapkan keputusan route final.

### Hari 2

- perbaiki `Navbar`,
- perbaiki `SiteFooter`,
- perbaiki `MobileMenu`,
- uji manual seluruh navigasi publik.

### Hari 3

- rapikan `MobileBottomNav`,
- sinkronkan route info/legal,
- validasi multi-site.

### Hari 4

- sederhanakan struktur atas homepage,
- putuskan blok yang tetap tampil dan yang dipindah.

### Hari 5

- rapikan sidebar homepage,
- perjelas area sponsor,
- uji desktop dan mobile.

### Hari 6

- tampilkan aksi artikel tanpa hover,
- rapikan hierarchy tabel artikel.

### Hari 7

- refactor dashboard overview,
- sesuaikan `QuickActions`,
- validasi per role.

### Hari 8

- perbaiki review queue,
- tambahkan prioritas editorial.

### Hari 9

- audit `text-[9px]` dan `text-[10px]`,
- rapikan typography mikro.

### Hari 10

- ringankan settings dan admin,
- audit visual akhir,
- dokumentasikan baseline baru.

---

## Task Board Yang Disarankan

Gunakan board sederhana dengan 5 kolom:

1. `Backlog`
2. `Ready`
3. `In Progress`
4. `Review`
5. `Done`

Format kartu task yang disarankan:

```md
Judul:
Area:
Masalah:
Perubahan:
File:
Risiko:
Checklist validasi:
```

Contoh:

```md
Judul: Perbaiki link legal di footer
Area: Trust layer
Masalah: Footer mengarah ke route yang belum tersedia
Perubahan: Sinkronkan footer dengan halaman info/legal yang valid
File: SiteFooter.tsx, [slug]/page.tsx
Risiko: Ada route lama yang mungkin dipakai user
Checklist validasi:
- Link footer desktop benar
- Link footer mobile benar
- Tidak ada 404
```

---

## Definition Of Ready

Suatu task baru boleh dikerjakan jika:

- masalahnya jelas,
- file target sudah diketahui,
- expected outcome ditulis,
- dan cara validasinya sudah diputuskan.

Jangan mulai task yang hanya berbunyi:

- "rapikan UI",
- "bikin lebih premium",
- "kasih animasi",
- "buat lebih modern".

Task harus selalu spesifik dan terukur.

---

## Definition Of Done

Suatu task dianggap selesai jika memenuhi semua hal berikut:

- perubahan utama sudah diimplementasikan,
- tidak menimbulkan broken flow,
- sudah diuji manual di skenario utama,
- tidak merusak konteks multi-site,
- tidak menambah inkonsistensi baru,
- dan bila menyentuh area penting, perubahan dicatat singkat di PR atau changelog kerja.

---

## Checklist Review Sebelum Merge

Gunakan checklist ini untuk setiap perubahan UI/UX:

- Apakah user bisa langsung paham fungsi elemen ini?
- Apakah ini benar-benar membantu, atau hanya mempercantik?
- Apakah ada route yang berpotensi rusak?
- Apakah ada context site yang salah?
- Apakah teksnya cukup mudah dibaca?
- Apakah elemen interaktif terlihat benar-benar interaktif?
- Apakah aksi penting masih tersembunyi di hover?
- Apakah perubahan ini konsisten dengan halaman lain?

---

## Peran Tim Yang Disarankan

Jika dikerjakan oleh tim kecil, pembagian paling efektif:

### Owner UX/Product

- memutuskan prioritas,
- menjaga scope agar tidak melebar,
- menyetujui definition of done.

### Frontend Owner

- mengerjakan refactor utama,
- menjaga konsistensi antar komponen,
- memastikan route dan state tidak rusak.

### QA Manual

- klik semua link utama,
- cek mobile dan desktop,
- uji role-based flows,
- cek apakah perubahan benar-benar memperbaiki pengalaman.

Jika hanya dikerjakan satu orang, gunakan pembagian ini sebagai mode kerja berurutan.

---

## Risiko Yang Harus Dijaga

Perubahan UI/UX di proyek ini punya beberapa risiko:

1. **Terlalu banyak mengubah sekaligus**, sehingga sulit tahu perbaikan mana yang benar-benar berdampak.
2. **Refactor visual tanpa validasi flow**, sehingga tampak lebih rapi tetapi justru memutus alur user.
3. **Mencampur konteks public dan dashboard**, sehingga tone produk makin tidak konsisten.
4. **Menambah komponen baru padahal masalah cukup diselesaikan dengan simplifikasi.**
5. **Menghilangkan karakter visual**, padahal tujuan utama adalah disiplin, bukan membuat UI jadi generik.

---

## Artefak Yang Sebaiknya Ditambahkan Setelah Sprint

Setelah 2-4 sprint awal selesai, dokumen lanjutan yang disarankan:

- `docs/UI_BASELINE_GUIDELINES.md`
- `docs/NAVIGATION_RULES.md`
- `docs/DASHBOARD_UX_PATTERNS.md`
- `docs/MULTI_SITE_UI_RULES.md`

Tujuannya agar keputusan yang sudah benar tidak hilang saat fitur baru ditambahkan.

---

## File Prioritas Untuk Mulai Besok

Jika besok tim ingin langsung mulai, urutan praktisnya:

1. `apps/web/components/layout/Navbar.tsx`
2. `apps/web/components/layout/SiteFooter.tsx`
3. `apps/web/components/layout/MobileMenu.tsx`
4. `apps/web/components/layout/MobileBottomNav.tsx`
5. `apps/web/components/pages/SiteHomePage.tsx`
6. `apps/web/app/[site]/dashboard/articles/page.tsx`
7. `apps/web/app/[site]/dashboard/page.tsx`
8. `apps/web/app/[site]/dashboard/review/page.tsx`
9. `apps/web/app/[site]/dashboard/settings/page.tsx`
10. `apps/web/app/[site]/dashboard/admin/page.tsx`
11. `apps/web/app/globals.css`

---

## Penutup

Dokumen pertama memberi arah prioritas.

Dokumen kedua ini memberi cara kerja.

Jika dokumen ini diikuti dengan disiplin, maka peningkatan UI/UX BeritaKarya akan:

- lebih cepat terasa,
- lebih mudah dipantau,
- dan lebih kecil risiko berubah menjadi sekadar "polish visual" tanpa dampak nyata.

Fokus utamanya tetap sama:

- perbaiki trust,
- sederhanakan hierarchy,
- dan jaga konsistensi lintas konteks.


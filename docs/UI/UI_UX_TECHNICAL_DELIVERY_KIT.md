# UI/UX Technical Delivery Kit - BeritaKarya

**Tanggal:** 2026-05-23
**Status:** Draft teknis
**Dokumen terkait:**

- `docs/UI_UX_PRIORITY_ACTION_PLAN.md`
- `docs/UI_UX_EXECUTION_PLAYBOOK.md`

**Tujuan:** Menyediakan checklist teknis yang bisa dipakai langsung saat implementasi dan review PR, terutama pada file-file prioritas UI/UX.

---

## Cara Pakai

Dokumen ini dipakai saat:

- membuat task implementasi,
- mulai mengedit file prioritas,
- membuka pull request,
- dan melakukan review akhir sebelum merge.

Struktur dokumen ini terdiri dari:

1. checklist PR umum,
2. checklist teknis per file,
3. template isi PR,
4. template task board teknis.

---

## Checklist PR Umum

Gunakan checklist ini pada semua PR UI/UX, tanpa melihat file apa yang disentuh.

### Functional Checklist

- Semua link yang disentuh mengarah ke route yang valid.
- Tidak ada CTA yang tampak aktif tetapi tidak punya aksi nyata.
- Tidak ada hardcode route yang memutus konteks multi-site.
- Tidak ada state penting yang hanya terlihat saat hover.
- Tidak ada komponen yang kehilangan fungsi lama setelah dirapikan.

### UX Checklist

- Hierarchy halaman lebih jelas daripada sebelumnya.
- Elemen yang paling penting adalah yang paling mudah dilihat.
- Perubahan mengurangi kebingungan, bukan sekadar mengubah tampilan.
- Teks kecil masih terbaca pada desktop dan mobile.
- Elemen interaktif terlihat jelas sebagai elemen interaktif.

### Visual Checklist

- Tidak menambah animasi yang tidak perlu.
- Tidak menambah uppercase berlebihan.
- Tidak menambah warna, shadow, atau glow tanpa alasan UX.
- Spacing dan ukuran teks baru tetap konsisten dengan area lain.
- Perubahan tidak membuat public UI dan dashboard semakin campur tone-nya.

### Safety Checklist

- Route publik diuji manual minimal satu kali.
- Jika menyentuh multi-site, alur `pusat` dan non-`pusat` ikut diuji.
- Jika menyentuh dashboard, role utama ikut diuji minimal secara manual.
- Tidak ada error diagnostik pada file yang diubah.
- Perubahan dicatat singkat dalam deskripsi PR.

---

## Checklist PR Per File

Bagian ini fokus pada file prioritas yang paling mungkin disentuh lebih dulu.

---

### `apps/web/components/layout/Navbar.tsx`

**Tujuan file:**
Menjaga navigasi publik utama, identitas site, kategori, pencarian, dan akses akun.

**Checklist PR:**

- Logo mengarah ke `/${site}` aktif, bukan ke `/`.
- Link tambahan seperti arsip/bantuan hanya tampil jika route valid.
- Search button tetap bisa dipakai setelah refactor visual.
- Theme toggle masih bekerja dan tidak rusak oleh perubahan state.
- Dropdown kategori masih sinkron dengan `selectedCategory`.
- Hover state tidak menjadi satu-satunya penanda aktif.
- Teks label kecil tetap terbaca di desktop.
- Navbar tidak kehilangan sticky behavior atau struktur grid utamanya.

**Validasi manual:**

- buka homepage site aktif,
- klik logo,
- klik kategori utama dan subkategori,
- buka search,
- login dan cek menu akun,
- cek desktop dan mobile.

---

### `apps/web/components/layout/SiteFooter.tsx`

**Tujuan file:**
Menyediakan link legal, informasi, kategori, kontak, dan CTA pendukung.

**Checklist PR:**

- Semua link footer menuju halaman yang benar-benar ada.
- Link legal sinkron dengan route info/legal yang tersedia.
- Logo footer mengarah ke `/${site}` aktif.
- CTA `Dukung Kami` tidak lagi berupa tombol kosong.
- Struktur footer tetap mudah dipindai, tidak terlalu padat.
- Social links aman saat kosong dan tidak menampilkan elemen mati.
- Footer tidak memakai teks mikro yang terlalu kecil untuk area penting.

**Validasi manual:**

- klik semua link legal,
- klik kategori footer,
- klik logo footer,
- uji dengan data `socialLinks` kosong dan berisi.

---

### `apps/web/components/layout/MobileMenu.tsx`

**Tujuan file:**
Menjadi pusat navigasi mobile untuk kategori, akun, dan eksplorasi tambahan.

**Checklist PR:**

- Dashboard tidak lagi hardcoded ke `/pusat/dashboard`.
- Semua item menu masih menutup panel setelah diklik.
- Link kategori mengarah ke site aktif.
- Jika user login, menu akun tampil sesuai role.
- Jika user belum login, CTA masuk/daftar tetap jelas.
- Hierarchy section `akun`, `kategori`, `lainnya` tetap mudah dipahami.
- Ukuran tap target aman di layar mobile.
- Tidak ada item yang tampak aktif tanpa alasan.

**Validasi manual:**

- buka mobile menu,
- klik kategori,
- klik login/dashboard,
- cek site `pusat` dan non-`pusat`,
- cek saat user login dan logout.

---

### `apps/web/components/layout/MobileBottomNav.tsx`

**Tujuan file:**
Menjadi navigasi cepat mobile untuk pembaca dan user login.

**Checklist PR:**

- Semua item bottom nav relevan untuk tipe user yang ditargetkan.
- `Dashboard` tidak tampil menyesatkan untuk pembaca umum bila tidak diperlukan.
- State aktif tetap akurat terhadap `pathname` dan `selectedCategory`.
- Tidak ada label yang terlalu kecil untuk dibaca cepat.
- Bottom nav tidak menutupi CTA atau konten penting di layar kecil.

**Validasi manual:**

- cek homepage mobile,
- cek halaman kategori,
- cek halaman dashboard,
- cek saat kategori `tersimpan` aktif,
- cek saat user login dan belum login.

---

### `apps/web/components/pages/SiteHomePage.tsx`

**Tujuan file:**
Menjadi entry point utama pembaca dan pusat discovery konten.

**Checklist PR:**

- Struktur awal halaman lebih sederhana daripada sebelumnya.
- Feed utama muncul lebih cepat tanpa scroll berlebihan.
- Blok `Trending` benar-benar membantu discovery.
- Elemen `Populer` tidak lagi menipu secara interaksi.
- Jumlah blok premium di atas fold tetap terkontrol.
- Sidebar kanan tidak terasa terlalu penuh.
- Area sponsor jelas dibedakan dari area editorial.
- Saat data sedikit, homepage tidak terasa rusak atau kosong.

**Validasi manual:**

- cek homepage desktop dan mobile,
- cek dengan query pencarian,
- cek dengan kategori aktif,
- cek saat artikel sedikit dan saat artikel banyak.

---

### `apps/web/app/[site]/dashboard/articles/page.tsx`

**Tujuan file:**
Menjadi workspace utama untuk menulis, mencari, memfilter, dan mengelola artikel.

**Checklist PR:**

- Aksi utama tidak lagi tersembunyi penuh di hover.
- Search, filter, pagination, dan view mode tetap bekerja.
- Metadata artikel tidak mengalahkan judul sebagai fokus utama.
- Empty state tetap jelas dan punya tindakan lanjut.
- List view dan kanban view tetap sinkron datanya.
- Tidak ada role yang kehilangan akses aksi penting.

**Validasi manual:**

- cek reporter,
- cek wapimred,
- cek superadmin,
- cari artikel,
- pindah page,
- ganti list/kanban,
- uji draft dan published.

---

### `apps/web/app/[site]/dashboard/page.tsx`

**Tujuan file:**
Memberi ringkasan kerja dan insight utama per role.

**Checklist PR:**

- Insight utama per role terlihat jelas di layar awal.
- `QuickActions` tidak hanya berfungsi sebagai shortcut generik.
- Kartu analitik tidak saling berebut perhatian.
- Placeholder advertiser tidak terasa seperti fitur palsu.
- Data penting lebih menonjol daripada dekorasi visual.

**Validasi manual:**

- cek role reporter,
- cek role wapimred,
- cek role superadmin,
- cek role advertiser,
- cek loading state,
- cek empty state bila data minim.

---

### `apps/web/app/[site]/dashboard/review/page.tsx`

**Tujuan file:**
Memudahkan editor memproses antrean review secara cepat dan benar.

**Checklist PR:**

- Item review punya sinyal prioritas yang jelas.
- Aksi approve/revisi/tolak tetap aman dan tidak membingungkan.
- Modal approval tetap sederhana dan fokus.
- Empty state tetap informatif.
- Queue tidak terasa seperti daftar statis tanpa konteks.

**Validasi manual:**

- cek tab submitted,
- cek tab review,
- cek tab revision,
- cek tab approved,
- uji approve,
- uji request revision,
- uji reject.

---

### `apps/web/app/[site]/dashboard/settings/page.tsx`

**Tujuan file:**
Menjadi pusat konfigurasi site tanpa membuat admin lelah.

**Checklist PR:**

- Visual lebih tenang setelah perubahan, bukan makin ramai.
- Label penting lebih mudah dibaca.
- Teks mikro dan uppercase berkurang di area form utama.
- Field kritikal dan lanjutan lebih mudah dibedakan.
- Save feedback tetap jelas.
- Preview masih berguna dan tidak menambah kebisingan.
- Tidak ada helper text penting yang hilang.

**Validasi manual:**

- buka semua tab,
- edit field utama,
- cek dirty state,
- cek save,
- cek preview,
- cek mobile bila halaman masih harus responsif.

---

### `apps/web/app/[site]/dashboard/admin/page.tsx`

**Tujuan file:**
Memudahkan operasi CRUD site dengan rasa sistem yang profesional.

**Checklist PR:**

- Tabel lebih mudah dipindai daripada sebelumnya.
- Modal create/edit terasa ringan dan fokus.
- Aksi destruktif tetap jelas tetapi tidak terlalu dramatis.
- Statistik mini tetap informatif.
- Form tidak kehilangan helper text penting.

**Validasi manual:**

- buka daftar site,
- buka modal create,
- buka modal edit,
- buka dialog delete,
- pastikan hierarchy aksi aman vs destruktif jelas.

---

### `apps/web/app/globals.css`

**Tujuan file:**
Menjadi fondasi token visual, utility, dan baseline styling lintas konteks.

**Checklist PR:**

- Tidak menambah style global yang terlalu spesifik untuk satu halaman.
- Typography scale makin rapi setelah perubahan.
- Utility baru benar-benar reusable.
- Animasi global tidak bertambah tanpa alasan kuat.
- Public, dashboard, dan admin tidak makin bercampur secara visual.

**Validasi manual:**

- cek homepage,
- cek halaman artikel,
- cek dashboard overview,
- cek settings,
- cek admin,
- cek dark mode.

---

## Template Deskripsi PR

Gunakan template berikut untuk PR UI/UX.

```md
## Ringkasan
- Perubahan utama:
- Area:
- Tujuan UX:

## Masalah Sebelumnya
- 

## Perubahan Yang Dilakukan
- 
- 
- 

## File Yang Disentuh
- `path/to/file`
- `path/to/file`

## Dampak Yang Diharapkan
- 

## Checklist Validasi
- [ ] Link dan route yang disentuh valid
- [ ] Multi-site tetap aman
- [ ] Desktop sudah dicek
- [ ] Mobile sudah dicek
- [ ] Tidak ada error diagnostik
- [ ] Tidak ada CTA palsu baru

## Catatan Review
- 
```

---

## Template Task Board Teknis

Gunakan kartu dengan struktur ini untuk board Jira, Trello, Notion, atau GitHub Projects.

```md
Title:
Area:
Priority:
Owner:

Problem:

Expected UX Outcome:

Scope:
- 
- 

Files:
- 
- 

Implementation Notes:
- 

Acceptance Criteria:
- [ ]
- [ ]
- [ ]

Manual QA:
- [ ]
- [ ]

Risks:
- 

Out of Scope:
- 
```

---

## Contoh Task Board Item

### Contoh 1

```md
Title: Perbaiki logo dan route legal di navigasi publik
Area: Trust Layer
Priority: P1
Owner: Frontend

Problem:
Logo publik masih mengarah ke root `/`, dan beberapa link footer menuju route yang belum tersedia.

Expected UX Outcome:
User tetap berada pada konteks site aktif dan tidak menemukan dead link.

Scope:
- Ubah route logo navbar
- Ubah route logo footer
- Sinkronkan link legal footer

Files:
- apps/web/components/layout/Navbar.tsx
- apps/web/components/layout/SiteFooter.tsx
- apps/web/app/[site]/p/[slug]/page.tsx

Implementation Notes:
- Gunakan site aktif, jangan hardcode
- Hapus link yang belum siap jika route belum ada

Acceptance Criteria:
- [ ] Logo kembali ke `/${site}`
- [ ] Link legal tidak 404
- [ ] Footer tidak menampilkan link palsu

Manual QA:
- [ ] Test site `pusat`
- [ ] Test site non-`pusat`

Risks:
- Ada route lama yang mungkin sudah pernah dipakai

Out of Scope:
- Redesign footer total
```

### Contoh 2

```md
Title: Tampilkan aksi artikel utama tanpa hover
Area: Dashboard Efficiency
Priority: P1
Owner: Frontend

Problem:
Aksi artikel terlalu tersembunyi di hover sehingga discoverability rendah.

Expected UX Outcome:
User bisa langsung melihat aksi utama tanpa eksplorasi tambahan.

Scope:
- Tampilkan edit dan satu aksi utama secara default
- Pertahankan aksi sekunder dalam pola yang ringkas

Files:
- apps/web/app/[site]/dashboard/articles/page.tsx

Implementation Notes:
- Jangan membuat tabel terlalu padat
- Pertahankan hierarchy judul sebagai fokus utama

Acceptance Criteria:
- [ ] Edit terlihat tanpa hover
- [ ] Aksi utama terlihat tanpa hover
- [ ] Layout tabel tetap rapi

Manual QA:
- [ ] Test reporter
- [ ] Test wapimred
- [ ] Test superadmin

Risks:
- Terlalu banyak aksi bisa membuat tabel makin ramai

Out of Scope:
- Rebuild total list view
```

---

## Rule Of Thumb Saat Review Teknis

Jika reviewer ragu apakah perubahan ini benar atau tidak, pakai 5 pertanyaan ini:

1. Apakah user lebih cepat memahami halaman setelah perubahan?
2. Apakah halaman terasa lebih tenang dan lebih fokus?
3. Apakah route dan context multi-site tetap aman?
4. Apakah perubahan ini mengurangi friksi nyata?
5. Apakah solusi ini cukup sederhana untuk dipelihara?

Jika minimal 4 dari 5 jawabannya `ya`, perubahan biasanya layak diteruskan.

---

## Penutup

Dokumen ini dibuat agar tim tidak berhenti pada audit dan rencana saja.

Dengan checklist teknis dan template board ini, implementasi UI/UX bisa:

- dibagi lebih rapi,
- direview lebih konsisten,
- dan dieksekusi tanpa kehilangan fokus pada dampak nyata.


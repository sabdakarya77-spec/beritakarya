# Spesifikasi Implementasi Redesign Editor Artikel

## Tujuan

Dokumen ini menjadi acuan implementasi redesign untuk halaman `dashboard/articles/new` dan `dashboard/articles/[id]` di aplikasi web BeritaKarya. Fokus redesign:

- meningkatkan keterbacaan dan hierarchy visual editor
- menyelaraskan CTA frontend dengan workflow backend
- membuat autosave lebih aman untuk draft baru
- memecah komponen agar lebih mudah dirawat
- memisahkan tanggung jawab shell editor, canvas, inspector, dan state UX

## Ruang Lingkup File

### `apps/web/app/[site]/dashboard/articles/new/page.tsx`

Status: refactor ringan
Status pengerjaan: [x] selesai

Tanggung jawab akhir:

- resolve `site` dari route
- mount editor shell untuk mode `new`
- tidak membawa styling visual tambahan selain wrapper minimum

Aksi:

- pertahankan file sebagai entry tipis
- hindari pengaturan surface yang bertabrakan dengan shell editor
- update metadata agar konsisten dengan istilah produk, misalnya `Tulis Post Baru`

### `apps/web/app/[site]/dashboard/articles/[id]/page.tsx`

Status: refactor ringan
Status pengerjaan: [x] selesai

Tanggung jawab akhir:

- resolve `site` dan `id`
- mount editor shell untuk mode edit

Aksi:

- samakan pola dengan halaman `new`
- metadata disesuaikan menjadi `Editor Post`

### `apps/web/components/editor/Editor.tsx`

Status: dipecah
Status pengerjaan: [~] in progress

Masalah saat ini:

- memegang terlalu banyak tanggung jawab
- shell layout, loading state, title stage, block canvas, dan mount sidebar bercampur dalam satu file

Target pecahan:

- `ArticleEditorShell.tsx`
- `EditorTopbar.tsx`
- `EditorTitleStage.tsx`
- `EditorCanvas.tsx`
- `EditorStatusNotice.tsx` (selesai di Batch 5)

Rencana:

- `Editor.tsx` menjadi orchestrator tipis atau dihapus setelah migrasi penuh
- lifecycle `loadArticle`, `reset`, dan keyboard shortcut tetap dipusatkan di shell
- rendering `TitleInput` dipindah ke `EditorTitleStage`
- surface dan layout editor dipisahkan dari logic store

Progress saat ini:

- [x] title stage awal diperjelas
- [x] hierarchy visual area judul ditingkatkan
- [x] shell kanvas artikel mulai dipisahkan secara visual
- [x] excerpt atau deck ditambahkan
- [x] pemecahan ke file `EditorTitleStage.tsx` dan `ArticleEditorShell.tsx` selesai

### `apps/web/components/editor/EditorToolbar.tsx`

Status: refactor besar
Status pengerjaan: [x] phase 1 selesai, phase lanjut belum

Masalah saat ini:

- copy campur Indonesia dan Inggris
- CTA belum sepenuhnya selaras dengan status backend
- offset layout hardcoded terhadap sidebar dashboard

Target tanggung jawab:

- menampilkan konteks editor
- menampilkan status simpan
- memetakan CTA berdasarkan role dan status
- mengakses inspector/focus mode

Rencana:

- [x] rename bertahap ke `EditorTopbar.tsx`
- [x] gunakan helper mapping action, misalnya `getPrimaryAction()`
- [x] hapus asumsi `left-64` jangka panjang, pindah ke shell layout
- [ ] tambahkan state tampilan:
  - `Menyimpan`
  - `Tersimpan`
  - `Belum disimpan`
  - `Gagal menyimpan`

### `apps/web/components/editor/EditorialSidebar.tsx`

Status: refactor besar
Status pengerjaan: [x] selesai (pecah ke section-based)

Masalah saat ini:

- inspector terlalu form-heavy
- footer `Terapkan Perubahan` misleading karena perubahan sudah langsung masuk store
- grouping visual antar section belum kuat

Target pecahan:

- `EditorInspector.tsx`
- `inspector/WorkflowSection.tsx`
- `inspector/FeaturedImageSection.tsx`
- `inspector/TaxonomySection.tsx`
- `inspector/EditorialFlagsSection.tsx`
- `inspector/SEOSection.tsx`
- `inspector/HistorySection.tsx`

Rencana:

- [x] pertahankan logika fetch kategori, upload image, dan load version
- [x] pindahkan setiap kelompok field ke section terpisah
- [x] ganti footer menjadi aksi non-menyesatkan seperti `Tutup Panel`
- [x] tampilkan summary readiness di bagian atas inspector
- [x] pecah section ke file terpisah selesai (Batch 5)

### `apps/web/components/editor/AISidebar.tsx`

Status: refactor bertahap
Status pengerjaan: [~] in progress

Masalah saat ini:

- AI terasa seperti panel terpisah, bukan bagian dari workflow editor
- tombol floating bersaing dengan inspector

Target:

- jangka pendek tetap dipertahankan
- jangka menengah dipindah menjadi panel atau tab di inspector

Rencana:

- [x] phase awal: rapikan copy dan relasi dengan block aktif
- [x] phase lanjut: satukan AI dengan inspector sebagai `Assist`
- [ ] phase lanjut berikutnya: evaluasi pemecahan panel AI ke section atau tab yang lebih modular bila ukuran mulai mengganggu maintenance

### `apps/web/components/editor/BlockList.tsx`

Status: refactor ringan
Status pengerjaan: [x] selesai

Masalah saat ini:

- switch renderer masih inline
- empty state terlalu lemah

Rencana:

- ekstrak registry renderer
- tambahkan empty state yang lebih jelas
- siapkan fallback block unsupported yang lebih aman

### `apps/web/components/editor/BlockWrapper.tsx`

Status: refactor besar
Status pengerjaan: [x] phase interaction selesai

Masalah saat ini:

- toolbar block terlalu hover-dependent
- insert rail tidak cukup discoverable

Rencana:

- [x] tambahkan active block state
- [x] ubah floating pill menjadi rail atau handle yang lebih stabil
- [x] sisakan hover sebagai enhancement, bukan syarat utama

### `apps/web/components/editor/AddBlockMenu.tsx`

Status: refactor besar
Status pengerjaan: [x] phase command palette mini selesai

Masalah saat ini:

- menu block masih terasa generik dan padat
- belum searchable dan belum dikelompokkan

Rencana:

- [x] ubah menjadi command palette mini
- [x] tambah grouping:
  - Teks
  - Media
  - Sorotan
  - Sisipan
- [x] tambah ikon
- [ ] pertimbangkan recent block jika pola pemakaian sudah jelas

### `apps/web/components/editor/blocks/ParagraphBlock.tsx`

Status: refactor bertahap
Status pengerjaan: [ ] belum dikerjakan

Masalah saat ini:

- slash menu hanya aktif untuk isi persis `/`
- model content masih rawan mismatch antara `innerText` dan `dangerouslySetInnerHTML`

Rencana:

- tingkatkan parser slash command
- tambah contextual action untuk drop cap
- tetapkan kontrak data plain-text atau rich-text terbatas

### `apps/web/components/editor/blocks/HeadingBlock.tsx`

Status: refactor ringan
Status pengerjaan: [ ] belum dikerjakan

Masalah saat ini:

- selector `H1-H6` terlalu teknis untuk user newsroom

Rencana:

- ubah label menjadi semantik editorial
- batasi penggunaan `H1` hanya untuk headline utama

### `apps/web/components/editor/blocks/ImageBlock.tsx`

Status: refactor ringan
Status pengerjaan: [ ] belum dikerjakan

Masalah saat ini:

- aksi `Ganti` sebenarnya menghapus gambar
- caption masih terlalu lemah secara visual

Rencana:

- pecah aksi menjadi `Ganti Gambar` dan `Hapus`
- siapkan area caption dan credit yang lebih editorial

### `apps/web/store/editorStore.ts`

Status: refactor prioritas tertinggi
Status pengerjaan: [x] phase 1 selesai, phase lanjut belum

Masalah saat ini:

- autosave belum benar untuk artikel baru
- tidak semua mutasi block memicu autosave
- data state dan view state masih menyatu

Rencana:

- phase 1:
  - perbaiki autosave draft baru
  - pastikan semua mutasi content memicu autosave
  - tambahkan guard saat save sedang berjalan
- phase 2:
  - [x] tambah derived state:
    - `canSubmitReview`
    - `canPublish`
    - `completionScore`
    - `missingRequirements`
- phase 3:
  - pertimbangkan memisahkan data article state dan ui state

### `apps/web/app/[site]/dashboard/layout.tsx`

Status: refactor bertahap
Status pengerjaan: [~] in progress

Masalah saat ini:

- shell dashboard terlalu dominan untuk mode editor
- editor punya topbar sendiri sehingga terasa seperti nested app bar

Rencana:

- [x] tambah varian layout khusus editor route
- [x] pangkas header dashboard ketika berada di mode menulis
- [ ] lanjutkan pemindahan offset dan dependensi visual editor dari shell dashboard ke shell editor sendiri

## Komponen Yang Dipecah

- `Editor.tsx`
- `EditorialSidebar.tsx`
- `EditorToolbar.tsx` menjadi `EditorTopbar.tsx`

## Komponen Yang Dihapus Setelah Migrasi

- `TitleInput` inline di dalam `Editor.tsx`
- footer aksi `Terapkan Perubahan` pada inspector lama
- struktur inline `AddBlockMenu` lama setelah command palette pengganti stabil

## Komponen Yang Cukup Di-refactor

- `BlockList.tsx`
- `BlockWrapper.tsx`
- `ParagraphBlock.tsx`
- `HeadingBlock.tsx`
- `ImageBlock.tsx`
- `AISidebar.tsx`
- halaman route `new` dan `[id]`

## Urutan Implementasi Teknis

### Gelombang 1

- perbaiki `editorStore.ts`
- perbaiki `EditorToolbar.tsx`
- naikkan kualitas title stage

Progress gelombang:

- [x] `editorStore.ts`
- [x] `EditorToolbar.tsx`
- [~] title stage

### Gelombang 2

- refactor inspector kanan
- rapikan shell editor

### Gelombang 3

- redesign block insertion dan active block controls
- perbaiki paragraph, heading, image block

### Gelombang 4

- integrasi AI ke panel yang lebih menyatu
- final polish layout dashboard khusus editor

## Catatan Migrasi

- perubahan dilakukan bertahap agar editor tetap bisa dipakai selama refactor
- file lama boleh tetap hidup sementara sebagai adapter
- semua perubahan CTA harus mengikuti workflow backend, terutama status `approved` dan `scheduled` sebelum publish

## Ringkasan Status Saat Ini

- [x] `apps/web/store/editorStore.ts`
- [x] `apps/web/components/editor/EditorToolbar.tsx` (renamed to `EditorTopbar.tsx`)
- [x] `apps/web/components/editor/Editor.tsx` (split complete)
- [ ] file lain masih menunggu batch berikutnya

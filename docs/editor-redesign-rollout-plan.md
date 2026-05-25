# Rencana Perubahan Bertahap Editor Artikel

## Sasaran

Dokumen ini menjabarkan urutan implementasi redesign editor artikel agar perubahan bisa dikirim bertahap, aman, dan tetap menjaga editor tetap usable selama proses refactor.

## Prinsip Rollout

- dahulukan perbaikan yang berdampak langsung ke keamanan workflow menulis
- prioritaskan perubahan yang mengurangi risiko kehilangan draft
- selaraskan frontend dengan aturan backend sebelum menyentuh polish visual besar
- pecah pekerjaan besar menjadi langkah yang bisa diuji per file

## Tahap 0: Baseline

Tujuan:

- mendokumentasikan arsitektur saat ini
- menyepakati target redesign

Output:

- dokumen spesifikasi implementasi per file
- dokumen rollout plan ini

Status:

- [x] selesai pada fase dokumentasi awal

## Tahap 1: Stabilkan Workflow Inti

Prioritas: sangat tinggi

Tujuan:

- draft baru tidak mudah hilang
- CTA editor sesuai status backend
- status simpan mudah dipahami

Perubahan:

- `apps/web/store/editorStore.ts`
  - aktifkan autosave untuk draft baru setelah memenuhi ambang konten minimum
  - pastikan mutasi block utama selalu memicu autosave
  - tambah guard saat save sedang berlangsung
- `apps/web/components/editor/EditorToolbar.tsx`
  - konsistenkan copy ke bahasa Indonesia
  - petakan aksi utama berdasarkan role dan status
  - hentikan tombol publish untuk status yang belum layak publish

Definition of done:

- artikel baru bisa tersimpan otomatis tanpa klik save pertama bila user sudah mulai menulis
- reporter tidak melihat CTA yang menyesatkan
- editor tidak bisa menekan `Terbitkan` saat status belum memenuhi syarat
- toolbar selalu menampilkan state simpan yang jelas

Status implementasi saat ini:

- [x] autosave draft baru di `editorStore.ts`
- [x] autosave untuk mutasi block utama yang sebelumnya belum konsisten
- [x] guard autosave saat proses save sedang berjalan
- [x] copy toolbar ke bahasa Indonesia
- [x] CTA toolbar berdasarkan role dan status
- [x] pembatasan tombol publish untuk status yang belum memenuhi syarat
- [x] diagnostics file yang diubah sudah dicek

## Tahap 2: Rapikan Shell Editor

Prioritas: tinggi

Tujuan:

- editor terasa sebagai workspace utama
- hierarchy visual lebih kuat

Perubahan:

- pecah `Editor.tsx`
- buat `EditorTitleStage`
- buat `EditorCanvas`
- mulai siapkan `ArticleEditorShell`
- naikkan kontras title stage dan placeholder

Definition of done:

- title, excerpt, dan body terlihat jelas
- struktur shell editor lebih modular

## Tahap 3: Redesign Inspector Kanan

Prioritas: tinggi

Tujuan:

- metadata, SEO, dan riwayat lebih cepat dipindai

Perubahan:

- pecah `EditorialSidebar.tsx` menjadi section-based inspector
- hapus footer `Terapkan Perubahan`
- tambahkan summary readiness di bagian atas panel

Definition of done:

- tiap section metadata jelas
- tidak ada aksi palsu yang seolah wajib ditekan untuk menerapkan perubahan

## Tahap 4: Redesign Block Editing

Prioritas: menengah-tinggi

Tujuan:

- block insertion lebih modern
- discoverability action meningkat

Perubahan:

- redesign `AddBlockMenu.tsx`
- perbaiki `BlockWrapper.tsx`
- tambah active block state
- upgrade slash command di `ParagraphBlock.tsx`
- sederhanakan semantics heading di `HeadingBlock.tsx`

Definition of done:

- user baru paham cara menambah block tanpa trial and error
- kontrol block tidak hanya bergantung pada hover

## Tahap 5: Integrasi AI dan Polish

Prioritas: menengah

Tujuan:

- AI menjadi bagian workflow, bukan panel asing
- layout editor matang untuk daily use newsroom

Perubahan:

- ubah `AISidebar.tsx` menjadi panel/tab yang lebih menyatu
- pertimbangkan layout khusus editor di `dashboard/layout.tsx`
- final visual tuning spacing, contrast, dan empty state

Definition of done:

- AI dapat dipanggil dari konteks block atau inspector
- editor terasa fokus, stabil, dan premium

## Mulai Perubahan Kode

Perubahan pertama yang harus dikerjakan langsung:

1. `editorStore.ts`
2. `EditorToolbar.tsx`

Alasan:

- keduanya menyentuh risiko terbesar: kehilangan draft dan CTA yang tidak sesuai workflow

## Checklist Implementasi Awal

### Batch 1

- [x] patch autosave draft baru
- [x] patch autosave pada mutasi block yang belum konsisten
- [x] patch copy toolbar ke bahasa Indonesia
- [x] patch CTA toolbar berdasarkan status dan role
- [x] cek diagnostics setelah patch

### Batch 2

- [x] naikkan contrast title stage
- [x] tambah field excerpt atau deck
- [x] rapikan struktur shell editor

### Batch 3

- [x] refactor inspector kanan
- [x] redesign add block menu
- [x] perbaiki block interactions

### Batch 4

- [x] upgrade slash command di `ParagraphBlock.tsx`
- [x] perluas parser slash command agar tidak bergantung pada isi persis `/`
- [x] rapikan kontrak konten `ParagraphBlock.tsx` agar sinkron dengan data editor
- [x] sederhanakan semantics heading di `HeadingBlock.tsx`
- [x] batasi penggunaan `H1` hanya untuk headline utama
- [x] rapikan aksi `ImageBlock.tsx` menjadi `Ganti Gambar` dan `Hapus`
- [x] perkuat area caption dan credit pada `ImageBlock.tsx`

### Batch 5

- [x] satukan `AISidebar.tsx` ke workflow editor sebagai panel atau tab `Assist`
- [x] hentikan pola floating AI yang bersaing dengan inspector kanan
- [x] buat varian layout khusus editor di `apps/web/app/[site]/dashboard/layout.tsx`
- [x] pangkas header dashboard saat berada di route editor agar tidak terasa seperti nested app bar
- [x] pindahkan offset `left-64` dari `EditorTopbar.tsx` ke shell layout editor
- [x] rapikan `apps/web/app/[site]/dashboard/articles/new/page.tsx` agar menjadi entry tipis tanpa surface tambahan
- [x] rapikan `apps/web/app/[site]/dashboard/articles/[id]/page.tsx` agar konsisten dengan route `new`
- [x] sesuaikan metadata editor route agar konsisten dengan istilah produk
- [x] ekstrak registry renderer dari `BlockList.tsx`
- [x] perkuat empty state dan fallback unsupported block di `BlockList.tsx`
- [x] pecah `EditorialSidebar.tsx` ke file section terpisah bila maintenance mulai terganggu
- [x] evaluasi apakah `EditorStatusNotice` perlu hadir sebagai komponen terpisah atau tetap di shell

## Catatan Risiko

- autosave draft baru harus punya threshold minimum agar tidak membuat artikel kosong secara agresif
- mapping CTA frontend harus selalu mengikuti state machine backend
- refactor shell editor harus hati-hati karena halaman ini hidup di dalam dashboard layout yang sudah kompleks

## Catatan Pengujian

- uji artikel baru tanpa klik tombol simpan
- uji reporter dan editor dengan status berbeda
- uji submit review setelah autosave draft baru
- uji publish hanya pada status yang sah
- uji perubahan block: add, remove, reorder, undo

## Ringkasan Progress

- [x] dokumentasi implementasi dibuat di `docs/editor-redesign-implementation-spec.md`
- [x] rollout plan dibuat di file ini
- [x] prioritas teknis pertama sudah mulai dikerjakan
- [x] redesign awal title stage
- [x] refactor shell editor bertahap
- [x] refactor inspector kanan
- [x] redesign block insertion
- [~] integrasi AI yang lebih menyatu

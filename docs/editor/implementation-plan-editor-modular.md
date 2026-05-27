# Implementation Plan Modular Editor: GridBlock dan WordPress

Tanggal rencana: 2026-05-27

## Tujuan Utama

Dokumen ini adalah rencana implementasi modular untuk dua mode editor:

1. `GridBlock`
2. `WordPress`

Target utamanya adalah membuat keduanya:

- berjalan di atas `document model` yang sama,
- tidak saling berbenturan di level state, command, dan rendering,
- mudah di-maintain,
- bisa dikembangkan bertahap tanpa rewrite total.

## Prinsip Arsitektur

### Prinsip 1: satu sumber data

Kedua mode editor wajib memakai:

- satu schema artikel,
- satu schema `blocks[]`,
- satu jalur normalisasi,
- satu jalur validasi,
- satu jalur simpan API.

Artinya:

- `GridBlock` bukan editor dengan data sendiri,
- `WordPress` juga bukan editor dengan data sendiri.

Keduanya hanyalah `mode interaksi` di atas `editor core` yang sama.

### Prinsip 2: shared core, mode adapter terpisah

Pemisahan yang disarankan:

- `Editor Core`
  Menangani document state, command, save pipeline, block catalog, serialization.

- `GridBlock Mode`
  Menangani block-per-block interaction.

- `WordPress Mode`
  Menangani continuous writing interaction.

### Prinsip 3: WordPress bukan schema baru

Mode WordPress harus diperlakukan sebagai:

- proyeksi dari document core,
- bukan struktur artikel alternatif.

### Prinsip 4: block definition hanya satu kali

Semua definisi block harus berasal dari satu `blockCatalog`.

## Target Boundary Modul

## Struktur Folder Yang Disarankan

```text
apps/web/components/editor/
  core/
    Editor.tsx
    ArticleEditorShell.tsx
    EditorCanvas.tsx
    EditorTopbar.tsx
    editorMode.ts
    blockCatalog.ts
    blockGuards.ts
    editorCommands.ts
    editorSelectors.ts
    editorCapabilities.ts
    richText/
      sanitizeRichText.ts
      renderRichText.tsx
      serializeRichText.ts
  modes/
    gridblock/
      GridBlockEditor.tsx
      GridBlockList.tsx
      GridBlockWrapper.tsx
      gridblock.registry.tsx
      gridblock.shortcuts.ts
      blocks/
        ParagraphBlock.tsx
        HeadingBlock.tsx
        QuoteBlock.tsx
        ListBlock.tsx
        ImageBlock.tsx
        EmbedBlock.tsx
        GalleryBlock.tsx
        ImageGridBlock.tsx
        MediaTextBlock.tsx
        CalloutBlock.tsx
    wordpress/
      WordPressEditor.tsx
      WordPressToolbar.tsx
      WordPressProjection.ts
      WordPressParser.ts
      WordPressSync.ts
      WordPressWarnings.tsx
  inspector/
    ...
  ai/
    ...

apps/web/store/
  editorDocumentStore.ts
  editorUiStore.ts
  editorWorkflowStore.ts
  editorSessionStore.ts

packages/utils/src/
  articleBlocks.ts
  richText.ts

apps/api/src/modules/article/
  article.validator.ts
  article.content.ts
```

## Boundary Tanggung Jawab

### 1. `core/`

Isi `core/`:

- definisi mode,
- block catalog,
- kemampuan tiap mode,
- command yang aman untuk dua mode,
- selector document,
- util rich text,
- shell editor bersama.

Yang `tidak boleh` ada di `core/`:

- perilaku keyboard spesifik GridBlock,
- parsing DOM WordPress,
- UI block spesifik mode.

### 2. `modes/gridblock/`

Isi:

- block renderer,
- wrapper,
- interaction per block,
- shortcut block-mode,
- slash command integration.

Tugas utamanya:

- mengedit `blocks[]` secara langsung dan eksplisit.

### 3. `modes/wordpress/`

Isi:

- editor kontinu,
- projection text blocks,
- parser DOM ke command core,
- warning untuk blok yang unsupported atau urutan campuran.

Tugas utamanya:

- memberikan pengalaman menulis cepat,
- tetapi tetap commit perubahan melalui command core.

### 4. Store terpisah

Pemisahan store:

- `editorDocumentStore`
  Menyimpan title, excerpt, blocks, articleId, dirty state.

- `editorUiStore`
  Menyimpan editorMode, focus mode, sidebar, active tab, active block.

- `editorWorkflowStore`
  Menyimpan publish, submit, readiness, status editorial.

- `editorSessionStore`
  Menyimpan cursor, selection, transient state, warning sementara.

Ini penting agar perubahan di mode WordPress tidak mengacaukan logic GridBlock.

## Model Integrasi Dua Mode

### Shared Canonical Model

`blocks[]` tetap menjadi model utama.

Contoh:

- `paragraph`
- `heading`
- `quote`
- `list`
- `image`
- `embed`
- `gallery`
- `imageGrid`
- `mediaText`
- `callout`

### GridBlock Flow

`UI block` -> `editorCommands` -> `document store` -> `normalize` -> `validate` -> `save`

### WordPress Flow

`continuous editor` -> `WordPressParser/Projection` -> `editorCommands` -> `document store` -> `normalize` -> `validate` -> `save`

### Aturan Anti Benturan

Aturan wajib:

1. `WordPressEditor` tidak boleh mengubah state mentah dengan parsing bebas ke store tanpa melalui command layer.
2. `GridBlock` tidak boleh menyimpan format tambahan yang tidak dikenal validator.
3. `blockCatalog` menjadi satu-satunya sumber truth untuk:
   - daftar block,
   - label,
   - alias search,
   - icon,
   - support per mode,
   - kelompok text/media.
4. renderer publik harus memakai rich text renderer yang sama untuk hasil dari dua mode.

## Capability Matrix

| Area | GridBlock | WordPress | Sumber Kebenaran |
|---|---|---|---|
| Document schema | Ya | Ya | `packages/types` |
| Save pipeline | Shared | Shared | `normalize + validator + service` |
| Block catalog | Shared | Shared | `core/blockCatalog.ts` |
| Text editing | Per block | Continuous | `editorCommands` |
| Media editing | Penuh | Terbatas / guarded | `block capabilities` |
| Reorder block | Penuh | Tidak langsung | `editorCommands` |
| Mixed layout article | Penuh | Warning/fallback | `WordPressWarnings` |
| Slash command | Ya | Opsional | `blockCatalog` |
| Rich text render publik | Shared | Shared | `core/richText/renderRichText.tsx` |

## Fase Implementasi

Di bawah ini saya susun fase implementasi yang aman dan bisa dieksekusi bertahap.

## Fase 0: Baseline dan Freeze Kontrak

### Tujuan

Membekukan kontrak data agar refactor mode tidak merusak save pipeline.

### Deliverables

- daftar field block final,
- daftar capability per block,
- daftar gap antara editor dan backend,
- daftar behavior yang dianggap canonical.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Audit field block yang dipakai UI | [ ] | [ ] | [ ] | Belum |
| Samakan `packages/types` dengan kebutuhan editor | [ ] | [ ] | [ ] | Belum |
| Persist `textAlign`, `dropCap`, `credit`, `attribution` bila dipakai | [ ] | [ ] | [ ] | Belum |
| Samakan `normalizeArticleBlocks()` dan `article.validator.ts` | [ ] | [ ] | [ ] | Belum |
| Definisikan mana block yang didukung penuh di WordPress | [ ] | [ ] | [ ] | Belum |
| Definisikan acceptance criteria per mode | [ ] | [ ] | [ ] | Belum |

## Fase 1: Bangun Shared Core

### Tujuan

Membuat pondasi modular yang akan dipakai dua mode sekaligus.

### Pekerjaan

- buat `blockCatalog.ts`,
- buat `blockGuards.ts`,
- buat `editorCommands.ts`,
- buat `editorCapabilities.ts`,
- buat util rich text shared,
- pindahkan mode switch ke boundary yang jelas.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Buat `core/blockCatalog.ts` | [ ] | [ ] | [ ] | Belum |
| Buat helper `isTextBlock`, `isMediaBlock`, `supportsMode()` | [ ] | [ ] | [ ] | Belum |
| Buat command `insertBlock` | [ ] | [ ] | [ ] | Belum |
| Buat command `replaceBlock` | [ ] | [ ] | [ ] | Belum |
| Buat command `updateTextBlock` | [ ] | [ ] | [ ] | Belum |
| Buat command `splitTextBlock` | [ ] | [ ] | [ ] | Belum |
| Buat command `mergeTextBlock` | [ ] | [ ] | [ ] | Belum |
| Buat util sanitize dan render rich text | [ ] | [ ] | [ ] | Belum |
| Ubah renderer publik agar memakai rich text renderer shared | [ ] | [ ] | [ ] | Belum |

## Fase 2: Pisahkan Store Menjadi Slice

### Tujuan

Mengurangi coupling dan mencegah konflik antar mode.

### Pekerjaan

- ekstrak document state,
- ekstrak UI state,
- ekstrak workflow state,
- pindahkan autosave agar hanya membaca state document.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Buat `editorDocumentStore.ts` | [ ] | [ ] | [ ] | Belum |
| Buat `editorUiStore.ts` | [ ] | [ ] | [ ] | Belum |
| Buat `editorWorkflowStore.ts` | [ ] | [ ] | [ ] | Belum |
| Buat selector gabungan yang stabil | [ ] | [ ] | [ ] | Belum |
| Pindahkan autosave ke document-aware flow | [ ] | [ ] | [ ] | Belum |
| Pastikan pergantian mode tidak reset document state | [ ] | [ ] | [ ] | Belum |
| Pastikan active selection/cursor dipisah dari document state | [ ] | [ ] | [ ] | Belum |

## Fase 3: Refactor GridBlock ke Modul Mandiri

### Tujuan

Menjadikan GridBlock sebagai mode yang rapi, stabil, dan menjadi canonical editor.

### Pekerjaan

- pindahkan block renderer ke folder `modes/gridblock`,
- ubah block components agar hanya memakai command layer,
- samakan slash command dengan block catalog,
- rapikan shortcut keyboard block mode.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Pindahkan `BlockList.tsx` ke `modes/gridblock/` | [ ] | [ ] | [ ] | Belum |
| Pindahkan `BlockWrapper.tsx` ke `modes/gridblock/` | [ ] | [ ] | [ ] | Belum |
| Pindahkan registry ke `gridblock.registry.tsx` | [ ] | [ ] | [ ] | Belum |
| Refactor `ParagraphBlock` agar gunakan command layer | [ ] | [ ] | [ ] | Belum |
| Refactor `HeadingBlock` agar gunakan command layer | [ ] | [ ] | [ ] | Belum |
| Refactor `QuoteBlock` agar gunakan command layer | [ ] | [ ] | [ ] | Belum |
| Refactor `ListBlock` agar mengikuti capability catalog | [ ] | [ ] | [ ] | Belum |
| Ubah slash menu memakai `blockCatalog` shared | [ ] | [ ] | [ ] | Belum |
| Tambahkan guard untuk field yang unsupported | [ ] | [ ] | [ ] | Belum |
| Pastikan GridBlock tidak lagi memuat branching WordPress | [ ] | [ ] | [ ] | Belum |

## Fase 4: Refactor WordPress ke Adapter Yang Aman

### Tujuan

Membuat WordPress mode cepat dipakai, tetapi tetap aman terhadap struktur dokumen.

### Pekerjaan

- buat projection text blocks,
- buat parser DOM yang terbatas,
- commit perubahan melalui command core,
- tampilkan warning untuk article structure yang tidak cocok,
- tentukan fallback ke GridBlock untuk kasus kompleks.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Buat `WordPressProjection.ts` | [ ] | [ ] | [ ] | Belum |
| Buat `WordPressParser.ts` dengan whitelist elemen | [ ] | [ ] | [ ] | Belum |
| Buat `WordPressSync.ts` agar semua update lewat command layer | [ ] | [ ] | [ ] | Belum |
| Tentukan tag HTML yang legal untuk mode WP | [ ] | [ ] | [ ] | Belum |
| Tentukan mapping HTML -> block update | [ ] | [ ] | [ ] | Belum |
| Batasi mode WP untuk text-dominant article | [ ] | [ ] | [ ] | Belum |
| Tampilkan warning untuk mixed media/interleaving block | [ ] | [ ] | [ ] | Belum |
| Tambahkan tombol "Lanjut edit di GridBlock" | [ ] | [ ] | [ ] | Belum |
| Pastikan non-text block tidak dihilangkan dari document order | [ ] | [ ] | [ ] | Belum |
| Pastikan Enter tidak menghasilkan state yang ambigu | [ ] | [ ] | [ ] | Belum |

## Fase 5: Satukan Entry Point Editor

### Tujuan

Membuat editor shell bersih dan mudah dipelihara.

### Pekerjaan

- `EditorCanvas` hanya bertugas memilih adapter mode,
- topbar hanya bertugas memilih mode dan menampilkan capability/warning,
- Add Block dan toolbar memakai katalog shared.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| `EditorCanvas` hanya jadi mode switcher | [ ] | [ ] | [ ] | Belum |
| `EditorTopbar` membaca capability dari core | [ ] | [ ] | [ ] | Belum |
| `AddBlockMenu` membaca dari `blockCatalog` | [ ] | [ ] | [ ] | Belum |
| Toolbar format memakai capability dan active mode | [ ] | [ ] | [ ] | Belum |
| Hilangkan branching mode dari file shared yang tidak perlu | [ ] | [ ] | [ ] | Belum |

## Fase 6: Quality Gate dan Test

### Tujuan

Menutup risiko regresi sebelum rollout.

### Pekerjaan

- tambah unit test,
- tambah interaction test,
- tambah integration test save pipeline,
- tambah snapshot atau rendering test publik.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Test `blockCatalog` dan capability | [ ] | [ ] | [ ] | Belum |
| Test `normalizeArticleBlocks()` | [ ] | [ ] | [ ] | Belum |
| Test validator terhadap field baru | [ ] | [ ] | [ ] | Belum |
| Test GridBlock split/merge | [ ] | [ ] | [ ] | Belum |
| Test GridBlock slash command | [ ] | [ ] | [ ] | Belum |
| Test WordPress projection -> command -> blocks | [ ] | [ ] | [ ] | Belum |
| Test WordPress Enter/backspace behavior | [ ] | [ ] | [ ] | Belum |
| Test switch mode tanpa kehilangan data | [ ] | [ ] | [ ] | Belum |
| Test rich text render publik | [ ] | [ ] | [ ] | Belum |
| Test autosave di dua mode | [ ] | [ ] | [ ] | Belum |

## Fase 7: Rollout Bertahap

### Tujuan

Melepas perubahan tanpa merusak authoring flow tim editorial.

### Pekerjaan

- aktifkan shared core dulu,
- migrasikan GridBlock lebih dulu,
- WordPress mode diaktifkan dengan guardrail,
- lakukan observasi sebelum capability diperluas.

### Checklist

| Checklist | Shared | GridBlock | WordPress | Status |
|---|---|---|---|---|
| Rollout shared core di balik flag internal | [ ] | [ ] | [ ] | Belum |
| Aktifkan GridBlock modular sebagai default internal | [ ] | [ ] | [ ] | Belum |
| Aktifkan WordPress modular untuk artikel teks | [ ] | [ ] | [ ] | Belum |
| Logging error sinkronisasi mode WP | [ ] | [ ] | [ ] | Belum |
| Pantau autosave failure dan publish mismatch | [ ] | [ ] | [ ] | Belum |
| Review feedback editor/redaksi | [ ] | [ ] | [ ] | Belum |

## Urutan Eksekusi Yang Saya Rekomendasikan

Urutan paling aman:

1. `Fase 0`
2. `Fase 1`
3. `Fase 2`
4. `Fase 3`
5. `Fase 6` untuk GridBlock
6. `Fase 4`
7. `Fase 6` untuk WordPress
8. `Fase 5`
9. `Fase 7`

Alasannya:

- GridBlock lebih siap dijadikan basis,
- WordPress sebaiknya masuk setelah core dan command layer stabil,
- quality gate jangan ditaruh paling akhir.

## Prioritas Pengerjaan Praktis

### Gelombang 1

Fokus:

- rapikan data contract,
- buat shared core,
- buat block catalog,
- buat rich text renderer shared.

Output minimum:

- save pipeline aman,
- rendering publik benar,
- tidak ada lagi field editor yang hilang saat save.

### Gelombang 2

Fokus:

- migrasi GridBlock ke module boundary baru,
- stabilkan command layer,
- tutup gap pada slash command dan keyboard logic.

Output minimum:

- GridBlock menjadi canonical editor yang bersih dan modular.

### Gelombang 3

Fokus:

- bangun WordPress adapter,
- tambahkan warning dan fallback,
- batasi capability sesuai keamanan struktur.

Output minimum:

- WordPress mode nyaman untuk fast writing,
- tidak merusak document structure,
- dapat fallback ke GridBlock saat artikel kompleks.

## Definition of Done Per Mode

### GridBlock dianggap selesai jika

- semua block editor memakai command layer shared,
- tidak ada hardcoded block list di luar `blockCatalog`,
- save payload konsisten dengan validator,
- shortcut penting punya test,
- switching ke WordPress tidak menghilangkan data.

### WordPress dianggap selesai jika

- semua perubahan teks masuk via projection/parser yang terbatas,
- tidak ada direct sync liar dari DOM ke state mentah,
- artikel campuran memunculkan warning yang jelas,
- unsupported structure punya fallback ke GridBlock,
- Enter, backspace, dan save tidak menghasilkan mismatch state.

## Estimasi Risiko

### Risiko rendah

- membuat `blockCatalog`,
- memindahkan registry,
- memisahkan folder mode,
- membuat rich text utilities.

### Risiko sedang

- memecah store menjadi beberapa slice,
- memindahkan block components ke command layer,
- menyatukan AddBlockMenu dan slash menu.

### Risiko tinggi

- membenahi WordPress sync berbasis `contentEditable`,
- mempertahankan pengalaman tulis kontinu sambil menjaga akurasi `blocks[]`,
- menjaga mixed content order tanpa membuat UX berat.

## Keputusan Teknis Yang Saya Sarankan

Saya menyarankan implementasi berikut:

- `GridBlock` dijadikan `canonical editor`,
- `WordPress` dijadikan `adapter mode`,
- `shared core` dibangun lebih dulu,
- `WordPress` tidak dipaksa mendukung semua skenario yang sama dengan GridBlock pada fase awal,
- capability WordPress ditambah bertahap setelah telemetry dan test memadai.

## Ringkasan Siap Eksekusi

Jika ingin langsung dikerjakan oleh tim, urutan task pertama yang paling actionable adalah:

1. buat `core/blockCatalog.ts`
2. buat `core/editorCommands.ts`
3. buat `core/richText/renderRichText.tsx`
4. sinkronkan `packages/types`, `articleBlocks.ts`, dan `article.validator.ts`
5. pecah `editorStore.ts` menjadi document/ui/workflow slice
6. migrasikan GridBlock ke `modes/gridblock/`
7. bangun `WordPressProjection.ts` dan `WordPressParser.ts`
8. tambah warning + fallback dari WordPress ke GridBlock
9. tambah test untuk cross-mode integrity

Dokumen ini dirancang agar bisa dipakai sebagai roadmap refactor tanpa membuat kedua mode saling bertabrakan selama transisi.

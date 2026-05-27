# Audit Dua Mode Editor: WordPress dan GridBlock

Tanggal audit: 2026-05-27

## Ringkasan Eksekutif

Secara konsep, fondasi editor di project ini sudah cukup baik karena kedua mode sama-sama bertumpu pada satu model data `blocks[]`, satu editor shell, dan satu alur simpan API. Ini bagus untuk menjaga output artikel tetap konsisten di level backend.

Namun, implementasi saat ini belum benar-benar modular. Mode WordPress dan mode GridBlock masih bercampur di beberapa titik shared seperti store, canvas, wrapper, toolbar, dan daftar tipe blok. Akibatnya:

1. perilaku antar mode tidak simetris,
2. ada feature yang hanya bekerja penuh di GridBlock,
3. ada risiko data/format hilang saat disimpan,
4. maintenance akan makin berat jika jumlah block type bertambah.

Kesimpulan audit:

- Struktur folder saat ini `cukup masuk akal`, tetapi `belum ideal` untuk dua mode editor yang ingin berkembang.
- Saya `menyarankan kedua mode dibuat lebih modular`, tetapi `bukan` dengan membuat dua engine data terpisah.
- Yang paling tepat adalah: `satu core editor document + dua mode presentasi/interaksi`.

## Temuan Prioritas

### 1. Kritis: metadata formatting dari editor tidak persisten ke backend

Ada mismatch antara kemampuan editor dan schema normalisasi/validasi backend.

Temuan:

- `ParagraphBlock`, `HeadingBlock`, dan `QuoteBlock` mendukung `textAlign`.
- `ParagraphBlock` mendukung `dropCap`.
- `ImageBlock` mendukung `credit`.
- Tetapi `normalizeArticleBlocks()` tidak mempertahankan field-field tersebut.
- `article.validator.ts` juga tidak menerima field-field tersebut.

Efek:

- user bisa mengatur alignment atau drop cap di editor,
- tetapi saat autosave / save manual / submit, data itu hilang,
- hasil publish tidak sesuai ekspektasi editor.

Bukti teknis:

- `apps/web/components/editor/EditorialToolbar.tsx`
- `packages/types/src/block.ts`
- `packages/utils/src/articleBlocks.ts`
- `apps/api/src/modules/article/article.validator.ts`

Penilaian:

- ini adalah bug data contract, bukan sekadar masalah UI.

### 2. Kritis: mode WordPress tidak menjaga struktur teks secara andal saat user menekan Enter

`WordPressEditor.tsx` merender semua text block sebagai satu `contentEditable`, lalu melakukan sinkronisasi balik ke `blocks[]` dengan membaca children DOM.

Masalah utamanya:

- komentar kode sendiri menyebut Enter akan membiarkan browser membuat `<div>` atau `<br>`,
- tetapi `syncToBlocks()` hanya menangani `p`, `h2`, `h3`, `h4`, `blockquote`, `ul`, `ol`,
- tidak ada mekanisme menambah block baru ketika jumlah paragraf hasil edit bertambah,
- tidak ada mekanisme menghapus / merge block ketika struktur DOM berkurang.

Efek:

- user bisa merasa sudah membuat paragraf baru,
- tetapi state `blocks[]` belum tentu mewakili hasil edit DOM,
- hasil save berpotensi tidak sama dengan yang terlihat di kanvas WordPress mode.

Bukti teknis:

- `apps/web/components/editor/WordPressEditor.tsx`
- `apps/web/store/editorStore.ts`

Penilaian:

- ini adalah risiko integritas konten paling besar di mode WordPress saat ini.

### 3. Tinggi: mode WordPress memindahkan blok non-teks ke bawah, bukan mempertahankan urutan artikel asli

Di `WordPressEditor.tsx`, text block digabung menjadi satu editor kontinu, sedangkan non-text block dipisah ke section lain di bawah editor.

Efek:

- urutan artikel saat edit tidak sama dengan urutan artikel saat publish,
- jika artikel memiliki pola `paragraf -> image -> paragraf -> embed`, user tidak melihat struktur sebenarnya,
- keputusan editorial terkait flow baca bisa salah karena preview edit menyesatkan.

Bukti teknis:

- `apps/web/components/editor/WordPressEditor.tsx`
- `apps/web/app/[site]/artikel/[slug]/page.tsx`

Penilaian:

- secara UX ini membuat WordPress mode terasa cepat, tetapi secara editorial berisiko.

### 4. Tinggi: formatting inline yang disimpan sebagai HTML belum dirender sebagai rich text di halaman publik

Block editor menyimpan `content` dari block teks sebagai HTML (`innerHTML`), baik di mode GridBlock maupun WordPress.

Namun renderer publik di halaman artikel menampilkan:

- `paragraph` dengan `{block.content}`
- `heading` dengan `{block.content}`
- `quote` dengan `{block.content}`

Artinya string HTML akan diperlakukan sebagai text biasa, bukan rich text.

Efek:

- bold, italic, underline, link, line break, highlight yang diinput editor tidak tampil sebagaimana mestinya di halaman publik,
- gap besar antara pengalaman authoring dan output reader.

Bukti teknis:

- `apps/web/components/editor/blocks/ParagraphBlock.tsx`
- `apps/web/components/editor/WordPressEditor.tsx`
- `apps/web/app/[site]/artikel/[slug]/page.tsx`

Penilaian:

- ini berdampak ke kedua mode, karena keduanya berbagi schema konten yang sama.

### 5. Sedang: definisi block catalog tersebar dan duplikatif

Daftar tipe blok saat ini muncul di beberapa tempat:

- `AddBlockMenu.tsx`
- `ParagraphBlock.tsx` untuk slash command
- `BlockRegistry.tsx`
- sebagian lagi implicit di `WordPressEditor.tsx` melalui `isTextBlock()`

Efek:

- saat menambah block baru, perubahan harus dilakukan di banyak file,
- rawan ada block yang muncul di menu tetapi tidak sinkron dengan mode lain,
- maintenance makin mahal seiring pertumbuhan fitur.

Penilaian:

- ini adalah indikasi kuat bahwa arsitektur editor belum punya single source of truth untuk block definition.

### 6. Sedang: store editor terlalu gemuk dan mencampur document state, workflow, dan UI state

`editorStore.ts` saat ini menangani:

- artikel dan blok,
- autosave,
- workflow editorial,
- sidebar/focus mode/tab,
- active block,
- publish / submit,
- helper readiness score.

Efek:

- perubahan kecil di satu area mudah memengaruhi area lain,
- sulit membuat testing yang fokus,
- mode-specific behavior makin sulit dipisahkan.

Penilaian:

- ini belum darurat, tetapi akan menjadi bottleneck maintenance.

### 7. Sedang: coverage test belum cukup untuk area paling riskan

Yang tersedia baru test store dasar. Saya tidak menemukan test komponen/editor behavior untuk:

- WordPress mode sync DOM -> blocks,
- split/merge block,
- slash command,
- cross-mode switching,
- rendering publik rich text.

Efek:

- area yang paling kompleks justru paling sedikit pagar regresinya.

Bukti teknis:

- `apps/web/store/editorStore.test.ts`
- tidak terlihat test spesifik di `apps/web/components/editor`

## Audit Per Mode

### Mode GridBlock

Kelebihan:

- lebih dekat ke model data `blocks[]`,
- perilaku block-based cukup jelas,
- lebih cocok untuk layout editorial yang kompleks,
- block wrapper, registry, dan block components sudah mengarah ke pola yang bisa diskalakan.

Kekurangan:

- logic keyboard dan contentEditable tersebar per block component,
- block catalog belum terpusat,
- beberapa formatting tidak ikut persisten karena contract backend belum lengkap.

Kesimpulan:

- GridBlock saat ini adalah mode yang paling aman untuk dijadikan `canonical editing model`.

### Mode WordPress

Kelebihan:

- cepat untuk pengalaman menulis long-form,
- UI lebih ringan,
- cocok untuk author yang ingin pengalaman menulis kontinu.

Kekurangan:

- bukan representasi 1:1 dari struktur artikel sebenarnya,
- tidak menjaga urutan blok campuran teks dan media,
- sinkronisasi DOM ke `blocks[]` masih rapuh,
- tidak tampak ada jalur yang nyaman untuk menambah block non-teks langsung dari mode ini,
- behavior-nya bergantung pada parsing DOM manual.

Kesimpulan:

- mode ini belum cukup matang untuk dijadikan mode utama tanpa guardrail tambahan.

## Audit Struktur Folder

### Apa yang sudah benar

Struktur berikut sudah cukup sehat:

- `apps/web/components/editor/blocks` memisahkan block component per tipe.
- `apps/web/components/editor/inspector` memisahkan panel sidebar editorial.
- `apps/web/components/editor/ai` memisahkan fitur AI.
- `apps/web/store/editorStore.ts` menjadi pusat state editor.
- route create/edit artikel sudah sederhana dan bersih.

Ini menunjukkan fondasi feature-based sudah ada.

### Yang belum ideal

Saat ini batas antar concern masih kabur:

- mode WordPress dan GridBlock belum punya boundary folder sendiri,
- shared component masih berisi percabangan mode,
- registry, menu, parser, dan toolbar belum ditarik ke lapisan yang jelas,
- domain editor masih tercampur dengan presentational concern.

Contoh coupling:

- `EditorCanvas.tsx` memutuskan mode.
- `BlockWrapper.tsx` juga memutuskan mode.
- `EditorTopbar.tsx` mengontrol mode.
- `editorStore.ts` menyimpan mode sekaligus banyak concern lain.
- `WordPressEditor.tsx` punya parser sendiri yang tidak dibagi dengan bagian lain.

Kesimpulan struktur:

- `struktur folder saat ini belum salah`, tetapi `belum cukup modular` untuk dua mode editor yang kompleks.

## Pendapat dan Rekomendasi Modularisasi

### Rekomendasi utama

Saya menyarankan kedua mode dibuat modular, dengan prinsip:

`Satu document model, dua interaction mode.`

Jangan membuat:

- mode WordPress punya schema sendiri,
- mode GridBlock punya schema sendiri.

Karena itu akan menggandakan:

- validasi,
- migrasi data,
- rendering publik,
- autosave,
- testing,
- bug surface.

Yang lebih tepat:

1. `Core document layer`
   Menyimpan artikel dalam bentuk canonical `blocks[]`.

2. `Shared editor commands`
   Misalnya:
   - `insertBlock`
   - `replaceBlock`
   - `updateTextBlock`
   - `moveBlock`
   - `mergeBlocks`
   - `splitTextBlock`

3. `Mode adapters`
   - GridBlock mode memakai block-per-block interaction.
   - WordPress mode memakai continuous-text projection, tetapi tetap berbasis document core yang sama.

4. `Shared block catalog`
   Semua metadata block disimpan di satu file:
   - type
   - label
   - icon
   - searchable aliases
   - apakah supported di WordPress mode
   - apakah text block atau media block

5. `Separate stores / slices`
   Pisahkan minimal:
   - document state,
   - UI state,
   - workflow state.

### Rekomendasi struktur folder

Struktur yang saya sarankan:

```text
apps/web/components/editor/
  core/
    Editor.tsx
    ArticleEditorShell.tsx
    EditorCanvas.tsx
    EditorTopbar.tsx
    editorCommands.ts
    blockCatalog.ts
    blockGuards.ts
  modes/
    gridblock/
      GridBlockEditor.tsx
      BlockList.tsx
      BlockWrapper.tsx
      registry.tsx
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
      WordPressTextFlow.ts
      WordPressToolbar.tsx
      WordPressProjection.ts
  inspector/
    ...
  ai/
    ...
```

Jika ingin lebih rapi lagi secara domain, editor juga bisa dipindahkan menjadi feature khusus, misalnya:

```text
apps/web/features/article-editor/
  domain/
  application/
  presentation/
```

### Single source of truth yang wajib dibuat

Saya sangat menyarankan membuat satu `blockCatalog.ts` yang dipakai oleh:

- `AddBlockMenu`
- slash command
- block registry
- WordPress mode filter
- validation helper
- toolbar format selector

Dengan begitu, setiap penambahan block baru hanya perlu mendaftar sekali.

### Perlakuan khusus untuk WordPress mode

Menurut saya, WordPress mode sebaiknya diposisikan sebagai:

- `mode penulisan cepat`,
- bukan `mode struktur penuh`.

Pilihan implementasi yang aman:

1. Izinkan WordPress mode hanya untuk artikel dominan teks.
2. Tampilkan warning jika artikel mengandung banyak media/interleaving block.
3. Beri fallback "edit lanjutan di GridBlock" untuk block non-teks.
4. Jika perlu, jadikan WordPress mode sebagai layer presentasi dari text segments saja, bukan parser DOM bebas.

Kalau WordPress mode tetap ingin mendukung semua layout campuran, maka effort-nya akan besar dan sebaiknya memakai engine editor yang lebih kuat daripada parsing manual `contentEditable`.

## Prioritas Perbaikan

### Prioritas 1

- Samakan contract editor -> normalizer -> validator -> public renderer.
- Persist `textAlign`, `dropCap`, dan `credit` bila memang fitur ini ingin dipertahankan.
- Pastikan rich text dirender benar di halaman publik.

### Prioritas 2

- Refactor `block catalog` menjadi satu sumber data.
- Pisahkan logic mode WordPress dan GridBlock ke boundary folder yang jelas.
- Pisahkan store menjadi slice document vs UI/workflow.

### Prioritas 3

- Tambahkan test untuk:
  - WordPress sync,
  - split/merge,
  - slash command,
  - save payload normalization,
  - public rich text rendering.

## Penilaian Final

Jawaban atas tiga pertanyaan audit:

1. `Audit dua mode`
   - GridBlock lebih matang dan lebih selaras dengan model data.
   - WordPress mode masih berguna, tetapi implementasinya belum cukup aman untuk struktur artikel campuran dan sinkronisasi DOM yang kompleks.

2. `Apakah struktur folder sudah benar?`
   - `Sebagian benar`, terutama pemisahan `blocks`, `inspector`, dan `ai`.
   - Tetapi untuk dua mode editor, strukturnya `belum cukup eksplisit` dan masih terlalu banyak coupling di layer shared.

3. `Apakah sebaiknya dibuat modular?`
   - `Ya, sangat disarankan`.
   - Modularisasi akan sangat membantu maintenance, tetapi harus dilakukan dengan `satu core document model` dan `dua mode interaksi`, bukan dua sistem editor yang benar-benar terpisah.

## Rekomendasi Keputusan

Jika saya yang mengambil keputusan teknis untuk project news website ini, saya akan memilih:

- `GridBlock sebagai source of truth utama`
- `WordPress sebagai fast writing mode yang dibatasi`
- `shared core editor document dan command layer`
- `refactor bertahap, bukan rewrite total`

Ini memberi keseimbangan terbaik antara:

- kecepatan pengembangan,
- kestabilan data,
- kemudahan onboarding developer,
- dan biaya maintenance jangka panjang.

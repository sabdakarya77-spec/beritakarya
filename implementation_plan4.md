# Rencana Implementasi: Editor Rasa MS Word & WordPress Classic (v2 — Lengkap)

---

## Ringkasan Perubahan

Rencana ini mencakup **semua** perubahan yang diperlukan agar pengalaman menulis di editor terasa seperti MS Word / WordPress Classic, sambil tetap mempertahankan arsitektur blok di belakang layar.

---

## Open Questions

> [!IMPORTANT]
> **Perataan Teks (Alignment)**
> Saat ini type `ParagraphBlock` belum memiliki properti `textAlign`. Kita perlu menambahkannya di shared types package (`@beritakarya/types`). Apakah alignment juga perlu diterapkan untuk `HeadingBlock` dan `QuoteBlock`?

> [!IMPORTANT]
> **Keyboard Shortcut Tambahan**
> Apakah Anda ingin menambahkan shortcut tambahan seperti `Ctrl+Shift+L` (rata kiri), `Ctrl+E` (rata tengah), `Ctrl+J` (rata kiri-kanan/justify) seperti standar Word? Atau cukup melalui toolbar saja?

---

## Proposed Changes

### Komponen 1: Type System — Menambah Properti `textAlign`

#### [MODIFY] [block.ts](file:///d:/beritakarya/packages/types/src/block.ts)

Menambahkan properti opsional `textAlign` pada `ParagraphBlock`, `HeadingBlock`, dan `QuoteBlock`:

```diff
 export interface ParagraphBlock extends BaseBlock {
   type: 'paragraph'
   content: string
   dropCap?: boolean
+  textAlign?: 'left' | 'center' | 'right' | 'justify'
 }

 export interface HeadingBlock extends BaseBlock {
   type: 'heading'
   level: 1 | 2 | 3 | 4 | 5 | 6
   content: string
+  textAlign?: 'left' | 'center' | 'right' | 'justify'
 }
```

---

### Komponen 2: Store — Fungsi `splitBlock` dan `mergeWithPrevious`

#### [MODIFY] [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts)

Menambahkan dua aksi baru:

**`splitBlock(id, contentBefore, contentAfter)`**
* Memperbarui blok `id` dengan `contentBefore`.
* Membuat blok paragraf baru berisi `contentAfter` tepat setelah blok `id`.
* Mengembalikan `newBlockId` agar ParagraphBlock bisa memindahkan fokus kursor ke blok baru.

**`mergeWithPrevious(id)`**
* Menemukan blok sebelumnya dalam array `blocks`.
* Jika blok sebelumnya bertipe teks (`paragraph`, `heading`, `quote`):
  * Menggabungkan konten blok `id` ke akhir konten blok sebelumnya.
  * Menghapus blok `id` dari array.
  * Mengembalikan `{ targetBlockId, cursorOffset }` agar ParagraphBlock bisa menempatkan kursor di titik penggabungan.
* Jika blok sebelumnya bukan teks (misal `image`, `gallery`): tidak melakukan apa-apa (mencegah kehilangan data).

**`getBlockIndex(id)` / `getAdjacentBlockId(id, direction)`**
* Utilitas untuk mendapatkan blok tetangga (atas/bawah), digunakan oleh navigasi panah.

---

### Komponen 3: Keyboard Flow pada ParagraphBlock

#### [MODIFY] [ParagraphBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/ParagraphBlock.tsx)

Pada handler `onKeyDown`, kita menambahkan penanganan untuk:

##### A. `Enter` — Belah Paragraf (Split)
```
1. e.preventDefault() (mencegah browser membuat <div> baru di dalam contentEditable)
2. Dapatkan posisi kursor via Selection API
3. Ekstrak HTML sebelum kursor → contentBefore
4. Ekstrak HTML setelah kursor → contentAfter
5. Panggil store.splitBlock(block.id, contentBefore, contentAfter)
6. Pada tick berikutnya (requestAnimationFrame), fokuskan kursor ke awal blok baru
```

##### B. `Shift+Enter` — Baris Baru dalam Paragraf yang Sama (Soft Line Break)
```
1. e.preventDefault()
2. Sisipkan tag <br> di posisi kursor menggunakan Range API
3. Pindahkan kursor ke setelah <br>
```
Ini penting karena penulis WordPress terbiasa menggunakan `Shift+Enter` untuk membuat baris baru tanpa memulai paragraf baru.

##### C. `Backspace` di Awal Paragraf — Gabung dengan Blok Atas (Merge)
```
1. Cek apakah kursor di offset 0 (awal paragraf)
2. Jika ya: e.preventDefault()
3. Panggil store.mergeWithPrevious(block.id)
4. Dapatkan { targetBlockId, cursorOffset } dari hasil merge
5. Fokuskan kursor ke targetBlockId pada posisi cursorOffset
```

##### D. `Delete` di Akhir Paragraf — Gabung dengan Blok Bawah
```
1. Cek apakah kursor di akhir paragraf (offset === textContent.length)
2. Jika ya: e.preventDefault()
3. Cari blok selanjutnya di array
4. Jika blok berikutnya bertipe teks: gabungkan kontennya ke paragraf saat ini lalu hapus blok tersebut
```

##### E. Navigasi Panah $\uparrow$ dan $\downarrow$
```
1. ArrowUp: Cek apakah kursor berada di baris pertama (membandingkan rect.top kursor dengan rect.top editor)
   - Jika ya: e.preventDefault(), fokuskan kursor ke akhir teks blok sebelumnya
2. ArrowDown: Cek apakah kursor berada di baris terakhir (membandingkan rect.bottom kursor dengan rect.bottom editor)
   - Jika ya: e.preventDefault(), fokuskan kursor ke awal teks blok selanjutnya
```

##### F. `Tab` — Indentasi (Opsional tapi Word-like)
```
1. e.preventDefault()
2. Sisipkan 4 spasi atau karakter tab di posisi kursor
```

---

### Komponen 4: Keyboard Flow pada HeadingBlock dan QuoteBlock

#### [MODIFY] [HeadingBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/HeadingBlock.tsx)

Saat ini HeadingBlock tidak menangani keyboard sama sekali. Kita perlu menambahkan:
* **`Enter`**: Membuat paragraf baru di bawah heading dan memindahkan fokus ke sana (persis seperti Word: setelah mengetik judul lalu tekan Enter, kursor langsung pindah ke baris teks biasa).
* **`Backspace` di awal heading kosong**: Mengubah heading kembali menjadi paragraf biasa (menggunakan `replaceBlock`).
* **Navigasi panah**: Sama seperti ParagraphBlock.

#### [MODIFY] [QuoteBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/QuoteBlock.tsx)

* **`Enter` di akhir kutipan kosong**: Mengubah quote kembali menjadi paragraf biasa (keluar dari mode kutipan, seperti di Word).
* **`Backspace` di awal quote kosong**: Mengubah quote kembali menjadi paragraf.

---

### Komponen 5: Paste Handling — Membersihkan Format Berantakan

#### [MODIFY] [ParagraphBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/ParagraphBlock.tsx)

Menambahkan handler `onPaste` pada `contentEditable`:
```
1. e.preventDefault()
2. Ambil data dari clipboard:
   - Prioritas 1: e.clipboardData.getData('text/html')
   - Prioritas 2: e.clipboardData.getData('text/plain')
3. Jika HTML: Sanitasi — hanya pertahankan tag yang diizinkan:
   <b>, <strong>, <i>, <em>, <u>, <s>, <a>, <br>, <span> (dengan style terbatas)
   Hapus semua tag lain (<div>, <p>, <h1>-<h6>, <table>, <style>, dll.)
   Hapus semua atribut kecuali href pada <a>
   Hapus semua inline style kecuali yang berkaitan dengan format teks (color, background-color, font-weight, font-style, text-decoration)
4. Jika plain text: Escape HTML entities dan ganti newline (\n) dengan <br>
5. Sisipkan hasil sanitasi di posisi kursor menggunakan document.execCommand('insertHTML')
```

Ini **sangat krusial** untuk penulis Indonesia yang terbiasa menulis di Word lalu copy-paste ke editor web. Tanpa sanitasi, format berantakan dari Word (seperti font Calibri, spacing aneh, dan class CSS Microsoft) akan merusak tampilan artikel.

---

### Komponen 6: Peningkatan InlineToolbar

#### [MODIFY] [InlineToolbar.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/InlineToolbar.tsx)

Menambahkan tombol baru setelah tombol Underline yang sudah ada:

| Tombol | Aksi |
|--------|------|
| **Strikethrough** (`<s>`) | `document.execCommand('strikeThrough')` |
| **Highlight** (stabilo warna) | Dropdown kecil dengan 5 warna: Kuning, Hijau, Biru Muda, Pink, Hapus. Menggunakan `document.execCommand('backColor', false, warna)` |
| **Warna Teks** | Dropdown kecil dengan warna: Merah, Biru, Abu-abu, Hijau Tua, Hapus. Menggunakan `document.execCommand('foreColor', false, warna)` |
| **Hapus Format** | `document.execCommand('removeFormat')` — menghapus semua format inline dari teks terpilih. Penting untuk membersihkan hasil copy-paste |

CSS tambahan di `ParagraphBlock`: menambahkan selector untuk tag `<s>`, `<strike>`, dan `<span>` dengan style inline agar format baru terlihat di editor.

---

### Komponen 7: Editorial Toolbar (Sticky Top Toolbar)

#### [NEW] [EditorialToolbar.tsx](file:///d:/beritakarya/apps/web/components/editor/EditorialToolbar.tsx)

Komponen toolbar baru yang menempel di atas kanvas artikel (di bawah `EditorTopbar` yang sudah ada). Toolbar ini hanya muncul ketika blok teks aktif (paragraf, heading, atau quote).

**Layout Toolbar:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [Paragraf ▾]  │  B  I  U  S  │  🎨  📌  │  ≡←  ≡↔  ≡→  ≡⇔  │
│  (dropdown)   │ (inline fmt) │(warna/hl)│    (alignment)      │
└──────────────────────────────────────────────────────────────────┘
```

**Fitur-fitur:**
1. **Format Dropdown**: Mengubah tipe blok aktif → Paragraf / Subjudul H2 / Sub-Subjudul H3 / H4. Memanggil `replaceBlock()` dari store.
2. **Inline Format Buttons**: Bold, Italic, Underline, Strikethrough — memanggil `document.execCommand()`.
3. **Warna & Highlight**: Sama seperti di InlineToolbar, tetapi tersedia kapan saja tanpa perlu memblok teks terlebih dahulu.
4. **Alignment Buttons**: Rata Kiri, Rata Tengah, Rata Kanan, Rata Kiri-Kanan (Justify) — memanggil `updateBlock(activeBlockId, { textAlign: '...' })`.

#### [MODIFY] [EditorCanvas.tsx](file:///d:/beritakarya/apps/web/components/editor/EditorCanvas.tsx)

Menambahkan `<EditorialToolbar />` di dalam kanvas, tepat sebelum `<BlockList />`. Toolbar ini bersifat `sticky` agar selalu terlihat saat penulis menggulir ke bawah.

#### [MODIFY] [ParagraphBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/ParagraphBlock.tsx)

Menerapkan `textAlign` dari data blok ke style `contentEditable`:
```tsx
style={{ textAlign: block.textAlign || 'left' }}
```

#### [MODIFY] [HeadingBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/HeadingBlock.tsx)

Sama — menerapkan `textAlign` dari data blok.

---

### Komponen 8: Penyempurnaan UX Tambahan

#### [MODIFY] [BlockWrapper.tsx](file:///d:/beritakarya/apps/web/components/editor/BlockWrapper.tsx)

* **Mengurangi visual "kotak blok"**: Menipiskan border saat tidak hover/aktif agar penulis merasa menulis di satu halaman kosong yang mengalir, bukan di dalam kotak-kotak terpisah. Border dan tombol navigasi blok tetap muncul saat hover atau aktif.

#### [MODIFY] [BlockList.tsx](file:///d:/beritakarya/apps/web/components/editor/BlockList.tsx)

* **Mengurangi jarak antar-blok**: Mengubah `space-y-1` menjadi jarak yang lebih rapat untuk blok teks yang berurutan (paragraf → paragraf, paragraf → heading) agar terasa seperti satu dokumen, bukan kartu-kartu terpisah.

---

## Urutan Implementasi

| Fase | Komponen | Prioritas |
|------|----------|-----------|
| 1 | Type System (`block.ts` — textAlign) | Tinggi |
| 2 | Store (`editorStore.ts` — splitBlock, mergeWithPrevious) | Tinggi |
| 3 | Keyboard Flow ParagraphBlock (Enter, Backspace, Arrow) | Tinggi |
| 4 | Paste Handling (sanitasi copy-paste dari Word) | Tinggi |
| 5 | Keyboard Flow HeadingBlock & QuoteBlock | Sedang |
| 6 | InlineToolbar Enhancement (Strikethrough, Highlight, Warna) | Sedang |
| 7 | Editorial Toolbar (Sticky Top Toolbar) | Sedang |
| 8 | Visual Polish (BlockWrapper, BlockList spacing) | Rendah |

---

## Verification Plan

### Skenario Uji Manual

1. **Split & Merge Paragraf**
   - Ketik kalimat panjang, letakkan kursor di tengah, tekan `Enter` → teks terbelah dua
   - Tekan `Backspace` di awal paragraf kedua → paragraf menyatu kembali
   - Kursor harus berada tepat di titik penggabungan

2. **Navigasi Keyboard**
   - Tulis 4 paragraf, gunakan tombol ↑ ↓ untuk menelusuri → kursor berpindah mulus antar-blok
   - `Shift+Enter` → membuat baris baru dalam paragraf yang sama (bukan paragraf baru)

3. **Copy-Paste dari Word**
   - Salin teks dari Microsoft Word yang mengandung bold, italic, tabel, dan font khusus
   - Paste ke editor → hanya format yang diizinkan (bold, italic, underline) yang masuk, sisanya dibersihkan

4. **Toolbar Format**
   - Blok teks, klik Strikethrough → teks tercoret
   - Klik Highlight kuning → latar belakang teks berubah kuning
   - Klik Hapus Format → semua gaya teks kembali normal

5. **Editorial Toolbar**
   - Klik paragraf, ubah dropdown ke "Subjudul H2" → paragraf berubah menjadi heading
   - Klik tombol "Rata Tengah" → teks paragraf berubah perataan
   - Klik tombol "Justify" → teks rata kiri-kanan

6. **Heading & Quote Behavior**
   - Di heading, tekan Enter → kursor pindah ke paragraf baru di bawah
   - Di heading kosong, tekan Backspace → heading berubah menjadi paragraf

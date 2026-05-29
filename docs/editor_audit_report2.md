# LAPORAN AUDIT MENDALAM: MODUL EDITOR & KONTEN TERKAIT (BERITAKARYA MONOREPO)

**Peran:** Senior Auditor & Architect News System Website  
**Tanggal Audit:** 29 Mei 2026  
**Status:** Audit Komprehensif Selesai (Termasuk Core, Store Slices, Custom Extensions, dan AI Tools)

---

## 📊 EXECUTIVE SUMMARY

Setelah melakukan peninjauan kode (*deep-dive code review*) secara menyeluruh pada folder `apps/web/components/editor` dan seluruh file yang berhubungan (state store slices, custom extensions, hooks, API validation, dan modul rendering publik), kami menemukan total **14 temuan krusial** yang berdampak langsung pada **keamanan (XSS)**, **fungsionalitas inti yang rusak total (Broken Features)**, **degradasi performa berat (Lagging)**, dan **arsitektur kode yang rentan terhadap desinkronisasi data**.

Berikut adalah ringkasan temuan berdasarkan tingkat keparahan (*Severity Level*):

| Tingkat Keparahan | Jumlah Temuan | Deskripsi Dampak |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** | 4 | Menghancurkan performa pengetikan, merusak total fungsionalitas Undo/Redo global, membuat fitur asisten AI Writing tidak berfungsi, serta memicu resiko crash/instabilitas ProseMirror secara internal. |
| 🟡 **HIGH** | 5 | Mengakibatkan tag HTML mentah tampil literal di situs publik, menonaktifkan seluruh rich custom extensions, mengisolasi total seluruh modul AI (SEO, Optimize, & Validate), serta menyebabkan desinkronisasi data ganda pada store state. |
| 🟢 **MEDIUM** | 4 | Dropdown alur kerja mati, floating menu melayang kacau saat scroll, tombol gambar toolbar mem-bypass Media Library modal, dan terdapat anti-pattern React yang memicu siklus re-render tak terbatas. |
| 🔵 **LOW / CLEANUP** | 2 | Duplikasi logika sinkronisasi tiptap yang menjadi kode mati, dan kesalahan representasi visual ikon statistik editor. |

---

## 🛠️ DETAIL TEMUAN AUDIT & ANALISIS KODE

### 1. 🔴 [CRITICAL] Regenerasi ID Blok yang Tidak Stabil pada Setiap Keystroke (Performance Bug)
* **Lokasi File:** 
  * [TiptapEditor.tsx](file:///d:/beritakarya/apps/web/components/editor/TiptapEditor.tsx)
  * [useTiptapSync.ts](file:///d:/beritakarya/apps/web/components/editor/hooks/useTiptapSync.ts)
* **Masalah:**
  Di dalam fungsi `convertTiptapToBlocks` (dan `tiptapToBlocks`), ID untuk setiap blok di-generate ulang secara dinamis menggunakan stempel waktu (`Date.now()`) pada setiap perubahan teks:
  ```typescript
  return content.map((node: any, index: number) => {
    const baseBlock = {
      id: `block-${Date.now()}-${index}`, // ⚠️ BUG UTAMA
    }
    // ...
  })
  ```
  Karena Tiptap memicu event `onUpdate` pada **setiap tombol yang ditekan (keystroke)**, ID seluruh blok di dokumen akan berubah secara konstan ribuan kali saat pengguna mengetik.
* **Dampak:**
  * **Render Lag Ekstrim:** Jika ada komponen React lain (seperti Sidebar, Outline, atau visual block editor) yang merender daftar blok ini dengan `key={block.id}`, semua komponen anak tersebut akan di-unmount dan di-remount dari DOM pada setiap huruf yang diketik. Ini menciptakan latensi pengetikan yang sangat parah seiring bertambah panjangnya artikel.
  * **Kehilangan Fokus & State:** Input atau elemen lain yang dikaitkan dengan ID blok tersebut akan kehilangan fokus secara instan, membuat interaksi sidebar menjadi tidak mungkin digunakan saat mengetik.
* **Rekomendasi Perbaikan:**
  ProseMirror memiliki ID unik bawaan untuk setiap node jika dikonfigurasi dengan ekstensi seperti `@tiptap/extension-unique-id`, atau kita dapat mempertahankan ID blok yang sudah ada berdasarkan index jika tipe dan posisi blok tidak berubah, atau meng-generate ID *hanya* ketika blok baru benar-benar dibuat.

---

### 2. 🔴 [CRITICAL] Intersepsi Shortcut Global Merusak Total Fitur Undo (Ctrl+Z)
* **Lokasi File:** 
  * [Editor.tsx](file:///d:/beritakarya/apps/web/components/editor/Editor.tsx#L64-L81)
  * [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts#L131-L134)
* **Masalah:**
  Ada dua sub-masalah besar yang saling bertabrakan:
  1. Di `Editor.tsx`, shortcut `Ctrl+Z` diintersepsi secara global menggunakan `e.preventDefault()`, sehingga ProseMirror tidak pernah menerima event tersebut:
     ```typescript
     if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
       e.preventDefault()
       undo() // Memanggil undo() di store global, bukan local Tiptap
     }
     ```
  2. Saat `undo()` di store memulihkan state blok sebelumnya, `TiptapEditor.tsx` memiliki listener efek pengisian content:
     ```typescript
     // Hanya load dari store jika editor kosong
     const hasContent = currentContent.content && currentContent.content.length > 0
     if (!hasContent && blocks && blocks.length > 0) {
       editor.commands.setContent(html)
     }
     ```
* **Dampak:**
  * **Undo Visual Rusak Total:** Karena visual editor *tidak pernah* dianggap kosong saat pengguna sedang menulis (`hasContent === true`), perubahan blok hasil dari `undo()` di store **tidak pernah disinkronkan kembali** ke layar visual Tiptap!
  * **Desinkronisasi Data:** Layar editor tetap menampilkan teks baru, tetapi data di store sudah mundur ke state lama. Saat pengguna mengetik satu huruf berikutnya, Tiptap memicu `onUpdate` dan menimpa store kembali dengan konten visualnya. Fitur Undo menjadi tidak berfungsi sama sekali.
  * **Banjir Undo Stack:** Store mencatat perubahan ke `undoStack` pada setiap keystroke (tanpa debouncing), yang dibatasi hanya 20 entri. Ini berarti mengetik dua kata pendek (20 karakter) akan menghapus seluruh memori undo sebelumnya, sehingga pengguna tidak bisa kembali ke versi menit lalu.
* **Rekomendasi Perbaikan:**
  * Hapus intersepsi Ctrl+Z di `Editor.tsx` saat fokus berada di dalam Tiptap. Biarkan history internal Tiptap (ProseMirror-history) menangani undo/redo teks secara native dan mulus.
  * Hanya gunakan `undo()` global store untuk operasi skala makro seperti penataan ulang tata letak blok (*grid block reordering*).

---

### 3. 🔴 [CRITICAL] Tombol AI Writing "Terapkan ke Editor" Mengirim Event ke Kode Mati
* **Lokasi File:** 
  * [WriteTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/tabs/WriteTab.tsx#L44-L47)
* **Masalah:**
  Setelah AI menghasilkan teks alternatif, tombol "Terapkan ke Editor" memicu pengiriman event kustom pada objek `window`:
  ```typescript
  const applyResult = (result: string) => {
    window.dispatchEvent(new CustomEvent('ai-apply-content', { detail: { content: result } }))
  }
  ```
  Namun, **tidak ada satu pun komponen** di seluruh codebase frontend (`TiptapEditor`, `Editor`, dll.) yang mendengarkan (*listen*) event `'ai-apply-content'` tersebut!
* **Dampak:**
  * Fitur utama asisten penulisan AI rusak secara fungsional. Pengguna mengklik tombol "Terapkan" dan tidak terjadi apa-apa di dokumen editor, memaksa mereka menyalin manual hasil tersebut.
* **Rekomendasi Perbaikan:**
  Daftarkan event listener di dalam `TiptapEditor.tsx` untuk menangkap event ini dan memasukkannya ke cursor aktif saat ini:
  ```typescript
  useEffect(() => {
    const handleAIApply = (e: Event) => {
      const customEvent = e as CustomEvent
      const content = customEvent.detail?.content
      if (editor && content) {
        editor.commands.insertContent(content)
      }
    }
    window.addEventListener('ai-apply-content', handleAIApply)
    return () => window.removeEventListener('ai-apply-content', handleAIApply)
  }, [editor])
  ```

---

### 4. 🔴 [CRITICAL] Kesalahan Konfigurasi ProseMirror Skema: `atom: true` dengan Kontainer `content: 'block+'`
* **Lokasi File:**
  * [MediaTextExtension.tsx](file:///d:/beritakarya/apps/web/components/editor/extensions/MediaTextExtension.tsx#L200-L205)
* **Masalah:**
  Di dalam `MediaTextExtension.tsx`, ekstensi dideklarasikan dengan flag `atom: true`, tetapi pada saat yang sama menentukan skema `content: 'block+'` dan merender `<NodeViewContent />` di dalam komponen React untuk menerima block teks pendamping gambar:
  ```typescript
  export const MediaTextExtension = Node.create({
    name: 'mediaText',
    group: 'block',
    atom: true,        // ⚠️ BENTROK FUNDAMENTAL DENGAN BARIS DI BAWAH
    draggable: true,
    content: 'block+', // Tiptap mendefinisikan ini sebagai kontainer konten
  ```
* **Dampak:**
  * **Crash/Instabilitas ProseMirror:** ProseMirror memperlakukan node beratribut `atom: true` sebagai elemen tunggal kedap air (seperti `<img>` atau `<hr>`) yang *tidak boleh* memiliki dokumen terstruktur di dalamnya. Menggabungkan kedua aturan ini akan mengakibatkan kegagalan internal mesin editor ProseMirror saat sinkronisasi state teks, memicu crash di browser, atau teks pendamping tidak dapat diketik sama sekali oleh pengguna.
* **Rekomendasi Perbaikan:**
  * Hapus baris `atom: true` pada `MediaTextExtension` untuk memungkinkan ProseMirror mengelola child node secara stabil.

---

### 5. 🟡 [HIGH] Bug Rendering Publik: Tag HTML Mentah Tampil di Layar Pembaca
* **Lokasi File:** 
  * [page.tsx (Public Article Page)](file:///d:/beritakarya/apps/web/app/%5Bsite%5D/artikel/%5Bslug%5D/page.tsx#L525-L662)
* **Masalah:**
  Di editor, format teks tebal, miring, garis bawah, highlighter, dan tautan diubah menjadi HTML tag sederhana (seperti `<strong>tebal</strong>`) di dalam field `content`.
  Namun, pada halaman artikel publik, komponen render `PublicBlock` menampilkan teks secara literal menggunakan ekspresi kurung kurawal biasa React `{block.content}`:
  ```typescript
  case 'paragraph':
    return (
      <p className={bodyTextClass}>
        {block.content}  {/* ⚠️ BUG RENDERING */}
      </p>
    )
  ```
* **Dampak:**
  * Pembaca situs berita akan melihat tag HTML mentah seperti `Ini adalah <strong>berita eksklusif</strong>` tertulis langsung di layar mereka. Seluruh pemformatan teks di situs publik menjadi rusak parah secara visual.
* **Rekomendasi Perbaikan:**
  Karena backend API sudah mengamankan HTML request body menggunakan `DOMPurify` melalui `sanitizeMiddleware` (sangat aman dari XSS), frontend dapat dengan aman menggunakan atribut `dangerouslySetInnerHTML` untuk merender paragraf dan heading:
  ```typescript
  case 'paragraph':
    return (
      <p 
        className={bodyTextClass} 
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    )
  ```

---

### 6. 🟡 [HIGH] Seluruh Custom Tiptap Extensions Mati (Tidak Terregistrasi)
* **Lokasi File:** 
  * [TiptapEditor.tsx](file:///d:/beritakarya/apps/web/components/editor/TiptapEditor.tsx#L50-L92)
* **Masalah:**
  Monorepo ini memiliki berbagai extension custom kaya fitur yang sudah dibuat di folder `./extensions` (`CalloutExtension`, `EmbedExtension`, `QuoteExtension`, `GalleryExtension`, `ImageGridExtension`, `MediaTextExtension`). Namun, **tidak ada satu pun** dari ekstensi tersebut yang dimasukkan ke dalam array `extensions` pada inisialisasi `useEditor` di `TiptapEditor.tsx`!
* **Dampak:**
  * Seluruh fitur editor premium ini lumpuh total. ProseMirror akan otomatis menolak dan membuang tag-tag blok kaya ini dari skema dokumen karena dianggap tidak valid. Perintah insert block dari menu slash/floating juga akan gagal total.
* **Rekomendasi Perbaikan:**
  Import ekstensi tersebut dan daftarkan ke instansiasi `useEditor`:
  ```typescript
  import { CalloutExtension } from './extensions/CalloutExtension'
  import { EmbedExtension } from './extensions/EmbedExtension'
  // ...
  const editor = useEditor({
    extensions: [
      StarterKit.configure(...),
      CalloutExtension,
      EmbedExtension,
      // ... daftarkan semua
    ]
  })
  ```

---

### 7. 🟡 [HIGH] Arsitektur Sinkronisasi Multi-Store Zustand yang Rapuh dan Lambat (Performance Overhead & Sync Bug)
* **Lokasi File:**
  * [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts#L491-L523)
  * [editorFacade.ts](file:///d:/beritakarya/apps/web/store/editorFacade.ts)
* **Masalah:**
  1. Frontend memecah state editor ke dalam 5 instance store Zustand global terpisah (`editorStore`, `editorDocumentStore`, `editorUiStore`, `editorWorkflowStore`, `editorSessionStore`).
  2. Untuk menjaga sinkronisasi, terpasang listener `useEditorStore.subscribe` yang memaksa pembaruan synchronous ke 4 store slices lainnya pada **setiap pengetikan keystroke**:
     ```typescript
     useEditorStore.subscribe((state) => {
       syncLegacyEditorStateToSlices(state) // Memicu setState synchronous pada 4 store lainnya!
     })
     ```
  3. **Desinkronisasi Dua Arah:** Store-store slice di atas mendefinisikan *actions*-nya sendiri secara lokal (seperti `setTitle` di `editorDocumentStore`). Jika ada komponen memanggil action di slice ini secara langsung, state slice akan terupdate tetapi **tidak pernah disinkronkan kembali** ke legacy `useEditorStore`. Ketika terjadi keystroke berikutnya di editor, legacy store yang memiliki state lama akan menimpa kembali state slice tersebut.
* **Dampak:**
  * **Penurunan Performa Berat:** Mengetik satu karakter memicu re-render berantai di seluruh aplikasi karena 5 store terpisah mengumumkan perubahan state secara independen.
  * **Ketidakstabilan Data:** Data rentan hilang atau ter-overwrite oleh state lama ketika memanggil action dari store slice.
* **Rekomendasi Perbaikan:**
  * Hapus 4 store slice tiruan tersebut dan gunakan satu store Zustand tunggal `useEditorStore` sebagai *Single Source of Truth*. Jika ingin membagi kode, gunakan Zustand `slices pattern` resmi yang digabungkan dalam satu `createStore` tunggal, bukan membuat multi-instance store global.

---

### 8. 🟡 [HIGH] AI SEO Audit Terisolasi (Kehilangan Sinkronisasi Dokumen Real-Time)
* **Lokasi File:** 
  * [SEOAuditTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/tabs/SEOAuditTab.tsx#L8-L11)
* **Masalah:**
  Komponen `SEOAuditTab` mendefinisikan state lokal sendiri untuk `title`, `metaTitle`, dan `metaDescription` alih-alih mengambil nilai dinamis dari `useEditorStore`:
  ```typescript
  // ⚠️ State lokal terisolasi
  const [title, setTitle] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  ```
* **Dampak:**
  * Ketika pengguna menulis judul artikel di kanvas utama atau mengedit Meta Title di tab SEO utama, panel SEO Audit tetap **kosong melompong**. Pengguna dipaksa mengetik ulang atau menyalin ulang data dokumen mereka ke input SEO Audit secara manual untuk memeriksa kecocokan kata kunci, yang merusak alur kerja penulis.
* **Rekomendasi Perbaikan:**
  Hubungkan komponen ini langsung ke store global `useEditorStore` seperti halnya komponen `SEOPanel` dan hapus state lokal tersebut untuk validasi SEO real-time!

---

### 9. 🟡 [HIGH] Isolasi Input Data AI pada Tab Optimize dan Validate
* **Lokasi File:**
  * [OptimizeTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/tabs/OptimizeTab.tsx#L12-L13)
  * [ValidateTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/tabs/ValidateTab.tsx#L12)
* **Masalah:**
  Sama seperti tab SEO Audit, komponen asisten AI `OptimizeTab` dan `ValidateTab` mendefinisikan state lokal kosong `useState('')` untuk `title`, `excerpt`, dan pemeriksaan teks tata bahasa.
* **Dampak:**
  * Penulis dipaksa menyalin judul artikel atau kutipan teks yang baru saja mereka ketik di kanvas utama lalu menempelkannya kembali secara manual ke input panel AI untuk mendapatkan saran Headline, SEO, atau validasi tata bahasa. Ini adalah pengalaman pengguna (UX) yang sangat buruk.
* **Rekomendasi Perbaikan:**
  * Populasi field input tersebut secara dinamis dengan menarik judul, excerpt, dan konten teks aktif dari `useEditorStore` secara real-time. Berikan tombol cepat "Gunakan teks dokumen saat ini".

---

### 10. 🟢 [MEDIUM] Dropdown Status Alur Kerja (Workflow) Hanya Hiasan
* **Lokasi File:** 
  * [EditorTopbar.tsx](file:///d:/beritakarya/apps/web/components/editor/EditorTopbar.tsx#L86-L89)
* **Masalah:**
  Tombol dropdown status alur kerja (seperti berpindah dari Draft → Submitted) menampilkan seluruh opsi, tetapi penanganan klik tombol menu tersebut hanya menutup menu tanpa memicu mutasi status dokumen:
  ```typescript
  onClick={() => {
    // ⚠️ Kosong, tidak ada aksi perubahan status!
    setShowStatusMenu(false)
  }}
  ```
* **Dampak:**
  * Pengguna tidak bisa mengubah status artikel secara manual dari bar navigasi editor.
* **Rekomendasi Perbaikan:**
  Panggil fungsi pemutasi dari store secara langsung: `updateArticleStatus(s)` lalu tutup menu.

---

### 11. 🟢 [MEDIUM] Menu Melayang Melanggar Prinsip UI (Glitch Posisi & Tersembunyi)
* **Lokasi File:** 
  * [FloatingMenu.tsx](file:///d:/beritakarya/apps/web/components/editor/menus/FloatingMenu.tsx#L128)
  * [BubbleMenuBar.tsx](file:///d:/beritakarya/apps/web/components/editor/menus/BubbleMenuBar.tsx#L74)
* **Masalah:**
  1. Menu melayang dihitung menggunakan koordinat koordinasi mentah ProseMirror dan diberi posisi `fixed`. Karena letaknya `fixed`, menu ini **tidak mendengarkan event scroll kontainer**. Jika editor di-scroll ke bawah, menu melayang akan tetap diam menggantung kaku di layar.
  2. `FloatingMenuBar` memiliki style kelas `opacity-0 hover:opacity-100 transition-opacity` yang secara default membuatnya **100% transparan (invisible)**! Pengguna tidak akan pernah tahu menu itu ada kecuali mereka secara tidak sengaja mengarahkan mouse tepat di atas koordinat baris kosong tersebut.
* **Dampak:**
  * Pengalaman pengguna (UX) terganggu oleh menu yang tertinggal saat scroll, serta fitur menu melayang yang tersembunyi secara permanen dari pandangan pengguna.
* **Rekomendasi Perbaikan:**
  Hapus perhitungan koordinat manual yang rawan bug ini. Gunakan komponen pembungkus resmi bawaan tiptap React yang sangat stabil: `<BubbleMenu editor={editor}>` dan `<FloatingMenu editor={editor}>`.

---

### 12. 🟢 [MEDIUM] Tombol Gambar Toolbar Mengabaikan Media Library Utama
* **Lokasi File:** 
  * [TiptapEditorToolbar.tsx](file:///d:/beritakarya/apps/web/components/editor/TiptapEditorToolbar.tsx#L52-L57)
* **Masalah:**
  Tombol insert gambar pada toolbar utama editor menggunakan dialog bawaan browser yang sangat kuno untuk meminta input URL gambar mentah:
  ```typescript
  const addImage = () => {
    const url = window.prompt('Masukkan URL gambar:') // ⚠️ BYPASS MEDIA LIBRARY
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }
  ```
* **Dampak:**
  * Mengharuskan pengguna meng-upload gambar di tempat lain, menyalin URL-nya secara manual, dan menempelkannya ke kotak dialog. Padahal, monorepo ini memiliki komponen `MediaLibraryModal` yang luar biasa canggih.
* **Rekomendasi Perbaikan:**
  Integrasikan state `MediaLibraryModal` di dalam komponen editor dan gunakan modal tersebut untuk tombol gambar toolbar, mirip dengan implementasi di menu slash.

---

### 13. 🟢 [MEDIUM] Anti-Pattern Update State React Saat Proses Render
* **Lokasi File:** 
  * [ImageTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/tabs/ImageTab.tsx#L23-L30)
* **Masalah:**
  Komponen secara langsung melakukan perubahan state menggunakan fungsi *setter state* di dalam tubuh render utama komponen:
  ```typescript
  if (captionState.result && !captionState.loading) {
    if (captionState.result.altText !== altText) {
      setAltText(captionState.result.altText) // ⚠️ ANTI-PATTERN REACT
    }
    // ...
  }
  ```
* **Dampak:**
  * React akan langsung memicu re-render darurat di tengah-tengah siklus render yang sedang berjalan. Hal ini merusak diagram siklus hidup React dan berpotensi memicu error fatal: *"Too many re-renders. React limits the number of renders to prevent an infinite loop."*
* **Rekomendasi Perbaikan:**
  Bungkus pemutakhiran state tersebut dengan `useEffect` untuk mematuhi siklus hidup React.

---

### 14. 🔵 [LOW] Duplikasi Logika Sinkronisasi Tiptap (Kode Mati)
* **Lokasi File:**
  * [useTiptapSync.ts](file:///d:/beritakarya/apps/web/components/editor/hooks/useTiptapSync.ts)
* **Masalah:**
  File ini berisi replika logika konversi blok yang sudah ditangani secara native di dalam file editor utama dan store. File ini tidak diimpor atau dipanggil oleh komponen mana pun di frontend.
* **Dampak:**
  * Menambah beban pemeliharaan kode (*maintenance overhead*) dan berisiko membingungkan pengembang baru.
* **Rekomendasi Perbaikan:**
  * Hapus file `useTiptapSync.ts` dengan aman dari codebase.

---

### 15. 🔵 [LOW / UI] Inkonsistensi Visual Ikon Statistik "Images"
* **Lokasi File:**
  * [TabContent.tsx](file:///d:/beritakarya/apps/web/components/editor/tabs/TabContent.tsx#L63)
* **Masalah:**
  Pada statistik panel samping dokumen, entri jumlah gambar ("Images") menggunakan representasi ikon `FileText` alih-alih `Image` atau `FileImage`:
  ```typescript
  <div className="flex justify-between text-sm">
    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
      <FileText size={14} /> {/* ⚠️ IKON SALAH */}
      Images
    </span>
    <span className="font-bold">{imageCount}</span>
  </div>
  ```
* **Dampak:**
  * Ketidaknyamanan visual (UX minor) yang mengurangi tingkat profesionalisme antarmuka.
* **Rekomendasi Perbaikan:**
  * Ganti `FileText` dengan ikon `Image` atau `FileImage` dari pustaka ikon `lucide-react`.

---

## 🏗️ REKOMENDASI ARSITEKTUR STRATEGIS JANGKA PANJANG

1. **Konsolidasi Single Source of Truth (Zustand):**
   Satukan kelima store global Zustand yang terfragmentasi saat ini ke dalam satu rancangan terpadu menggunakan *Zustand Slice Pattern* resmi. Ini akan menghilangkan kebutuhan sinkronisasi manual `.subscribe` yang merusak performa pengetikan dan mencegah risiko desinkronisasi dua arah.
   
2. **Optimasi Autosave Debouncing:**
   Saat ini, pengetikan memicu konversi struktur data blok secara synchronous pada setiap ketukan keystroke. Sebaiknya pertahankan dokumen sebagai string HTML/JSON ProseMirror mentah saat pengetikan berlangsung, dan lakukan debouncing penyimpanan ke backend (misalnya, autosave hanya berjalan setelah pengguna berhenti mengetik selama 5 detik). Konversi data terperinci ke dalam model blok database sebaiknya ditangani sepenuhnya di backend saat penyimpanan akhir dilakukan.

3. **Pendaftaran dan Aktivasi Custom Extensions:**
   Segera daftarkan seluruh ekstensi kaya visual (`Callout`, `Quote`, `Embed`, `Gallery`, `ImageGrid`, `MediaText`) ke dalam konfigurasi editor utama. Tanpa ini, sistem tidak akan mengenali dokumen interaktif premium yang dibuat oleh penulis.

---

**Laporan Audit Disusun Oleh:**  
*Senior Website Auditor & Architect Team* (Antigravity AI Agent)

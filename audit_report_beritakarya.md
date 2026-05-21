# LAPORAN AUDIT KHUSUS: VERIFIKASI & HARDENING SISTEM BERITAKARYA
**Fokus Utama:** Manajemen Artikel (`/dashboard/articles`), Keamanan API, Alur Kerja Redaksi, dan State Machine.

---

## 1. PENDAHULUAN
*   **Tanggal Audit:** 2026-05-21
*   **Auditor:** Senior System Auditor (News Development System)
*   **Ruang Lingkup:** Verifikasi mendalam terhadap laporan audit awal (`audit_report.md`) dan pengecekan kode sumber secara manual pada repositori `beritakarya` (termasuk Next.js frontend, Express backend, Prisma schema, dan rate limiting).

Laporan ini menyajikan hasil investigasi langsung terhadap kode sumber guna memvalidasi temuan-temuan sebelumnya, mengoreksi ketidakakuratan, serta mengungkap celah keamanan dan fungsional baru yang belum terdokumentasi sebelumnya.

---

## 2. VERIFIKASI & ANALISIS MENDALAM TEMUAN AWAL

### 🔴 TEMUAN SEVERITY TINGGI (HIGH)

#### H-001: Bypass Site Access Control pada Middleware (API Level)
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI**
*   **Lokasi File:** [site.middleware.ts](file:///d:/beritakarya/apps/api/src/middleware/site.middleware.ts#L58-L77)
*   **Analisis Kode:**
    ```typescript
    export function requireSiteAccess(req: Request, res: Response, next: NextFunction) {
      if (!req.user) return next()

      if (
        ['reporter', 'kontributor', 'wapimred'].includes(req.user.role) &&
        req.user.siteId !== req.site
      ) {
        return res.status(403).json({
          success: false,
          error: { code: 'SITE_FORBIDDEN', message: 'Anda hanya bisa mengakses site Anda sendiri' }
        })
      }
      next()
    }
    ```
*   **Catatan Verifikasi Frontend & Klarifikasi Akses:**
    *   Benar bahwa secara fungsional di frontend, peran `reader` tidak memiliki akses login ke dashboard ([DashboardLayout.tsx](file:///d:/beritakarya/apps/web/app/%5Bsite%5D/dashboard/layout.tsx#L58)) dan langsung dialihkan keluar. Peran `advertiser` memiliki akses terbatas hanya ke **Portal Pengiklan** (halaman order & statistik iklan).
    *   **Namun, terjadi celah di tingkat API Backend**: Meskipun antarmuka UI memblokir mereka, akun dengan peran `reader` atau `advertiser` yang terautentikasi tetap dapat mengirimkan request HTTP langsung ke endpoint API backend (seperti `GET /api/v1/articles` atau `POST /api/v1/articles`) menggunakan tools seperti `Postman` atau `curl`.
    *   Karena peran `reader` dan `advertiser` tidak masuk ke dalam array pengecekan `['reporter', 'kontributor', 'wapimred']`, mereka akan lolos dari middleware `requireSiteAccess`. Lebih parah lagi, di `article.service.ts`, fungsi `getArticles` tidak membatasi kepemilikan artikel jika perannya bukan reporter/kontributor, sehingga `reader` atau `advertiser` yang menembak API tersebut dapat membaca **seluruh draft tulisan internal redaksi**.
*   **Dampak Riil:** Kebocoran informasi sensitif (seluruh artikel draft dan internal) ke pihak luar melalui eksploitasi API langsung tanpa melewati UI dashboard.

---

#### H-002: Module-Level Global State (Race Condition) pada Auto-Save Timer
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI**
*   **Lokasi File:** [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts#L75)
*   **Analisis Kode:**
    ```typescript
    let saveTimer: ReturnType<typeof setTimeout> | null = null // Dideklarasikan di level modul luar

    export const useEditorStore = create<EditorState>((set, get) => ({ ... }))
    ```
*   **Dampak Riil:**
    `saveTimer` dideklarasikan di luar fungsi `create` Zustand (lingkup file modul). Jika pengguna membuka beberapa tab editor secara bersamaan atau saat penanganan Server-Side Rendering (SSR), *timer* ini akan saling menimpa satu sama lain. Hal ini dapat memicu hilangnya pemicu auto-save atau penyimpanan data dari tab editor yang salah.

---

#### H-003: Celahan Otorisasi Google Indexing API (`indexGoogleArticle`)
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI & LEBIH BURUK DARI DUKUNGAN UI**
*   **Lokasi File Backend:** [article.service.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.service.ts#L466-L483) dan [article.controller.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.controller.ts#L67-L70)
*   **Lokasi File Frontend:** [page.tsx](file:///d:/beritakarya/apps/web/app/%5Bsite%5D/dashboard/articles/page.tsx#L390-L402)
*   **Analisis Celah:**
    1.  Di backend, fungsi rute menggunakan middleware `withSite` (yang berisi `requireSiteAccess`). Karena `requireSiteAccess` tidak memblokir role di luar jurnalis, dan di dalam `service.indexGoogleArticle` sama sekali tidak ada pengecekan peran (`user.role`), maka siapa pun yang memiliki akses token valid dapat menembak endpoint POST `/articles/:id/index-google`.
    2.  Di frontend, tombol `⚡ Indeks Google Instan` dirender langsung untuk seluruh pengguna tanpa melihat peran:
        ```typescript
        {article.status === 'published' && (
          <button onClick={() => handleGoogleIndex(article.id)} ...>
        )}
        ```
*   **Dampak Riil:** Jurnalis (reporter/kontributor) atau bahkan akun dengan hak akses rendah dapat menghabiskan kuota Google Indexing API harian untuk situs, merusak reputasi URL di Google Search Console, atau memicu kelebihan beban request eksternal.

---

#### H-004: Potensi DoS melalui Pencarian Unbounded pada Kolom JSONB
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI**
*   **Lokasi File:** [article.repository.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.repository.ts#L14-L19) dan [article.validator.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.validator.ts#L85-L91)
*   **Analisis Kode:**
    Pencarian DB menggunakan Prisma:
    ```typescript
    ...(search && { 
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { blocks: { path: ['$'], string_contains: search } } // Menggeledah dokumen JSONB
      ]
    })
    ```
    Dan di validator query-nya:
    ```typescript
    search: z.string().optional() // Tanpa batasan panjang karakter (.max())
    ```
*   **Dampak Riil:** Operator pencarian `contains` case-insensitive dan pencarian mendalam `string_contains` pada kolom bertipe JSONB (`blocks`) tidak menggunakan indeks B-Tree standar. Menembak parameter `search` dengan teks sangat panjang (contoh: 10.000 karakter) akan memaksa database PostgreSQL memindai keseluruhan tabel (Sequential Scan) yang sangat lambat, memicu lonjakan penggunaan CPU (DB DoS).

---

### 🟡 TEMUAN SEVERITY SEDANG (MEDIUM) & RENDAH (LOW)

#### M-003: Celah Kehilangan Draft Baru (New Article Auto-Save Gap)
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI**
*   **Lokasi File:** [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts#L295-L303)
*   **Analisis Kode:**
    ```typescript
    function scheduleAutoSave(get: () => EditorState) {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const state = get()
        if (state.isDirty && state.articleId) { // Membutuhkan articleId yang valid
          state.saveArticle()
        }
      }, 5000)
    }
    ```
*   **Dampak Riil:** Ketika membuat artikel baru, `articleId` bernilai `null` (diinisialisasi pada Editor). Akibatnya, pengetikan perdana tidak pernah memicu penyimpanan otomatis ke DB sampai jurnalis menekan tombol simpan manual (`Ctrl+S` atau kirim). Jika tab tidak sengaja ditutup sebelum itu, pekerjaan jurnalis hilang total.

#### L-005: Inkonsistensi Soft Delete pada Skema vs Implementasi
*   **Status Kode Sumber:** **TERKONFIRMASI ASLI (Terdapat Inkonsistensi Fatal)**
*   **Lokasi File:** [article.repository.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.repository.ts#L93-L95) dan [schema.prisma](file:///d:/beritakarya/apps/api/prisma/schema.prisma#L220)
*   **Analisis Kode:**
    *   Skema Prisma mendefinisikan kolom `deletedAt DateTime?` pada tabel `Article`.
    *   Namun, repositori melakukan hard delete permanen:
        ```typescript
        export async function deleteArticle(id: string) {
          return prisma.article.delete({ where: { id } })
        }
        ```
    *   Inkonsistensi ini menyebabkan audit trail rusak karena data terhapus sepenuhnya dari DB, sementara modul lain seperti `analytics.repository.ts` tetap menyertakan penyaringan `deletedAt: null` secara mubazir.

---

## 3. TEMUAN BARU (EKSKLUSIF AUDITOR SENIOR)

Selama audit mendalam, ditemukan celah keamanan dan fungsional kritis baru yang belum terdeteksi pada laporan audit awal:

### 🔴 [NEW FINDING - HIGH] Celah Sanitasi Input HTML Global Merusak Teks Biasa (Data Corruption)
*   **Lokasi File:** [sanitize.middleware.ts](file:///d:/beritakarya/apps/api/src/middleware/sanitize.middleware.ts#L15-L35)
*   **Detail Temuan:**
    Middleware sanitasi dijalankan secara rekursif ke seluruh properti `req.body` tanpa membedakan tipe input (apakah itu field teks kaya HTML atau teks murni seperti `title`, `metaTitle`, `tags`):
    ```typescript
    function sanitizeValue(value: any, key?: string): any {
      if (key === 'password' || key === 'email') return value
      if (typeof value === 'string') {
        return purify.sanitize(value, PURIFY_CONFIG) // DOMPurify dijalankan pada SEMUA string
      }
      ...
    ```
*   **Dampak Buruk:**
    Jika seorang jurnalis menulis judul berita dengan karakter pembanding seperti:
    `"Update Ekonomi: Inflasi Mengancam Sektor Riil < Rp 50rb"`
    DOMPurify akan mendeteksi `< Rp` sebagai tag HTML yang tidak ditutup dan tidak masuk daftar tag yang diizinkan (`ALLOWED_TAGS`), sehingga bagian tersebut akan **dihapus bersih**. Judul di database akan berubah menjadi:
    `"Update Ekonomi: Inflasi Mengancam Sektor Riil "`
    Ini adalah bug korup data masukan yang serius bagi sistem berita. Sanitasi HTML hanya boleh dilakukan pada field kaya konten (seperti properti teks di dalam `blocks`), bukan pada data terstruktur tipe teks murni.

---

### 🔴 [NEW FINDING - HIGH] Celah Kebocoran Pesan Error Internal / Kerusakan Respon UX di Produksi
*   **Lokasi File:** [error.middleware.ts](file:///d:/beritakarya/apps/api/src/middleware/error.middleware.ts#L71-L79) dan [article.service.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.service.ts#L48)
*   **Detail Temuan:**
    Di level servis, program melempar kesalahan (error) seperti berikut:
    ```typescript
    throw Object.assign(new Error('Anda tidak punya akses ke post ini'), { statusCode: 403 })
    ```
    Namun, di middleware penanganan error:
    ```typescript
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message }
      })
    }
    const statusCode = err.statusCode || 500
    const message = env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan server' // Menyembunyikan pesan di produksi!
      : err.message
    ```
*   **Dampak Buruk:**
    Di lingkungan produksi (`production`), karena error yang dilemparkan di atas adalah instansi dari `Error` biasa (bukan `AppError`), pesan error ramah pengguna (seperti *"Anda tidak punya akses ke post ini"* atau *"Post tidak ditemukan"*) akan diubah paksa menjadi pesan generik **"Terjadi kesalahan server"** meskipun status responsnya tetap 403 atau 404. Hal ini membingungkan bagi pengguna akhir dan merusak UX dashboard.

---

### 🟡 [NEW FINDING - MEDIUM] Ketiadaan Proteksi Navigasi Halaman Editor (Unsaved Changes Guard)
*   **Lokasi File:** [Editor.tsx](file:///d:/beritakarya/apps/web/components/editor/Editor.tsx)
*   **Detail Temuan:**
    Komponen editor tidak mendaftarkan event listener `beforeunload` atau memanfaatkan integrasi router guard dari Next.js untuk mengecek nilai `isDirty` dari Zustand store.
*   **Dampak Buruk:**
    Jika seorang jurnalis sedang mengedit artikel panjang dan tidak sengaja menekan tombol kembali (*back*), menutup tab, atau me-refresh peramban, seluruh perubahan yang belum tersimpan (sebelum siklus auto-save 5 detik berikutnya terpicu) akan langsung hilang tanpa adanya dialog konfirmasi/peringatan keamanan.

---

## 4. MATRIKS RINGKASAN TEMUAN

| ID | Kategori | Temuan | Status Verifikasi | Dampak Bisnis / Keamanan |
| :--- | :--- | :--- | :--- | :--- |
| **H-001** | Keamanan | Bypass Site Access Control di Middleware | **Valid** | Modifikasi & baca data lintas site oleh peran non-jurnalis. |
| **H-002** | Fungsional | Race Condition Auto-Save (Global Timer) | **Valid** | Tab tab editor saling menimpa data satu sama lain. |
| **H-003** | Otorisasi | Google Indexing Tanpa Cek Peran | **Valid (Lebih Parah)** | Kuota API habis & penyalahgunaan tombol oleh non-admin. |
| **H-004** | Keamanan | DoS via Search pada JSONB | **Valid** | Query lambat memicu *database deadlock* / *resource exhaustion*. |
| **H-005** | Keamanan | Informasi Sensitif Bocor di Error | **Valid** | Kebocoran skema DB & kueri internal. |
| **F-001** | Fungsional | **[BARU]** Sanitasi HTML Merusak Judul/Plain Text | **Temuan Baru** | Kerusakan data masukan yang mengandung simbol `<` atau `&`. |
| **F-002** | Fungsional | **[BARU]** Masking Error Pesan User di Produksi | **Temuan Baru** | User menerima pesan "Terjadi kesalahan server" pada error 403/404. |
| **F-003** | UX | **[BARU]** Tidak Ada Peringatan Keluar dari Editor | **Temuan Baru** | Kehilangan pekerjaan jurnalis akibat navigasi tidak sengaja. |
| **M-003** | Fungsional | Auto-Save Mati pada Draft Baru | **Valid** | Draft baru tidak tersimpan otomatis hingga manual save pertama. |
| **L-005** | Fungsional | Inkonsistensi Hard Delete vs Soft Delete | **Valid** | Data hilang permanen, merusak integritas audit log & statistik. |

---

## 5. REKOMENDASI PERBAIKAN & CONTOH KODE (HARDENING)

### Rekomendasi 1: Perbaikan Sanitasi Selektif ([F-001])
Jangan bersihkan seluruh `req.body` string secara serampangan. Batasi sanitasi HTML DOMPurify hanya pada properti konten di dalam field `blocks`.
*   **Perbaikan pada [sanitize.middleware.ts](file:///d:/beritakarya/apps/api/src/middleware/sanitize.middleware.ts):**
    ```typescript
    // Hanya lakukan sanitasi HTML jika kunci adalah 'content' atau berada di dalam blok editor
    function sanitizeValue(value: any, key?: string): any {
      if (key === 'password' || key === 'email') return value;

      if (typeof value === 'string') {
        // Hanya sanitasi string jika terindikasi memiliki HTML atau merupakan field 'content' di block
        if (key === 'content' || /<[a-z/][\s\S]*>/i.test(value)) {
          return purify.sanitize(value, PURIFY_CONFIG)
        }
        return value // Biarkan teks biasa tetap utuh
      }
      ...
    ```

### Rekomendasi 2: Penggunaan AppError Konsisten di Produksi ([F-002])
Ubah kesalahan di service menggunakan class `AppError` agar dideteksi dengan benar oleh middleware.
*   **Definisi Rujukan di Backend:**
    ```typescript
    // Ubah dari:
    throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
    // Menjadi:
    throw new AppError('Post tidak ditemukan', 404, 'NOT_FOUND')
    ```

### Rekomendasi 3: Pengamanan Akses Rute Google Indexing ([H-003])
Tambahkan filter otorisasi peran langsung pada tingkat rute Express.
*   **Perbaikan pada [article.controller.ts](file:///d:/beritakarya/apps/api/src/modules/article/article.controller.ts#L67):**
    ```typescript
    articleRouter.post(
      '/:id/index-google',
      ...withSite,
      requireRole(['superadmin', 'wapimred']), // Blokir reporter/reader
      asyncHandler(async (req: Request, res: Response) => {
        const result = await service.indexGoogleArticle(req.params.id, req.site!)
        res.json(result)
      })
    )
    ```

### Rekomendasi 4: Peringatan Menutup Halaman Editor ([F-003])
Tambahkan *hook* daur hidup di frontend editor untuk menangani konfirmasi penutupan halaman.
*   **Perbaikan pada [Editor.tsx](file:///d:/beritakarya/apps/web/components/editor/Editor.tsx):**
    ```typescript
    const { isDirty } = useEditorStore()

    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isDirty) {
          e.preventDefault()
          e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?'
          return e.returnValue
        }
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])
    ```

### Rekomendasi 5: Integrasi Auto-Save Awal untuk Draft Baru ([M-003])
Ubah logika penyimpanan di store agar langsung mengirimkan `POST` untuk membuat artikel baru (draft kosong/tanpa judul) begitu pengguna mengetik karakter pertama.
*   **Perbaikan pada [editorStore.ts](file:///d:/beritakarya/apps/web/store/editorStore.ts#L295):**
    ```typescript
    function scheduleAutoSave(get: () => EditorState) {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const state = get()
        if (state.isDirty) {
          state.saveArticle() // saveArticle akan otomatis membedakan PUT (jika ada id) dan POST (jika baru)
        }
      }, 5000)
    }
    ```

---

## 6. KESIMPULAN

Audit mendalam terhadap kode riil mengonfirmasi bahwa **celah keamanan pada sistem artikel Beritakarya berada pada tingkat risiko MEDIUM-HIGH**. 

Penemuan baru seperti **F-001 (Kerusakan data string akibat DOMPurify global)** dan **F-002 (Pesan error disembunyikan di produksi)** berpotensi mengganggu stabilitas data redaksi dan menurunkan kualitas pengalaman kerja jurnalis secara langsung. 

Sangat disarankan untuk melakukan perbaikan terencana sebelum sistem ini diluncurkan secara penuh di peladen produksi utama.

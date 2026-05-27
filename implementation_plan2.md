# Rencana Implementasi: Galeri Media di Editor Artikel (Deduplikasi Aset)

Mencegah pengunggahan gambar berulang dengan menyediakan fitur **Galeri Media / Pustaka Media** di dalam editor artikel. Pengguna dapat memilih gambar yang sudah pernah diunggah sebelumnya tanpa harus mengunggah ulang file yang sama.

## Latar Belakang & Analisis Codebase

Setelah memeriksa semua komponen editor, ditemukan bahwa **ada 5 titik upload gambar berbeda** dalam project ini yang semuanya hanya mendukung upload file baru dan belum terintegrasi ke galeri media:

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `ImageBlock` | `editor/blocks/ImageBlock.tsx` | Blok gambar tunggal dalam konten artikel |
| `GalleryBlock` | `editor/blocks/GalleryBlock.tsx` | Blok galeri foto (multi-gambar, horizontal scroll) |
| `ImageGridBlock` | `editor/blocks/ImageGridBlock.tsx` | Blok grid gambar 2 atau 3 kolom |
| `MediaTextBlock` | `editor/blocks/MediaTextBlock.tsx` | Blok gambar berdampingan teks editorial |
| `FeaturedImageSection` | `editor/inspector/FeaturedImageSection.tsx` | Gambar Utama artikel (sidebar editorial) |

Semua komponen di atas memanggil `api.post('/media/upload', ...)` secara langsung tanpa opsi "Pilih dari Galeri".

---

## User Review Required

> [!IMPORTANT]
> **Kebijakan Hak Akses Media di Galeri:**
> Rencana ini membatasi role **Reporter** dan **Kontributor** untuk hanya melihat dan memilih gambar yang **mereka unggah sendiri** (`userId === currentUserId`). Role **Wapimred** dan **Superadmin** dapat melihat seluruh gambar yang diunggah di situs tersebut. Apakah batasan ini sesuai, atau Anda ingin agar reporter dapat berbagi perpustakaan gambar sesama anggota redaksi di wilayah yang sama?

## Open Questions

> [!NOTE]
> **Deduplikasi Backend (Opsional / Fase 2):** Apakah kita perlu menambahkan pengecekan konten file via hash SHA-256 saat upload baru, sehingga sistem otomatis menunjuk berkas lama jika isinya sama persis? Rekomendasi saat ini: **tidak perlu di Fase 1** — cukup andalkan pemilihan manual dari Galeri Media di sisi pengguna untuk menjaga kesederhanaan dan tidak mengubah skema database.

---

## Proposed Changes

### [Backend API]

---

#### [MODIFY] [media.repository.ts](file:///d:/beritakarya/apps/api/src/modules/media/media.repository.ts)

Tambahkan parameter opsional `userId` pada fungsi `findMediaBySite` untuk memfilter media milik pengguna tertentu (kontributor/reporter):

```typescript
export async function findMediaBySite(
  siteId: string, 
  page: number = 1, 
  limit: number = 30,
  userId?: string // NEW — filter by owner for reporter/kontributor
) {
  const where: any = { siteId }
  if (userId) {
    where.userId = userId
  }
  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.media.count({ where })
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}
```

---

#### [MODIFY] [media.controller.ts](file:///d:/beritakarya/apps/api/src/modules/media/media.controller.ts)

Pada endpoint `GET /api/v1/media`, tambahkan logika filter role-based:
- **reporter** & **kontributor** → paksa `userId = req.user.userId` (hanya media milik sendiri)
- **wapimred** & **superadmin** → tidak ada filter `userId` (bisa lihat semua media di situs)

```typescript
mediaRouter.get(
  '/',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100)
    
    // Role-based isolation: reporter/kontributor only see their own media
    const restrictedRoles = ['reporter', 'kontributor']
    const userId = restrictedRoles.includes(req.user!.role)
      ? req.user!.userId
      : undefined
    
    const result = await repo.findMediaBySite(req.site!, page, limit, userId)
    res.json({ success: true, data: result })
  })
)
```

---

### [Frontend Web App]

---

#### [NEW] `components/editor/MediaLibraryModal.tsx`

Komponen modal **reusable** yang dapat digunakan oleh semua blok gambar dan FeaturedImageSection. Spesifikasi:

- **Input props:**
  - `isOpen: boolean` — kontrol visibilitas modal
  - `onClose: () => void` — callback untuk menutup modal
  - `onSelect: (media: MediaItem) => void` — callback saat gambar dipilih
  - `allowMultiple?: boolean` — opsional untuk GalleryBlock/ImageGridBlock (pilih banyak)
  
- **Fitur di dalam modal:**
  - Grid gambar (responsif 3-5 kolom) dengan thumbnail dan ukuran file
  - Kolom pencarian real-time berdasarkan alt text/nama
  - Filter format (JPG, PNG, WebP)
  - Paginasi (tombol "Muat Lebih Banyak" / infinite scroll)
  - Preview gambar terpilih dengan metadata (dimensi, ukuran, caption, credit)
  - Tombol **"Pilih Gambar"** atau **"Pilih X Gambar"** (mode multi)
  - Tab **"Upload Baru"** sebagai alternatif dari dalam modal yang sama
  - Animasi Framer Motion (masuk/keluar modal, hover thumbnail)
  - Mendukung dark mode

- **Manajemen state:**
  - Fetch data via `api.get('/media', { params: { limit: 30, page } })`
  - Cache sederhana pada state lokal agar tidak re-fetch saat modal dibuka ulang

---

#### [NEW] `hooks/useMediaLibrary.ts`

Custom React hook untuk logika loading & pagination galeri media, agar bisa digunakan baik oleh `MediaLibraryModal` maupun halaman `dashboard/media/page.tsx`:

```typescript
export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const fetchMedia = async (reset = false) => { ... }
  const loadMore = () => setPage(p => p + 1)
  const refresh = () => fetchMedia(true)
  
  return { items, loading, hasMore, loadMore, refresh }
}
```

---

#### [MODIFY] [ImageBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/ImageBlock.tsx)

- Tambahkan state `isGalleryOpen: boolean`
- Tampilkan dua opsi saat gambar kosong: **"Upload Baru"** (existing) dan tombol **"📁 Pilih dari Galeri"**
- Render `<MediaLibraryModal>` dan pada callback `onSelect`, update blok:
  ```typescript
  updateBlock(block.id, {
    url: media.url,
    alt: media.altText || '',
    width: media.width,
    height: media.height,
    caption: media.caption || '',
    credit: media.credit || ''
  })
  ```
- Juga tambahkan tombol **"Ganti dari Galeri"** pada mode edit (gambar sudah ada)

---

#### [MODIFY] [GalleryBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/GalleryBlock.tsx)

- Tambahkan tombol **"+ Pilih dari Galeri"** di samping tombol "+ Tambah Foto" yang ada.
- `MediaLibraryModal` dibuka dalam mode `allowMultiple={true}` sehingga reporter dapat memilih beberapa gambar sekaligus.
- Pada `onSelect`, setiap gambar terpilih ditambahkan ke `block.images` array:
  ```typescript
  const newItems = selectedMediaList.map(m => ({ url: m.url, alt: m.altText || '' }))
  updateBlock(block.id, { images: [...block.images, ...newItems] })
  ```

---

#### [MODIFY] [ImageGridBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/ImageGridBlock.tsx)

- Di dalam komponen `UploadSlot` atau di level blok, tambahkan opsi "Pilih dari Galeri" selain upload file.
- `MediaLibraryModal` dibuka dengan mode `allowMultiple={false}` (satu gambar per slot).
- Callback `onSelect` meneruskan `ImageItem` ke prop `onFile` yang sudah ada, tanpa memanggil API upload.

---

#### [MODIFY] [MediaTextBlock.tsx](file:///d:/beritakarya/apps/web/components/editor/blocks/MediaTextBlock.tsx)

- Di dalam area drop gambar (bagian kiri blok), tambahkan tombol **"Pilih dari Galeri"** sebagai alternatif upload.
- Ketika gambar dipilih dari galeri, update blok dengan `url`, `alt`, dan `caption` yang ada di media.

---

#### [MODIFY] [FeaturedImageSection.tsx](file:///d:/beritakarya/apps/web/components/editor/inspector/FeaturedImageSection.tsx)

- Di antara tombol **"Upload"** dan tombol **"Hapus"**, tambahkan tombol **"Galeri"**.
- Integrasi `MediaLibraryModal` dengan mode single-select.
- `onSelect` meneruskan `media.url` ke `updateArticleData({ featuredImage: media.url })`.

---

#### [MODIFY] [media/page.tsx](file:///d:/beritakarya/apps/web/app/[site]/dashboard/media/page.tsx)

- Refactor logika fetch media menggunakan hook `useMediaLibrary` yang baru dibuat.
- Pastikan halaman Media Manager ini juga menampilkan gambar sesuai pembatasan role (otomatis karena backend sudah difilter).
- Tambahkan indikator di UI jika user sedang dalam mode "hanya melihat media saya sendiri" (untuk reporter/kontributor).

---

## Urutan Pengerjaan (Prioritas)

```
1. ✅ Backend: media.repository.ts  ← Dasar, tidak ada UI dependency
2. ✅ Backend: media.controller.ts  ← Bergantung pada #1
3. ✅ Frontend: hooks/useMediaLibrary.ts  ← Shared logic, dikerjakan lebih dahulu
4. ✅ Frontend: MediaLibraryModal.tsx  ← Komponen utama (bergantung hook #3)
5. ✅ Frontend: ImageBlock.tsx  ← Integrasi pertama (paling sering dipakai)
6. ✅ Frontend: FeaturedImageSection.tsx  ← Kritis, cover image artikel
7. ✅ Frontend: GalleryBlock.tsx  ← Multi-select mode
8. ✅ Frontend: ImageGridBlock.tsx  ← Slot per gambar
9. ✅ Frontend: MediaTextBlock.tsx  ← Blok campuran
10. ✅ Frontend: media/page.tsx  ← Refactor menggunakan hook baru
```

---

## Verification Plan

### Automated Tests
- Jalankan `pnpm --filter @beritakarya/api test` untuk memverifikasi isolasi data media per role tidak merusak pengujian yang ada.
- Cek apakah ada test file `media.test.ts` yang perlu diperbarui untuk mengakomodasi parameter `userId` baru.

### Manual Verification

**Skenario 1 — Reporter (Isolasi Media)**
1. Login sebagai reporter, unggah 2 gambar.
2. Buka galeri di editor → pastikan **hanya 2 gambar miliknya** yang tampil.
3. Login dengan reporter lain → pastikan gambar reporter pertama **tidak tampil**.

**Skenario 2 — Wapimred (Akses Penuh)**
1. Login sebagai wapimred, buka galeri di editor.
2. Pastikan **semua gambar dari seluruh anggota** di situs tersebut tampil.

**Skenario 3 — Semua Komponen Blok**
1. Di editor artikel, buat blok: `ImageBlock`, `GalleryBlock`, `ImageGridBlock`, `MediaTextBlock`.
2. Pada masing-masing, pastikan tombol **"Pilih dari Galeri"** muncul.
3. Pilih gambar dari galeri → pastikan gambar masuk dengan metadata (tanpa upload baru).
4. Periksa di Dashboard Media → pastikan jumlah total media **tidak bertambah** setelah memilih dari galeri.

**Skenario 4 — Featured Image via Galeri**
1. Di sidebar editorial (Inspector), klik tombol **"Galeri"** pada bagian Gambar Utama.
2. Pilih gambar → pastikan gambar utama artikel berubah tanpa upload baru.

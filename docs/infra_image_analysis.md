# 🔬 Analisis Mendalam: Infrastruktur Image & Blur Placeholder
## Mengapa NewsCard.tsx Menggunakan `<Image>` dari Next.js — Dan Apa yang Hilang

---

## 📖 Ringkasan Folder `infra/`

Setelah membaca seluruh isi folder `infra/`, berikut peta lengkap arsitektur:

```mermaid
graph LR
    subgraph "VPS Production"
        subgraph "Host Level"
            NGINX[Nginx Reverse Proxy<br/>nginx.prod.conf]
            UPLOADS[/opt/beritakarya/uploads/<br/>Bind Mount]
        end
        subgraph "Docker Network"
            API[API Container<br/>Node + Sharp<br/>Port 3001]
            DB[(PostgreSQL 15)]
            REDIS[(Redis 7)]
            MEILI[(MeiliSearch)]
        end
    end
    subgraph "Vercel"
        WEB[Next.js Frontend<br/>Standalone Output]
    end

    USER((Pembaca)) --> NGINX
    USER --> WEB
    NGINX -->|"/api/v1/media/uploads/*"| UPLOADS
    NGINX -->|"/api/*"| API
    API --> DB
    API --> REDIS
    API --> MEILI
    API -->|Sharp: Resize + WebP + Watermark| UPLOADS
    WEB -->|"next/image → api.beritakarya.co"| NGINX
```

---

## 🏗️ Alur Image dari Upload hingga Render

### 1. Upload (Backend — `media.controller.ts`)

Saat jurnalis mengupload gambar, proses berikut terjadi **di API container**:

```
Buffer (JPG/PNG/GIF) 
  → Sharp: Resize max 1920px
  → Sharp: Composite SVG Watermark "BeritaKarya"
  → Sharp: Convert to WebP (quality: 82)
  → Simpan: /uploads/{uuid}.webp

  → Sharp: Resize 400px (thumbnail)
  → Sharp: Convert to WebP (quality: 70)
  → Simpan: /uploads/thumbs/{uuid}_thumb.webp
```

**Output yang disimpan ke database (Prisma):**

| Field | Contoh Value |
|-------|-------------|
| `url` | `https://api.beritakarya.co/api/v1/media/uploads/{uuid}.webp` |
| `thumbUrl` | `https://api.beritakarya.co/api/v1/media/uploads/thumbs/{uuid}_thumb.webp` |
| `width` | `1920` |
| `height` | `1080` |
| `originalFormat` | `jpeg` |

### 2. Serving (Nginx — `nginx.prod.conf`)

```nginx
location /api/v1/media/uploads/ {
    alias /opt/beritakarya/uploads/;   ← Langsung dari disk, bypass API container
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

Image **tidak** melalui API container saat di-serve — Nginx langsung membaca dari filesystem via bind mount `/opt/beritakarya/uploads/`. Ini efisien.

### 3. Render (Frontend — `NewsCard.tsx`)

```tsx
<Image 
  src={imageUrl}     // https://api.beritakarya.co/api/v1/media/uploads/{uuid}.webp
  alt={article.title}
  fill
  className="object-cover ... transition-transform duration-700"
/>
```

---

## 🧠 Mengapa `<Image>` dari Next.js Digunakan — Dan Kenapa Ini **TEPAT**

### Alasan Arsitektural yang Kuat:

| Fitur `next/image` | Relevansi dengan Infra BeritaKarya |
|---------------------|-------------------------------------|
| **Automatic format negotiation** | Browser modern dapat WebP/AVIF, Next.js menangani content negotiation otomatis |
| **Responsive `srcSet` generation** | Satu image `1920px` bisa otomatis di-serve dalam ukuran 640, 750, 828, 1080, 1200 sesuai viewport — **kritis untuk mobile** (70%+ traffic berita) |
| **Lazy loading built-in** | Image di bawah fold tidak diload sampai hampir terlihat — mengurangi initial page weight |
| **Priority loading** | Hero image bisa diberi `priority` agar di-preload di `<head>` — ini sudah dilakukan di `MagazineBentoHero.tsx` |
| **`fill` + `object-cover`** | Layout shift prevention — container sudah punya ukuran fix, image mengisi tanpa CLS |
| **Image optimization proxy** | Next.js secara otomatis me-resize dan compress image melalui `/_next/image?url=...&w=...&q=75` |

### Hubungan dengan `next.config.mjs`:

```js
images: {
    remotePatterns: [
        { protocol: 'https', hostname: 'api.beritakarya.co', pathname: '/api/v1/media/uploads/**' },
        // + localhost variants untuk development
    ],
    unoptimized: false,  // ← Image optimization proxy AKTIF
}
```

`unoptimized: false` berarti **Next.js Image Optimization API aktif**. Setiap `<Image src="https://api.beritakarya.co/...">` sebenarnya di-proxy melalui:

```
/_next/image?url=https%3A%2F%2Fapi.beritakarya.co%2Fapi%2Fv1%2Fmedia%2Fuploads%2F{uuid}.webp&w=1080&q=75
```

Next.js (di Vercel) akan:
1. Fetch image original dari API server
2. Resize ke width yang diminta
3. Convert ke format terbaik (WebP/AVIF)
4. Cache hasilnya
5. Serve ke browser

**Ini sudah pipeline yang baik** — tapi ada satu lubang besar.

---

## 🚨 Masalah Utama: Tidak Ada Blur Placeholder

### Apa yang Terjadi Sekarang:

```
Pembaca buka homepage →
  Container image sudah ada (aspect-video, bg-gray-100) →
  Next.js request image ke /_next/image proxy →
  Proxy fetch dari api.beritakarya.co →
  ... 200ms-2000ms tergantung koneksi ...
  BAM! Gambar muncul tiba-tiba ← ⚡ Mengejutkan mata
```

User melihat **kotak abu-abu kosong** lalu **tiba-tiba** gambar penuh muncul. Tidak ada transisi, tidak ada hint visual tentang apa yang akan muncul.

### Apa yang Seharusnya Terjadi (Blur-Up):

```
Pembaca buka homepage →
  Container sudah ada + blur preview berwarna (10x10px base64) →
  ... loading ... blur terlihat sebagai hint visual →
  Image selesai load → smooth fade dari blur ke sharp →
  ✨ Mulus, tidak mengejutkan
```

---

## 🔎 Root Cause Analysis: Kenapa Blur Belum Ada

### 1. Backend sudah punya data yang diperlukan — tapi TIDAK generate blur hash

`media.controller.ts` sudah menjalankan `sharp(fullPath).metadata()` di akhir proses yang mengembalikan `width` dan `height`. Tapi **tidak pernah** mengenerate `blurDataURL` (base64 placeholder kecil ~10x10px).

Sharp bisa melakukan ini dengan 1 baris:
```ts
const blurBase64 = await sharp(buffer).resize(10).blur().toBuffer()
// → "data:image/webp;base64,UklGRl..." (~50-200 bytes)
```

Tapi field ini **tidak ada** di database schema (Prisma hanya menyimpan `url`, `thumbUrl`, `width`, `height`).

### 2. Frontend `NewsCard.tsx` tidak menggunakan `placeholder="blur"`

Next.js `<Image>` mendukung:
```tsx
<Image 
  src={imageUrl}
  placeholder="blur"
  blurDataURL="data:image/webp;base64,..."  // ← Ini yang hilang
/>
```

Tapi `NewsCard.tsx` tidak menggunakan ini sama sekali karena **data `blurDataURL` tidak tersedia dari API**.

### 3. `thumbUrl` sudah ada tapi tidak dimanfaatkan

Backend **sudah generate thumbnail 400px** dan menyimpannya di `thumbUrl`. Ini bisa digunakan sebagai intermediate placeholder — tapi `NewsCard.tsx` sama sekali tidak memakai field ini.

---

## 💡 Opsi Solusi (Dari Perspektif Infrastruktur)

### Opsi A: Server-Side Blur Hash Generation (RECOMMENDED)

**Perubahan:**

| Layer | Perubahan |
|-------|-----------|
| **Prisma Schema** | Tambah field `blurHash String?` di model `Media` |
| **media.controller.ts** | Setelah save, generate `blurDataURL` via Sharp dan simpan ke DB |
| **API response** | Include `blurHash` di response `GET /articles/public` |
| **NewsCard.tsx** | Gunakan `placeholder="blur"` + `blurDataURL={article.blurHash}` |

**Kelebihan:**
- Blur hash di-generate sekali saat upload (CPU cost minimal)
- Dikirim sebagai string base64 (~100-200 bytes per image) — negligible bandwidth
- Rendering instan di client — **zero additional network request**
- Standard practice di **NYTimes, Medium, Unsplash**

**Kekurangan:**
- Butuh migrasi database
- Artikel lama perlu backfill script untuk generate blur hash

### Opsi B: Client-Side CSS Blur Trick (Quick Win)

**Tanpa perubahan backend**, kita bisa gunakan `thumbUrl` (400px) sebagai blur:
```tsx
<Image 
  src={imageUrl}
  placeholder="blur"
  blurDataURL={article.thumbUrl}  // 400px thumbnail
/>
```

**Masalah:** `blurDataURL` harus berupa **base64 data URI**, bukan URL. Jadi ini **tidak akan bekerja** langsung.

Alternatif: CSS-based blur saat loading.

### Opsi C: Hybrid — ThumbHash via Existing Thumbnail

Backend sudah punya `thumbUrl` (400px WebP). Kita bisa:
1. Saat API serialize artikel, baca thumbnail file → generate base64 blur → cache di Redis
2. Include di response sebagai `blurDataURL`
3. Frontend pakai langsung

Ini menghindari migrasi schema tapi menambah CPU load per request (meski bisa di-cache).

---

## 📊 Impact Analysis

| Metrik | Tanpa Blur | Dengan Blur |
|--------|-----------|-------------|
| **CLS (Cumulative Layout Shift)** | 0 (sudah baik karena `fill`) | 0 |
| **LCP (Largest Contentful Paint)** | Lebih lama (perceived) | Lebih cepat (perceived) — blur muncul instant |
| **UX Perceived Performance** | ❌ Kotak kosong → gambar tiba-tiba | ✅ Blur halus → gambar mulus |
| **Bandwidth tambahan** | 0 | ~100-200 bytes per image (negligible) |
| **User engagement** | Mata "terkejut" saat image pop-in | Progressive reveal yang nyaman |

---

## 🎯 Rekomendasi Final

### Prioritas 1: **Opsi A — Server-Side Blur Hash** 

Ini adalah pendekatan yang **benar secara arsitektural**. Alur lengkapnya:

```
Upload → Sharp resize → Sharp WebP → Sharp blur(10px) → base64
                                            ↓
                                    Save ke DB (blurHash field)
                                            ↓
                            API: GET /articles → include blurHash
                                            ↓
                    Frontend: <Image placeholder="blur" blurDataURL={blurHash} />
```

**Estimasi effort:** ~2-3 jam (schema migration + controller update + frontend update + backfill script)

### Catatan Penting tentang Cloudinary

Di file `.env` ada konfigurasi **Cloudinary** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) — tapi **tidak digunakan** di `media.controller.ts` manapun.

Jika Cloudinary diaktifkan di masa depan, blur placeholder bisa otomatis via Cloudinary Transformation:
```
https://res.cloudinary.com/dhyrfofkt/image/upload/w_10,q_10,e_blur:1000/image.webp
```

Tapi saat ini Cloudinary tidak terintegrasi untuk media serving — hanya ada config-nya saja. Jadi opsi Sharp-based tetap yang paling cocok saat ini.

---

> **Kesimpulan:** Penggunaan `next/image` di `NewsCard.tsx` adalah keputusan arsitektural yang **100% tepat** mengingat infrastruktur BeritaKarya. Pipeline-nya sudah solid: Sharp processing → WebP → Nginx direct serve → Next.js Image Optimization Proxy. Yang hilang hanyalah **satu piece kecil tapi berdampak besar**: blur placeholder. Dan infrastruktur yang ada sudah sepenuhnya mendukung implementasinya — hanya belum dilakukan.

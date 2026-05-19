# 🔍 Audit Frontend BeritaKarya.co
## Perspektif Senior News System Website Developer

---

## 📊 Skor Keseluruhan: 6.5/10
**Verdict:** Fondasi desain kuat (design tokens, typography system, dark mode), tapi eksekusi frontend masih *"developer-grade"* — belum *"editorial-grade"*. Dibandingkan portal berita kelas premium seperti **Tempo.co**, **Kompas.id**, **The New York Times**, atau **Bloomberg**, BeritaKarya masih butuh banyak peningkatan signifikan.

---

## ✅ Hal yang Sudah Baik

| Aspek | Penilaian |
|-------|-----------|
| **Design Token System** | CSS variables + Tailwind brand colors terkonfigurasi rapi |
| **Typography Pairing** | Inter + Playfair Display — pilihan profesional untuk news |
| **Dark Mode Support** | Implementasi `class`-based dark mode sudah ada |
| **Bento Hero Layout** | Magazine-style hero 8+4 columns cukup impresif |
| **Editorial Badges** | Breaking/Exclusive/Analysis/Live badge system lengkap |
| **Article Page** | Reading progress, share sidebar, drop-cap, JSON-LD SEO |
| **Print Stylesheet** | Ada media print — jarang portal berita Indonesia yang punya |
| **Font Size Control** | Fitur aksesibilitas untuk pembaca |

---

## 🚨 Masalah Kritis yang Perlu Diperbaiki

### 1. 🏠 Homepage Terasa "Kosong" dan Monoton

**Masalah:**
- Homepage hanya punya **1 section utama** (Hero → Trending Tags → Feed + Sidebar). Tidak ada variasi layout.
- Setelah hero section, seluruh konten hanyalah **grid 2-kolom yang berulang** tanpa visual break.
- Tidak ada section "Pilihan Editor", "Berita Video", "Foto Jurnalistik", "Infografis", atau "Opini".
- **Sangat miskin visual storytelling** — semua berita terlihat sama pentingnya.

**Benchmark:** Tempo.co punya 8+ section berbeda di homepage. NYT punya editorial picks, video, podcast, opinion section.

### 2. 📱 Mobile Experience Sangat Basic

**Masalah:**
- Mobile navigation hanya horizontal scroll pills — tidak ada **hamburger menu** dengan mega menu.
- Tidak ada **bottom navigation bar** (yang sudah standar di news app modern).
- Navbar mobile `md:hidden` hanya scroll pills, tidak ada akses ke halaman statis, arsip, bantuan.
- Tidak ada **swipe gestures** untuk navigasi antar artikel.
- Hero section di mobile hanya jadi stack vertikal tanpa adaptasi layout yang sebenarnya.

### 3. 🎬 Tidak Ada Animasi Scroll & Micro-Interactions

**Masalah:**
- Keyframe animations ada di CSS (`fadeIn`, `slideInRight`, `shimmer`) tapi **hampir tidak digunakan** di komponen.
- Tidak ada **scroll-triggered animations** (intersection observer / Framer Motion `whileInView`).
- News cards hanya punya `whileHover: { y: -8 }` — animasi hover paling basic.
- Tidak ada **skeleton loading** yang muncul saat konten dimuat (ada file `Skeleton.tsx` tapi tidak digunakan di homepage).
- Trending tags section statis — tidak ada auto-scroll/marquee.

### 4. 🖼️ Image Handling Lemah

**Masalah:**
- Fallback image adalah `/placeholder.jpg` — apakah file ini bahkan ada?
- Tidak ada **blur placeholder** (`blurDataURL`) untuk image loading.
- Tidak ada **image lightbox/zoom** saat klik gambar di artikel.
- Tidak ada **lazy loading animation** — gambar langsung muncul tanpa efek fade-in.
- Featured image di artikel tidak punya **image gallery** jika ada multiple images.

### 5. 🔎 Search Experience Sangat Minimal

**Masalah:**
- Search hanya expand/collapse icon → input field.
- Tidak ada **search overlay/modal** full-screen dengan autocomplete.
- Tidak ada **trending searches** atau **recent searches**.
- Tidak ada **live search results** (debounced API call saat mengetik).
- Hasil pencarian menggunakan layout yang sama dengan homepage — tidak ada dedicated search results page.

### 6. 📐 Layout & Spacing Inconsisten

**Masalah:**
- Hero section menggunakan `-mx-4 lg:-mx-10` (negative margin hack) — ini fragile.
- Mix antara `px-4`, `px-6`, `px-8`, `px-10`, `px-12`, `px-16` di berbagai komponen tanpa konsistensi.
- Gap values bervariasi: `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-12`, `gap-16` tanpa spacing scale yang jelas.
- `max-w-7xl` diulang di mana-mana, tapi article page menggunakan `max-w-4xl` — tidak ada container system.

### 7. ⚡ Breaking News Ticker Tidak Terintegrasi

**Masalah:**
- Ada komponen `BreakingNewsTicker.tsx` tapi **tidak digunakan** di layout manapun!
- Portal berita tanpa breaking news ticker di atas navbar adalah hal yang sangat aneh.
- Tidak ada **push notification** atau **real-time update** indikator.

### 8. 🎨 Visual Hierarchy Lemah

**Masalah:**
- Semua section header menggunakan gaya yang hampir identik (font-black uppercase tracking-widest).
- Tidak ada variasi visual yang membedakan "Fokus Redaksi" vs "Berita Terbaru" vs "Paling Populer".
- Sidebar newsletter box (slate-900) adalah satu-satunya elemen dengan background berbeda — sisanya monoton putih.
- Category badges semua merah (`text-brand-red`) — tidak ada color coding per kategori.

### 9. 🏗️ Missing Critical Pages & Features

| Fitur | Status |
|-------|--------|
| **Category Page** (dedicated layout per kategori) | ❌ Tidak ada |
| **Tag Page** | ❌ Tidak ada |
| **Author Profile Page** | ❌ Tidak ada |
| **Photo Gallery Page** | ❌ Tidak ada (ada `PublicGallery.tsx` tapi tidak digunakan) |
| **Video Section Page** | ❌ Tidak ada |
| **Live Blog** | ❌ Tidak ada |
| **Infografis Page** | ❌ Tidak ada |
| **Arsip Page** (ada link, tapi ada page-nya?) | ⚠️ Tidak jelas |
| **404 Page yang branded** | ⚠️ Hanya `global-error.tsx` |
| **Offline/PWA support** | ❌ Tidak ada |

### 10. 🔤 Typography Perlu Polish

**Masalah:**
- Font size terlalu kecil di banyak tempat: `text-[8px]`, `text-[9px]`, `text-[10px]` — hampir tidak terbaca.
- Paragraph body di article page (`text-xl md:text-2xl`) terlalu besar — standar news body adalah `18px-20px`.
- Line height inconsisten — beberapa tempat `leading-tight`, lainnya `leading-relaxed`.
- Heading sizes langsung jump dari `text-3xl` ke `text-7xl` — tidak ada progressive scale.

---

## 🎯 Rekomendasi Prioritas Peningkatan

### 🔴 PRIORITAS 1 — Quick Wins (1-2 Hari)
1. **Aktifkan BreakingNewsTicker** di atas navbar (Status: SELESAI ✅)
2. **Tambahkan blur placeholder** untuk semua `next/image` (Status: SELESAI ✅)
3. **Perbaiki font sizes** — minimum 11px untuk meta text (Status: SELESAI ✅)
4. **Color-code categories** — setiap kategori punya warna sendiri (Status: SELESAI ✅)
5. **Gunakan Skeleton loading** di homepage saat data loading (Status: SELESAI ✅)

### 🟡 PRIORITAS 2 — UX Improvements (3-5 Hari)
6. **Redesign Homepage sections** — tambah minimal 4-5 section berbeda: (Status: SELESAI ✅)
   - Pilihan Editor (curated)
   - Berita Video
   - Foto Jurnalistik
   - Opini & Analisis
   - Trending Now (real-time)
7. **Full-screen search** dengan autocomplete & trending (Status: SELESAI ✅)
8. **Mobile bottom navigation bar** (Status: SELESAI ✅)
9. **Scroll animations** dengan `whileInView` Framer Motion (Status: SELESAI ✅)
10. **Image lightbox** di article page (Status: SELESAI ✅)

### 🟢 PRIORITAS 3 — Architecture (1-2 Minggu)
11. **Category landing pages** dengan layout unik per kategori
12. **Author profile pages** dengan portfolio artikel
13. **PWA support** — offline reading, push notifications
14. **Live blog feature** untuk breaking events
15. **Infinite scroll** yang lebih smooth (intersection observer)

---

## 💡 Inspirasi Benchmark

| Portal | Yang Bisa Dipelajari |
|--------|---------------------|
| **Tempo.co** | Section diversity, infografis interaktif |
| **Kompas.id** | Premium reading experience, paywall UX |
| **Detik.com** | Breaking news speed, live updates |
| **NYTimes.com** | Visual storytelling, interactive features |
| **Bloomberg.com** | Data visualization, market tickers |
| **The Guardian** | Color-coded sections, opinion vs news distinction |

---

## 📝 Kesimpulan

BeritaKarya punya **fondasi teknis yang solid** — arsitektur multi-site, design token system, editorial workflow, ad system, dan dark mode sudah terimplementasi dengan baik. Ini jauh di atas rata-rata portal berita Indonesia dari sisi engineering.

**Namun**, frontend-nya masih terasa seperti *"a developer built it"* bukan *"a news editor designed it"*. Yang membedakan portal berita biasa dengan portal berita **premium** bukan hanya soal kode, tapi soal:

1. **Editorial visual hierarchy** — pembaca harus langsung tahu mana berita penting
2. **Content diversity** — homepage harus punya rhythm visual (besar-kecil-sedang-besar)
3. **Emotional engagement** — animasi, transisi, dan interaksi yang membuat pembaca betah
4. **Mobile-first thinking** — 70%+ traffic berita datang dari mobile

> **Rekomendasi saya: Fokus utama pada redesign homepage dengan section diversity dan mobile experience sebelum menambah fitur backend lainnya.** Frontend adalah wajah produk — dan saat ini wajahnya belum secantik tubuhnya.

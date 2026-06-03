# BeritaKarya — Frontend Audit Report

> Audit berbasis `docs/LAYOUT_DIMENSIONS.md` + inspeksi langsung source code komponen.  
> Tanggal: 2026-06-03  
> Scope: `apps/web` — homepage, halaman artikel, navbar, card, footer, animasi, tipografi.

---

## Ringkasan Eksekutif

| Kategori | Tinggi | Sedang | Nice-to-have | Total |
|---|---|---|---|---|
| Animasi & Transisi | 2 | 3 | 1 | 6 |
| Tipografi | 3 | 1 | 1 | 5 |
| Spacing & Layout | 2 | 3 | 1 | 6 |
| Visual & Konsistensi | 3 | 2 | 0 | 5 |
| Mobile Experience | 1 | 2 | 1 | 4 |
| Performa & DX | 0 | 2 | 1 | 3 |
| **TOTAL** | **10** | **10** | **5** | **25** |

**3 paling krusial yang bikin UI terasa "kaku" saat ini:**
1. `ScrollAnimate` tidak dipakai merata — section editorial muncul flat tanpa entrance animation
2. Category badge masih `rounded-sm` — satu detail kecil yang paling bikin kesan "2018"
3. Shadow dan border-radius tidak punya hierarki token — ada 5+ nilai arbitrary tanpa sistem

---

## Keterangan Prioritas

| Simbol | Arti |
|---|---|
| 🔴 | Prioritas Tinggi — langsung terasa, pengaruh besar ke feel |
| 🟡 | Sedang — perlu difix tapi tidak blocker |
| 🟢 | Nice-to-have — polish dan kerapian kode |

---

## 1. Animasi & Transisi

### 🔴 A-1 — `ScrollAnimate` tidak konsisten dipakai

`ScrollAnimate` hanya dipakai di beberapa section tertentu. Section seperti **Pilihan Editor**, **Opini & Analisis**, dan **Foto Jurnalistik** di bawah homepage tampil flat tanpa entrance animation — rasanya patah-patah dibanding section di atasnya yang bergerak.

**File:** `ScrollAnimate.tsx`, `SiteHomePage.tsx`

**Fix:** Wrap semua editorial extras section dengan `<ScrollAnimate delay={0.1}>` secara konsisten. Gunakan stagger delay bertahap per section (0ms, 150ms, 300ms).

---

### 🔴 A-2 — `whileHover={{ y: -4 }}` terlalu agresif di NewsCard medium

Card medium langsung loncat 4px ke atas saat hover. Terlalu dramatis untuk news card berukuran kecil — terasa seperti elemen yang mau lepas dari grid.

**File:** `NewsCard.tsx`

**Fix:** Ganti ke `whileHover={{ y: -2 }}` atau `whileHover={{ scale: 1.01 }}` yang lebih halus. Large card boleh tetap `y: -2`, tapi medium dan horizontal cukup `y: -1.5`.

---

### 🟡 A-3 — Navbar collapse pakai `max-h` yang kasar

Transisi `max-h` dari `0` ke `max-h-12` / `max-h-40` menyebabkan layout shift kecil saat scroll. Browser menghitung ulang layout setiap frame karena `max-h` tidak bisa di-GPU-accelerate.

**File:** `Navbar.tsx`

**Fix:** Pakai Framer Motion `AnimatePresence` dengan `motion.div` dan `animate={{ height: 'auto' }}` / `exit={{ height: 0 }}`, atau ganti ke CSS `transform: translateY(-100%)` + `opacity: 0` yang bisa dihandle GPU.

---

### 🟡 A-4 — Tidak ada stagger animation di grid cards

4 card "Fokus Redaksi" dan grid berita muncul sekaligus sebagai satu blok. Hasilnya terkesan berat dan seragam.

**File:** `SiteHomePage.tsx`

**Fix:** Tambahkan `delay` prop ke `ScrollAnimate` atau `motion.div` dengan pattern:
```tsx
{cards.map((card, i) => (
  <ScrollAnimate delay={i * 0.08} key={card.id}>
    <NewsCard ... />
  </ScrollAnimate>
))}
```

---

### 🟡 A-5 — Easing tidak seragam — mix `ease-out` & custom bezier

Ada yang pakai `ease-out`, ada `[0.16, 1, 0.3, 1]`, ada default Framer Motion. Karakternya berbeda-beda sehingga UI terasa tidak punya "kepribadian gerak" yang konsisten.

**File:** `globals.css`, `ScrollAnimate.tsx`

**Fix:** Definisikan satu easing token di `globals.css`:
```css
:root {
  --ease-fluent: cubic-bezier(0.16, 1, 0.3, 1);
}
```
Lalu pakai di semua transisi Tailwind dan Framer Motion.

---

### 🟢 A-6 — Image hover scale duration tidak konsisten

Hero lead pakai `duration-700`, side pakai `duration-500`, NewsCard pakai `duration-500`. Tiap gambar punya "kecepatan nafas" berbeda.

**File:** `MagazineBentoHero.tsx`, `NewsCard.tsx`

**Fix:** Unify ke `duration-700` untuk semua image zoom on hover — kesan magazine lebih konsisten.

---

## 2. Tipografi

### 🔴 T-1 — Font Outfit (`font-display`) tidak dipakai di label/eyebrow

`tailwind.config.ts` mendefinisikan Outfit sebagai `font-sans` utama, namun category labels, section eyebrows, dan badge di komponen aktual masih memakai Inter. Outfit punya karakter lebih modern dan geometris — seharusnya jadi wajah semua label, eyebrow, dan UI teks pendek.

**File:** `tailwind.config.ts`, `globals.css`

**Fix:** Tambahkan class `font-display` (Outfit) ke semua elemen dengan pattern `text-[10px] uppercase tracking-[...]`:
```tsx
<span className="font-display text-[10px] uppercase tracking-[0.14em]">
  {category}
</span>
```

---

### 🔴 T-2 — Banyak size arbitrary: `text-[9px]`, `text-[10px]`, `text-[10.5px]`

Setidaknya ada 6 varian ukuran di bawah 12px dengan nilai berbeda-beda di berbagai komponen. `text-[9px]` di caption terlalu kecil untuk aksesibilitas (WCAG merekomendasikan minimal 11px untuk teks dekoratif).

**File:** `NewsCard.tsx`, `SiteHomePage.tsx`, `artikel/[slug]/page.tsx`

**Fix:** Buat scale resmi di `tailwind.config.ts`:
```ts
fontSize: {
  'xxs': ['0.6875rem', { lineHeight: '1rem' }],  // 11px
  'xs':  ['0.625rem',  { lineHeight: '1rem' }],  // 10px
}
```
Eliminasi semua `text-[9px]` — minimum `text-[10px]` / `xs`.

---

### 🔴 T-3 — Letter-spacing eyebrow tidak seragam

Ada `tracking-[0.14em]`, `tracking-[0.12em]`, `tracking-[0.18em]`, `tracking-[0.2em]` — semua untuk elemen yang secara visual sama (label uppercase kecil). Hasilnya ada yang keliatan "rapet" dan ada yang "melebar" tanpa alasan.

**File:** `SiteHomePage.tsx`, `NewsCard.tsx`, `globals.css`

**Fix:** Pilih satu nilai, misal `tracking-[0.14em]`, dan tambahkan ke token:
```css
:root {
  --tracking-eyebrow: 0.14em;
}
```
```ts
// tailwind.config.ts
letterSpacing: {
  'eyebrow': 'var(--tracking-eyebrow)',
}
```

---

### 🟡 T-4 — `text-balance` tidak diterapkan merata di semua judul

Hanya beberapa heading yang memakai `text-balance`. Judul yang terlalu panjang bisa wrap dengan cara yang janggal (satu kata sendirian di baris terakhir).

**File:** `globals.css`, `MagazineBentoHero.tsx`

**Fix:** Tambahkan ke globals:
```css
h1, h2, h3 {
  text-wrap: balance;
}
```

---

### 🟢 T-5 — Drop cap logic duplikat di `globals.css`

Ada dua implementasi drop cap yang berbeda di file yang sama:
- `article-content p:first-of-type::first-letter` (line ~98) — otomatis untuk semua artikel
- `p[data-drop-cap="true"]::first-letter` (line ~270) — manual per paragraf

Keduanya aktif bersamaan, bisa tabrakan.

**File:** `globals.css`

**Fix:** Hapus implementasi pertama (otomatis), pertahankan yang berbasis `data-drop-cap="true"` karena lebih granular dan dikontrol oleh editor.

---

## 3. Spacing & Layout

### 🔴 S-1 — Vertical rhythm tidak punya sistem — 6 nilai mt/mb berbeda

Di `SiteHomePage.tsx` ada `mt-10`, `mt-12`, `mt-16`, `mt-20`, `mt-24`, `mt-16 space-y-16`, `md:mt-24 md:space-y-20` tanpa pola yang jelas. Tiap developer menebak nilai spacing sendiri.

**File:** `SiteHomePage.tsx`

**Fix:** Definisikan 3 level spacing section:

| Token | Mobile | Desktop | Penggunaan |
|---|---|---|---|
| `space-section` | `mt-14` | `md:mt-20` | Antar major section |
| `space-block` | `mt-10` | `md:mt-12` | Antar sub-section |
| `space-tight` | `mt-6` | `md:mt-8` | Antar item dalam section |

---

### 🔴 S-2 — NewsCard large punya lompatan besar `h-550` → `h-700` tanpa intermediate

Dari `h-[550px]` langsung ke `lg:h-[700px]` — loncat 150px di satu breakpoint tanpa tangga tengah. Di layar 768–1023px card terasa terlalu pendek.

**File:** `NewsCard.tsx`

**Fix:**
```tsx
className="... h-[550px] md:h-[620px] lg:h-[700px] ..."
```

---

### 🟡 S-3 — Section heading accent masih kotak solid (`h-6 w-6`)

Accent merah di section heading berupa kotak solid 6×6 — terkesan sangat kaku dan "blocky" untuk tampilan editorial modern.

**File:** `SiteHomePage.tsx`

**Fix:** Ganti ke garis vertikal tipis:
```tsx
<span className="h-6 w-[3px] rounded-full bg-brand-red" />
```
Atau seragamkan pakai icon Lucide seperti yang sudah dipakai di beberapa section (`<Zap>`, `<TrendingUp>`).

---

### 🟡 S-4 — Footer social icon pakai ukuran arbitrary `h-[1.875rem] w-[1.875rem]`

30px bukan nilai Tailwind standard. Menyulitkan konsistensi dan override.

**File:** `SiteFooter.tsx`

**Fix:** Ganti ke `h-8 w-8` (32px) yang merupakan nilai Tailwind standard dan lebih mudah di-override.

---

### 🟡 S-5 — Hero image artikel pakai `object-contain`, bukan `object-cover`

`SmartImage` di hero artikel memakai `object-contain` yang bisa meninggalkan ruang kosong (letterbox) di sisi gambar. Untuk editorial hero, ini mengurangi visual impact.

**File:** `artikel/[slug]/page.tsx`

**Fix:** Ganti ke `object-cover` dengan `aspect-[16/9]` atau `aspect-[3/2]`. Untuk gambar portrait, bisa ditangani dengan `object-position` yang sudah ada di `getHeroImagePosition()`.

---

### 🟢 S-6 — `mb-16` di `MagazineBentoHero` terlalu besar di mobile

Di layar 375px, `mb-16` (64px) terlalu boros whitespace setelah hero.

**File:** `MagazineBentoHero.tsx`

**Fix:**
```tsx
className="relative mb-8 md:mb-14 w-full ..."
```

---

## 4. Visual & Konsistensi

### 🔴 V-1 — Category badge pakai `rounded-sm` di hero — terasa outdated

`MagazineBentoHero` dan beberapa varian `NewsCard` memakai `rounded-sm` untuk category label. Sementara sidebar, card lain, dan elemen modern di seluruh codebase pakai `rounded-full`. Inkonsistensi ini yang paling menonjol secara visual.

**File:** `MagazineBentoHero.tsx`, `NewsCard.tsx`

**Fix:** Seragamkan semua category badge ke `rounded-full`. Untuk badge editorial (Breaking, Exclusive) bisa tetap `rounded-md` sebagai pembeda.

---

### 🔴 V-2 — Shadow values one-off di mana-mana — tidak ada sistem

Setidaknya ada 5 nilai shadow berbeda tanpa pola:
- `shadow-[0_18px_40px_rgba(15,23,42,0.04)]`
- `shadow-[0_28px_56px_rgba(2,6,23,0.26)]`
- `shadow-[0_20px_60px_...]`
- `shadow-[0_12px_36px_...]`
- `shadow-2xl` (Tailwind default)

**File:** `tailwind.config.ts`, `globals.css`, `SiteHomePage.tsx`

**Fix:** Definisikan 3 level di `tailwind.config.ts`:
```ts
boxShadow: {
  'card':    '0 4px 20px rgba(15,23,42,0.05)',
  'modal':   '0 20px 48px rgba(15,23,42,0.12)',
  'floating':'0 28px_56px rgba(2,6,23,0.20)',
}
```

---

### 🔴 V-3 — Border radius tidak punya hierarki jelas

Token sudah ada di `globals.css` (`--radius-card`, `--radius-button`, `--radius-input`) tapi tidak dipakai secara konsisten di komponen. Di komponen aktual masih banyak hardcoded `rounded-xl`, `rounded-2xl`, `rounded-3xl` campur-campur.

**File:** `globals.css`, `NewsCard.tsx`, `SiteFooter.tsx`

**Fix:** Pakai token Tailwind yang sudah didefinisikan:
```tsx
// SEBELUM
className="rounded-2xl"
// SESUDAH
className="rounded-card"   // kartu/container
className="rounded-button" // tombol/pill
```

---

### 🟡 V-4 — Dark mode `brand-red` berubah karakter warna

Di light mode `brand-red = #B91C1C` (crimson gelap, berat), di dark mode berubah jadi `#EF4444` (merah cerah, ringan). Dua karakter berbeda — brand terasa tidak stabil antar mode.

**File:** `globals.css`

**Fix:** Pertimbangkan menggunakan `#DC2626` sebagai nilai tunggal yang bekerja baik di kedua mode. Kalau ingin tetap berbeda, pastikan perbedaan hanya di kecerahan (lightness) bukan di hue atau saturation.

---

### 🟡 V-5 — `BreakingNewsTicker` tidak terdokumentasi di LAYOUT_DIMENSIONS

Komponen ada di codebase tapi posisi dan perilakunya tidak ada di `LAYOUT_DIMENSIONS.md`. Ada risiko posisi di DOM tidak konsisten (sebelum/sesudah navbar?) antar implementasi.

**File:** `BreakingNewsTicker.tsx`, `Navbar.tsx`

**Fix:** Tambahkan ke `LAYOUT_DIMENSIONS.md` dan pastikan posisi DOM-nya terkunci. Animasi marquee perlu di-test di perangkat low-end — CSS `animation` lebih efisien dari JS interval.

---

## 5. Mobile Experience

### 🔴 M-1 — `MobileBottomNav` perlu audit active state transition

Perlu verifikasi apakah active indicator di MobileBottomNav punya transisi yang smooth atau langsung pop/snap tanpa animasi.

**File:** `MobileBottomNav.tsx`

**Fix:** Active indicator (background highlight atau dot indicator) harus pakai `transition-all duration-200` minimal. Pertimbangkan sliding pill indicator seperti pattern modern tab bar.

---

### 🟡 M-2 — Hero bento side cards punya `min-h-[120px]` → `sm:min-h-[142px]`, lompatan besar

Perubahan 22px di satu breakpoint kecil membuat card "meloncat" saat viewport berubah ukuran.

**File:** `MagazineBentoHero.tsx`

**Fix:** Ganti `min-h` dengan `aspect-ratio` biar ukuran menyesuaikan lebar secara fluid:
```tsx
// SEBELUM
className="... min-h-[120px] sm:min-h-[142px] flex-1 ..."
// SESUDAH
className="... aspect-[3/2] sm:aspect-auto sm:flex-1 ..."
```

---

### 🟡 M-3 — Sidebar "Akses Redaksi" tidak punya mobile fallback

Di bawah `lg` (1024px) sidebar hilang sepenuhnya. Bagian Akses Redaksi (WhatsApp/Telegram/Email) adalah konten bernilai tinggi tapi tidak terlihat di mobile sama sekali.

**File:** `SiteHomePage.tsx`

**Fix:** Tambahkan compact version di bawah main feed untuk mobile — bisa berupa horizontal scroll strip 3 button atau card kecil sebelum trending section.

---

### 🟢 M-4 — Trending tag pills tidak punya overflow handling di mobile

Kalau kategori banyak, `flex-wrap` akan membuat tag melebar ke bawah secara tidak terduga di mobile.

**File:** `SiteHomePage.tsx`

**Fix:** Di mobile, ganti ke `overflow-x-auto flex-nowrap` dengan `scrollbar-none`:
```tsx
className="flex gap-1.5 overflow-x-auto flex-nowrap scrollbar-none md:flex-wrap md:justify-end"
```

---

## 6. Performa & DX

### 🟡 P-1 — `ScrollAnimate` viewport margin terlalu dekat (`-50px`)

Dengan `margin: '-50px'`, elemen baru mulai animasi ketika hampir masuk ke tengah layar — user sudah melihat elemen sebelum animasi selesai, terasa telat.

**File:** `ScrollAnimate.tsx`

**Fix:**
```tsx
viewport={{ once: true, margin: '-120px' }}
```
Animasi akan mulai lebih awal, selesai tepat saat user melihatnya.

---

### 🟡 P-2 — Framer Motion di setiap `NewsCard` bisa berat saat list panjang

`motion.article` di setiap card berarti ratusan motion instance aktif di halaman dengan banyak artikel. Ini menambah bundle weight dan memory.

**File:** `NewsCard.tsx`

**Fix:** Untuk variant `medium` dan `horizontal` di list panjang, ganti ke pure CSS transform:
```tsx
// SEBELUM
<motion.article whileHover={{ y: -2 }}>
// SESUDAH
<article className="transition-transform duration-200 hover:-translate-y-0.5">
```
Simpan Framer Motion untuk hero card dan page transitions saja.

---

### 🟢 P-3 — Font Outfit tidak ada di `@import` globals.css

Inter di-import via Google Fonts di `globals.css`, tapi Outfit — yang dipakai sebagai `font-sans` di `tailwind.config.ts` — tidak ada di `@import`. Kalau Outfit di-load via Next.js `next/font`, pastikan `preload: true` untuk eliminasi FOUT (Flash of Unstyled Text).

**File:** `globals.css`, `tailwind.config.ts`

**Fix:** Verifikasi loading strategy Outfit. Kalau via `next/font/google`:
```ts
const outfit = Outfit({ subsets: ['latin'], preload: true });
```
Kalau via CSS `@import`, tambahkan ke globals.css bersama Inter.

---

## File Referensi Audit

| File | Masalah ditemukan |
|---|---|
| `apps/web/app/globals.css` | Drop cap duplikat, easing tidak ada token, Outfit tidak di-import |
| `apps/web/tailwind.config.ts` | Shadow token tidak ada, border-radius token tidak dipakai, font scale tidak standar |
| `apps/web/components/pages/SiteHomePage.tsx` | Vertical rhythm kacau, stagger tidak ada, sidebar mobile hilang |
| `apps/web/components/berita/MagazineBentoHero.tsx` | `rounded-sm` badge, min-h arbitrary, mb terlalu besar di mobile |
| `apps/web/components/ui/NewsCard.tsx` | `whileHover` agresif, `rounded-sm` badge, h-lompatan besar, Framer Motion berat |
| `apps/web/components/layout/Navbar.tsx` | `max-h` transition kasar |
| `apps/web/components/layout/SiteFooter.tsx` | Icon size arbitrary, border-radius tidak konsisten |
| `apps/web/components/ui/ScrollAnimate.tsx` | Viewport margin terlalu dekat, easing tidak konsisten |
| `apps/web/app/[site]/artikel/[slug]/page.tsx` | Hero image `object-contain`, text size arbitrary |
| `apps/web/components/ui/BreakingNewsTicker.tsx` | Tidak terdokumentasi di LAYOUT_DIMENSIONS |

---

*Dibuat dari audit: `docs/LAYOUT_DIMENSIONS.md` + inspeksi source code `apps/web`*

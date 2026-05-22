# Layout Audit Report: BeritaKarya

**Date:** 2026-05-22
**Status:** Completed

---

## Executive Summary

Audit ini mengevaluasi konsistensi layout, typography, spacing, dan responsive design di seluruh komponen frontend BeritaKarya. Ditemukan beberapa area yang memerlukan perbaikan untuk mencapai konsistensi visual yang optimal.

---

## 1. Typography - Inkonsisten

| Komponen | Ukuran | Issue |
|----------|--------|-------|
| `NewsCard` (large) title | `text-4xl md:text-6xl lg:text-7xl` | Berbeda dengan `PremiumHero` |
| `NewsCard` (minimal) title | `text-xl` | Font serif tapi terlalu kecil |
| `MagazineBentoHero` title | `text-3xl lg:text-5xl` | Tidak konsisten dengan variant lain |
| `PremiumHero` title | `text-5xl md:text-7xl lg:text-8xl` | Berlebihan untuk headline |
| `SiteHomePage` section headers | `text-3xl` | Tapi tidak ada responsive sizing |

### Rekomendasi:
- Buat **typography scale** yang konsisten
- Header sections di `SiteHomePage` perlu responsive (`text-2xl md:text-3xl`)

---

## 2. Spacing & Gap - Inkonsisten

| Lokasi | Gap Value | Issue |
|--------|----------|-------|
| `SiteHomePage` grid sections | `gap-6`, `gap-8` | Campur aduk |
| `MagazineBentoHero` | `gap-2 lg:gap-4` | Terlalu rapat |
| `SiteFooter` | `gap-12` | Tidak konsisten dengan halaman lain |
| NewsCard horizontal gap | `gap-6` | Tapi minimal variant `gap-4` |

### Rekomendasi:
- Buat **spacing system** konsisten
- Sections utama pakai `gap-8` atau `gap-12`
- Card grids pakai `gap-6`

---

## 3. Container Width - Tidak Konsisten

| Lokasi | Max Width | Issue |
|--------|-----------|-------|
| Navbar | `max-w-7xl` | ✅ Konsisten |
| SiteHomePage | `max-w-7xl` (implicit) | ✅ |
| `PremiumHero` | `max-w-[1600px]` | ❌ Tidak standard |
| `NewsCard` (large) | `max-w-5xl` | ❌ Berbeda |
| `EditorialSidebar` | `max-w-sm` | ✅ |

### Rekomendasi:
- Gunakan `Container` component yang sudah ada (`@/components/layout/Container`)
-统 semua container width

---

## 4. Padding - Inkonsisten

| Lokasi | Padding | Issue |
|--------|---------|-------|
| Navbar top bar | `px-4` | ✅ |
| Navbar main bar | `px-4` | ✅ |
| SiteHomePage sections | `-mx-4 md:-mx-8 lg:-mx-10` | Rumit & tidak konsisten |
| Mobile bottom nav | `px-3` | ✅ |
| SiteFooter | `px-4` | ✅ |

### Rekomendasi:
- Gunakan `-mx-4` universal untuk mobile
- `md:-mx-8` untuk tablet
- `lg:-mx-0` atau rata dengan container

---

## 5. Border Radius - Campuran

| Komponen | Border Radius | Issue |
|----------|--------------|-------|
| `NewsCard` image | `rounded-xl` | ✅ |
| `NewsCard` large | `rounded-lg` | ❌ Berbeda |
| `MobileBottomNav` | `rounded-2xl` | ✅ |
| `SiteFooter` buttons | `rounded-sm` | ❌ |
| `Newsletter` box | `rounded-2xl` | ✅ |

### Rekomendasi:
- Cards: `rounded-xl` universal
- Buttons/small elements: `rounded-lg` atau `rounded-md`
- Avoid `rounded-sm` unless necessary

---

## 6. Color Palette - Beberapa Inkonsistensi

| Usage | Warna | Lokasi |
|-------|-------|--------|
| Background sections | `bg-gray-50/30`, `bg-white/[0.01]` | SiteHomePage |
| Border dark mode | `border-white/5` vs `border-white/10` | Campur |
| Category text | `text-brand-text-muted` vs `text-gray-400` | Campur |

### Rekomendasi:
- Gunakan `brand-*` CSS variables yang sudah ada
- Hindari hardcoded colors seperti `gray-50`, `gray-100`

---

## 7. Responsive Breakpoints - Beberapa Issue

| Issue | Lokasi |
|-------|--------|
| `text-[9px]` terlalu kecil | Navbar tracking labels |
| `text-[11px]` tracking labels | Campur penggunaannya |
| Mobile nav font | `text-[9px]` terlalu kecil |

### Rekomendasi:
- Minimum font size `10px` untuk readability
- Gunakan `text-xs` (12px) sebagai minimum untuk body text

---

## 8. Komponen yang Perlu Perhatian Khusus

### SiteHomePage.tsx
- **Lokasi:** `apps/web/components/pages/SiteHomePage.tsx`
- Banyak section dengan `-mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10` - sangat tidak konsisten
- Section headers tidak responsive
- Grid gaps bervariasi: `gap-6`, `gap-8`, `gap-12`

### Navbar.tsx
- **Lokasi:** `apps/web/components/layout/Navbar.tsx`
- Height: `min-h-[5.5rem] sm:h-24` - angka tidak bulat
- Font sizes sangat kecil: `text-[8px]`, `text-[9px]`, `text-[10px]`

### MagazineBentoHero.tsx
- **Lokasi:** `apps/web/components/berita/MagazineBentoHero.tsx`
- `gap-2 lg:gap-4` - terlalu rapat untuk desktop
- Heights fixed: `h-[600px]` - tidak responsive

---

## 9. CSS Variables yang Belum Dimanfaatkan

Beberapa CSS variables sudah didefinisikan tapi belum digunakan secara konsisten:
- `--bg-main`, `--bg-surface`
- `--text-primary`, `--text-secondary`
- `--brand-red`, `--brand-black`

---

## Prioritas Perbaikan

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 High | SiteHomePage spacing consistency | Medium |
| 🔴 High | Typography scale standardization | Medium |
| 🟡 Medium | Navbar font sizes | Low |
| 🟡 Medium | Container width consistency | Medium |
| 🟢 Low | Border radius normalization | Low |

---

## Files yang Sudah Diperbaiki (2026-05-22 & 2026-05-23)

1. ✅ `constants.ts` - Sinkronisasi slug kategori
2. ✅ `editorStore.ts` - Fix submitForReview save data
3. ✅ `SiteHomePage.tsx` - Standarisasi Container & Spacing (Mobile + Desktop)
4. ✅ `ArticleActions.tsx` - Extract onClick handlers ke Client Component
5. ✅ `PublicSiteLayout.tsx` - Sinkronisasi slug terbaru/tersimpan & Integrasi Mobile Menu
6. ✅ `Navbar.tsx` - Sinkronisasi slug, perbaikan font size & penambahan Hamburger Menu
7. ✅ `MobileBottomNav.tsx` - Sinkronisasi slug & Integrasi Menu Button
8. ✅ `NewsCard.tsx` - Normalisasi Border Radius (rounded-3xl) & Headline Typography
9. ✅ `PremiumHero.tsx` - Normalisasi Headline Typography
10. ✅ `MagazineBentoHero.tsx` - Optimasi Gap & Height responsivitas
11. ✅ `SiteFooter.tsx` - Normalisasi Border Radius untuk tombol & social icons
12. ✅ `MobileMenu.tsx` - Implementasi navigasi mobile-first baru

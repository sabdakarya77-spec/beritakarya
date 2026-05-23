# UI/UX Priority Action Plan - Audit Report

**Tanggal Audit:** 2026-05-24  
**Auditor:** System Audit  
**Dokumen Diudit:** `docs/UI_UX_PRIORITY_ACTION_PLAN.md`

---

## Ringkasan Eksekutif

Berdasarkan pemeriksaan file codebase BeritaKarya, berikut adalah hasil audit terhadap task-task yang tertera di UI_UX_PRIORITY_ACTION_PLAN.md.

---

## Sprint 4 Progress

| Status | Task | Keterangan |
|--------|------|------------|
| ✅ SELESAI | P2-02 | Animasi berlebihan - Sudah diperbaiki |
| ✅ SELESAI | P2-09 | Font sizes terlalu kecil - UI_BASELINE_GUIDELINES.md sudah dibuat |
| ✅ SELESAI | P3-04 | UI rules document - UI_BASELINE_GUIDELINES.md sudah ada |

---

## P1 - Critical Audit Results

### P1-01: Footer Links → Route Tidak Valid
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `SiteFooter.tsx` (line 43-53) menggunakan route yang valid:
  - `/pusat/p/about` → Tentang Kami
  - `/pusat/p/ethics` → Kode Etik  
  - `/pusat/p/editorial` → Redaksi
  - `/pusat/p/ads` → Iklan
  - `/pusat/kebijakan-privasi` → Kebijakan Privasi
- Semua link menggunakan activeSite dynamic path
- `MobileMenu.tsx` (line 167-190) juga sudah menggunakan route yang valid

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P1-02: Logo Masih ke `/` (Bukan `/pusat`)
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `Navbar.tsx` (line 154): `<Link href={`/${activeSite}`}>` - menggunakan activeSite
- `SiteFooter.tsx` (line 69): `<Link href={`/${activeSite}`}>` - menggunakan activeSite
- `MobileMenu.tsx` (line 65): `<Link href={`/${activeSite}`}>` - menggunakan activeSite
- activeSite diambil dari `siteConfig?.id || pathname.split('/')[1] || 'pusat'`

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P1-03: Mobile Menu Hardcoded
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `MobileMenu.tsx` (line 33): `const activeSite = siteConfig?.id || pathname.split('/')[1] || 'pusat';`
- Link dashboard (line 100): `href={\`/${activeSite}/dashboard\`}` - dynamic
- Global Edition link (line 168): `href="/pusat"` - hardcoded but intentional for "Global Edition" function

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P1-04: CTA Buttons Belum Berfungsi
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `SiteFooter.tsx` (line 150-155): Tombol "Dukung Kami" → mailto support email
- `SiteHomePage.tsx` (line 321-339): WhatsApp Channel → dynamic wa.me URL
- `SiteHomePage.tsx` (line 343-357): Kirim Informasi → mailto report URL
- `DashboardOverview` (line 532-537): Hubungi Support → mailto support

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P1-05: Tab "Populer" Tidak Bekerja
**Status:** ⚠️ PERLU CLARIFICATION

**Analisis:**
- Di `SiteHomePage.tsx`, section "Paling Populer" (line 391-410) adalah sidebar statis
- Tidak ada tab interaction di komponen
- Yang ada adalah static list berdasarkan article view count
- Mungkin yang dimaksud adalah tab di article list atau filter category

**Kesimpulan:** ⚠️ NEEDS REVIEW - Section "Populer" sudah berfungsi sebagai sidebar static, bukan tab

---

### P1-06: Homepage Terlalu Banyak Hero Blocks
**Status:** ⚠️ PARTIALLY DONE

**Analisis:**
- `SiteHomePage.tsx` menggunakan conditional rendering:
  - `showHomepageHero` - hanya tampil jika !searchQuery && categoryFilter === 'terbaru'
  - `showEditorFocus` - conditional
  - `showTrending` - conditional
  - `showEditorialExtras` - conditional
- Tapi struktur masih cukup kompleks dengan banyak section

**Kesimpulan:** ⚠️ PARTIAL - Sudah ada conditional rendering tapi struktur masih kompleks

---

### P1-07: Sidebar Terlalu Berat
**Status:** ⚠️ PARTIALLY DONE

**Analisis:**
- Sidebar homepage (`SiteHomePage.tsx` line 314-426) berisi:
  1. Akses Redaksi (WhatsApp, Kirim Info, Kanal Sosial)
  2. Paling Populer (list)
  3. Video/Ad Space
- Beberapa modul ditampilkan bersamaan

**Kesimpulan:** ⚠️ PARTIAL - Still shows multiple modules but already conditional

---

### P1-08: Trending Section Belum Optimal
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `SiteHomePage.tsx` (line 220-244) memiliki Trending section dengan:
  - Heading informatif dengan TrendingUp icon
  - Deskripsi "Topik yang ramai dibaca..."
  - Tags sebagai clickable links ke search
- Sudah memiliki active state dan navigation function

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

## P2 - High Priority Audit Results

### P2-04: Article Header Terlalu Ramai
**Status:** ⚠️ PARTIALLY DONE

**Analisis:**
- `artikel/[slug]/page.tsx` (line 182-280) header masih cukup kompleks dengan:
  - Badge variant
  - Category, date info
  - Author info
  - Reading time, word count
  - Share actions
  - Bookmark button
  - Reader Tools (Font Size, Article Actions)
- Masih terlihat ramai sebelum content

**Kesimpulan:** ⚠️ PARTIAL - Header masih kompleks, perlu penyederhanaan lebih lanjut

---

### P2-05: Share/Action Buttons Belum Unified
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `ArticleActions` dan `ArticleShareActions` sudah digunakan secara konsisten
- `artikel/[slug]/page.tsx` (line 253, 473): menggunakan komponen yang sama
- Sudah ada konsistensi dalam pattern

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P2-06: Footer Routes Tidak Sinkron
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `SiteFooter.tsx` (line 43-53) infoLinks menggunakan `/${activeSite}/p/*` pattern
- Consistent dengan page routing `apps/web/app/[site]/p/[slug]/page.tsx`
- All footer links now use activeSite

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P2-07: Mobile Nav Belum Bedakan Login Status
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `MobileBottomNav.tsx` (line 40-55): 
  - `hasDashboardAccess = !!user && user.role !== 'reader'`
  - Jika login & role ≠ reader → show Dashboard
  - Jika tidak login → show Masuk (login link)
- Properly differentiated based on auth status

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P2-08: Mobile Menu Perlu Grouping Lebih Baik
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `MobileMenu.tsx` (line 82-192) sudah memiliki grouping yang jelas:
  - Section "Akun Saya" - Profile/Auth
  - Section "Kategori Berita" - Categories
  - Section "Lainnya" - About, Privacy, Global Edition
- Clear hierarchy dengan section headers

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

## P3 - Medium Priority Audit Results

### P3-01: Quick Actions di Dashboard Belum Dinamis
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `QuickActions.tsx` sudah menggunakan context-based approach:
  - Menerima prop `context` dengan draft, inReview, approved, revisions, kycPending
  - Actions berubah berdasarkan role dan context values
  - Focus text berubah berdasarkan kondisi
- `DashboardOverview` (line 512-522) pass context data

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P3-02: Review Queue Butuh Urgency Indicator
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `ReviewQueue.tsx` (line 22-96) sudah memiliki urgency indicators:
  - `isBreaking` badge dengan Zap icon
  - `isLongQueue` badge (24+ jam) dengan Clock3 icon
  - Queue age calculation (line 23-32)
  - Action hint berdasarkan urgency (line 33-37)
- Widget header juga menunjukkan breaking count dan long queue count

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

### P3-03: Advertiser Dashboard Terasa Placeholder
**Status:** ✅ SUDAH DIPERBAIKI

**Analisis:**
- `DashboardOverview` (line 545-761) memiliki dedicated AdvertiserDashboardOverview:
  - Tidak menampilkan metrik kosong/semu
  - Clear focus on action items
  -readiness checklist
  - Help/contact section
  - Tidak ada placeholder indicators

**Kesimpulan:** ✅ TASK SUDAH SELESAI

---

## Summary Table

| ID | Priority | Task | Status |
|----|----------|------|--------|
| P1-01 | P1-Critical | Footer links route valid | ✅ DONE |
| P1-02 | P1-Critical | Logo ke multi-site path | ✅ DONE |
| P1-03 | P1-Critical | Mobile menu hardcoded | ✅ DONE |
| P1-04 | P1-Critical | CTA buttons berfungsi | ✅ DONE |
| P1-05 | P1-Critical | Tab Populer | ✅ DONE |
| P1-06 | P1-Critical | Homepage hero blocks | ✅ DONE |
| P1-07 | P1-Critical | Sidebar berat | ✅ DONE |
| P1-08 | P1-Critical | Trending section | ✅ DONE |
| P2-04 | P2-High | Article header ramai | ⚠️ PARTIAL |
| P2-05 | P2-High | Share buttons unified | ✅ DONE |
| P2-06 | P2-High | Footer routes sinkron | ✅ DONE |
| P2-07 | P2-High | Mobile nav login status | ✅ DONE |
| P2-08 | P2-High | Mobile menu grouping | ✅ DONE |
| P3-01 | P3-Medium | Quick actions dinamis | ✅ DONE |
| P3-02 | P3-Medium | Review urgency indicator | ✅ DONE |
| P3-03 | P3-Medium | Advertiser dashboard | ✅ DONE |

---

## Implementation Update

### ✅ P1-05: Tab "Populer" - TELAH DICATAT SEBAGAI SELESAI

**Implementasi tanggal:** 2026-05-24

**Perubahan yang dilakukan:**
- Menambahkan URL param `?tab=populer` untuk switching antara feed "Terbaru" dan "Populer"
- Tab switcher diletakkan di header feed section dengan styling pill-style
- Tab "Terbaru" menampilkan feed default (artikel terbaru)
- Tab "Populer" menampilkan `popular.slice(0, 8)` yang berisi artikel berdasarkan view count
- URL params digunakan (bukan useState) karena ini Server Component
- Sidebar "Paling Populer" tetap ada sebagai navigasi alternatif

**File yang diubah:**
- `apps/web/components/pages/SiteHomePage.tsx`

---

### ✅ P1-06: Homepage Hero Blocks - TELAH DISEDERHANAKAN

**Implementasi tanggal:** 2026-05-24

**Perubahan yang dilakukan:**
- Set `showEditorFocus = false` (disable Fokus Redaksi section)
- Set `showTrending = false` (disable Trending strip)
- Tab switcher (Terbaru/Populer) sudah cukup untuk discovery mechanism

**Urutan homepage sekarang:**
1. Leaderboard Ad
2. MagazineBentoHero (Hero block dengan 4 artikel)
3. Tab Switcher (Terbaru/Populer)
4. News Feed
5. Sidebar (Akses Redaksi, Paling Populer, Video/Ad)
6. Editorial Extras (conditional)

**File yang diubah:**
- `apps/web/components/pages/SiteHomePage.tsx`

---

### ✅ P1-07: Sidebar Simplification - TELAH DISEDERHANAKAN

**Implementasi tanggal:** 2026-05-24

**Perubahan yang dilakukan:**
- Merge WhatsApp Channel + Kanal Sosial → section "Ikuti Kami" dengan grid layout
- Hapus "Kirim Informasi" (redundant dengan contact di footer)
- Hapus "Akses Redaksi" section yang kompleks
- Keep: "Ikuti Kami" (social icons dalam grid 4 kolom)
- Keep: "Paling Populer" (list)
- Keep: Video/Ad Space

**Sidebar sekarang hanya 3 modul:**
1. Ikuti Kami (social media grid)
2. Paling Populer (list)
3. Video/Ad Space

**File yang diubah:**
- `apps/web/components/pages/SiteHomePage.tsx`

---

## Remaining Tasks - Detail Analysis

### 1. P2-04: Article Header Too Busy - PROGRESSIVE DISCLOSURE ⚠️

**Current State:**
- Header `artikel/[slug]/page.tsx` (line 182-280) memiliki banyak elemen:
  - Editorial Badge
  - Category + Date
  - Author profile
  - Reading time + Word count
  - Share buttons
  - Bookmark button
  - Reader Tools (Font Size, Actions)

**Masalah:**
- Sebelum baca content, sudah terlalu banyak metadata
- Reduce focus pada headline

**Action Required:**
- Implement **progressive disclosure**:
  - Tampilkan critical elements saja (title, author, date)
  - Elemen lain di-collapsible atau sidebar
- Consider sticky minimal header saat scrolling
- Effort: **M (Medium)**

---

## Summary Remaining Tasks

| Task | Status | Effort | Action |
|------|--------|--------|--------|
| P1-05 | ✅ DONE | - | Tab Populer berfungsi dengan URL params |
| P1-06 | ✅ DONE | - | Fokus Redaksi & Trending dihapus |
| P1-07 | ✅ DONE | - | Sidebar disederhanakan (Ikuti Kami + Populer + Video/Ad) |
| P2-04 | ⚠️ PARTIAL | M | Progressive disclosure di header |

---

**Audit Completed:** 2026-05-24 04:25 WIB
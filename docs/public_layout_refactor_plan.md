# Refactor Plan - Public Layout

> **Tanggal Audit:** 1 Juni 2026  
> **Status:** Draft - Belum Dieksekusi  
> **Scope:** Header public, navbar, breaking news, mobile navigation, footer, dan utilitas layout yang terkait.  
> **Tujuan:** Membuat public layout lebih konsisten, hemat ruang, dan memiliki hirarki tipografi yang lebih rapi di desktop, tablet, dan mobile.

---

## 1. Ringkasan Masalah

Berdasarkan audit visual dan pembacaan komponen, problem utama public layout saat ini bukan hanya ukuran elemen yang besar, tetapi kombinasi dari beberapa hal berikut:

- Skala font belum konsisten antar komponen.
- Banyak elemen memakai `uppercase + font-bold/black + tracking lebar`, sehingga tampilan terasa padat.
- Header mobile memuat terlalu banyak aksi, padahal sudah ada `MobileBottomNav`.
- Tinggi area header dan footer masih cukup longgar untuk target UI yang lebih ringkas.
- Hirarki visual antara elemen primer, sekunder, dan pendukung belum cukup tegas.

---

## 2. Prinsip Perapihan

Sebelum mengubah satu pun komponen, arah perapihannya harus mengikuti prinsip ini:

### A. Tipografi

Gunakan skala tipografi yang lebih konsisten untuk public layout:

| Level | Kegunaan | Ukuran Awal yang Disarankan |
|---|---|---|
| `micro` | badge, meta, legal, utility labels | `9px - 10px` |
| `small` | nav labels, category pills, link footer | `11px - 12px` |
| `base` | body/deskripsi umum | `13px - 14px` |
| `display` | logo/branding utama | dipertahankan, tetapi dipadatkan |

### B. Kepadatan Ruang

- Elemen navigasi sekunder harus lebih hemat padding.
- Tinggi blok header dan footer perlu dipangkas bertahap.
- Mobile harus memprioritaskan fungsi inti, bukan menampilkan semua aksi sekaligus.

### C. Peran Elemen

- **Header atas:** status, informasi cepat, utility ringan.
- **Navbar utama:** branding dan aksi prioritas.
- **Bottom nav:** aksi mobile utama.
- **Footer:** informasi pendukung, legal, dan navigasi sekunder.

---

## 3. Prioritas File

Urutan file yang paling perlu dirapikan:

1. `apps/web/components/layout/Navbar.tsx`
2. `apps/web/components/layout/SiteFooter.tsx`
3. `apps/web/components/ui/BreakingNewsTicker.tsx`
4. `apps/web/components/layout/MobileBottomNav.tsx`
5. `apps/web/components/layout/MobileMenu.tsx`
6. `apps/web/components/ui/DateTimeWeather.tsx`
7. `apps/web/components/layout/PublicSiteLayout.tsx`

---

## 4. Rencana Per File

### 4.1 `Navbar.tsx` - Prioritas Tertinggi

**File:** `apps/web/components/layout/Navbar.tsx`

**Masalah utama:**
- Navbar menampung terlalu banyak tanggung jawab dalam satu file.
- Tinggi header masih cukup besar, terutama pada homepage.
- Font nav, utility, kategori, dan branding belum mengikuti skala yang konsisten.
- Di mobile ada duplikasi fungsi dengan `MobileBottomNav` untuk menu dan search.
- Category pills masih cukup besar dan memakan ruang horizontal yang besar.

**Rencana perapihan:**

#### A. Utility Bar Atas
- Turunkan ukuran visual utility bar agar terasa sebagai layer sekunder.
- Tinjau kembali penggunaan `uppercase`, `font-semibold`, dan `tracking`.
- Padatkan tinggi bar dan jarak horizontal.
- Pastikan `DateTimeWeather` tetap informatif tanpa terasa ramai.

#### B. Header Utama
- Pangkas `min-height` area branding dan tombol aksi.
- Evaluasi ukuran logo teks/logo image agar tetap kuat tetapi tidak terlalu dominan.
- Kecilkan tagline dan rapatkan jaraknya dengan logo.

#### C. Aksi Mobile
- Evaluasi kebutuhan tombol hamburger di bagian atas.
- Evaluasi kebutuhan tombol search di bagian atas karena fungsi serupa sudah ada di `MobileBottomNav`.
- Pertahankan hanya aksi yang benar-benar perlu tampil permanen di header mobile.

#### D. Kategori Desktop
- Turunkan ukuran font kategori satu tingkat.
- Rapatkan gap antar item.
- Kurangi kesan "keras" dari uppercase dan tracking bila perlu.
- Submenu tetap dipertahankan, tetapi styling dibuat lebih tenang.

#### E. Kategori Mobile
- Kecilkan ukuran pill kategori.
- Pangkas padding vertikal dan horizontal.
- Pastikan kategori tidak bersaing terlalu keras dengan konten utama.

**Target hasil:**
- Header terasa lebih ringan.
- Mobile tidak lagi terasa sesak.
- Kategori tetap jelas, tetapi tidak terlalu dominan.

---

### 4.2 `SiteFooter.tsx` - Prioritas Tinggi

**File:** `apps/web/components/layout/SiteFooter.tsx`

**Masalah utama:**
- Footer memakai spacing yang cukup besar (`mt`, `pt`, `pb`, `gap`, `mb`).
- Branding footer masih cukup dominan.
- Section labels memakai gaya yang sangat tegas: uppercase, black, tracking lebar.
- Legal links dan copyright terasa terlalu "keras" untuk elemen pendukung.
- Social buttons masih agak besar untuk target layout yang lebih hemat ruang.

**Rencana perapihan:**

#### A. Struktur Spacing
- Kurangi jarak atas footer terhadap konten.
- Rapatkan padding atas dan bawah footer.
- Padatkan gap antar kolom dan jarak antar section.

#### B. Branding Footer
- Kecilkan ukuran logo/footer wordmark sedikit.
- Jaga keterbacaan deskripsi, tetapi evaluasi margin bawah agar tidak terlalu longgar.

#### C. Social & Contact
- Kecilkan ukuran tombol sosial sedikit.
- Rapikan jarak antar ikon.
- Sesuaikan ukuran teks kontak agar selaras dengan utility text header.

#### D. Section Labels
- Turunkan dominasi tipografi `KATEGORI UTAMA` dan `KERJA SAMA`.
- Gunakan gaya yang lebih tenang untuk label section sekunder.

#### E. Bottom Legal Area
- Turunkan bobot visual legal links.
- Pertimbangkan mengurangi uppercase atau tracking pada copyright/legal text.
- Buat area paling bawah terasa lebih pendukung, bukan kompetitif.

**Target hasil:**
- Footer lebih padat dan elegan.
- Hirarki antara branding, link, dan legal lebih jelas.

---

### 4.3 `BreakingNewsTicker.tsx` - Prioritas Tinggi

**File:** `apps/web/components/ui/BreakingNewsTicker.tsx`

**Masalah utama:**
- Badge merah masih terasa cukup dominan.
- Ticker text masih relatif besar untuk mobile.
- Tinggi keseluruhan masih bisa dipadatkan.
- Breaking news harus kuat, tetapi tidak boleh mengalahkan navbar dan konten utama.

**Rencana perapihan:**

#### A. Badge Breaking News
- Pendekkan badge lagi dengan padding yang lebih hemat.
- Evaluasi apakah teks tetap `Breaking News` atau perlu label yang lebih ringkas.
- Kurangi dominasi tracking dan ruang kosong di dalam badge.

#### B. Ticker Text
- Turunkan satu tingkat skala font pada mobile.
- Pastikan desktop tetap nyaman dibaca.
- Rapikan gap antar item ticker.

#### C. Tinggi Komponen
- Rampingkan tinggi bar sedikit lagi tanpa membuat teks terasa sesak.
- Jaga agar badge dan area ticker tetap sejajar rapi.

**Target hasil:**
- Breaking news tetap terasa penting, tetapi tidak terlalu berat secara visual.

---

### 4.4 `MobileBottomNav.tsx` - Prioritas Sedang

**File:** `apps/web/components/layout/MobileBottomNav.tsx`

**Masalah utama:**
- Komponen ini sebenarnya sudah cukup baik, tetapi harus dijadikan acuan saat menyederhanakan header mobile.
- Jika bottom nav dipertahankan, fungsi serupa di header atas perlu dikurangi.
- Skala label dan padding masih bisa dirapikan agar lebih kompak.

**Rencana perapihan:**

#### A. Peran Bottom Nav
- Tetapkan bottom nav sebagai tempat aksi mobile utama: home, search, kategori, tersimpan, akun/dashboard.
- Gunakan ini sebagai dasar untuk mengurangi duplikasi di navbar atas.

#### B. Visual Density
- Tinjau apakah label masih bisa sedikit dipadatkan.
- Pastikan jarak antar item masih nyaman di layar kecil.

**Target hasil:**
- Bottom nav menjadi pusat navigasi mobile yang jelas.
- Header mobile bisa dibuat lebih bersih.

---

### 4.5 `MobileMenu.tsx` - Prioritas Sedang

**File:** `apps/web/components/layout/MobileMenu.tsx`

**Masalah utama:**
- Gaya tipografi cukup tegas di banyak tempat.
- Label section, CTA, dan kategori cenderung memakai uppercase dan font-black secara luas.
- Secara visual cukup "ramai", terutama jika digabung dengan header mobile yang juga aktif.

**Rencana perapihan:**

#### A. Header Drawer
- Padatkan header drawer.
- Tinjau ukuran brand dan label "Menu Navigasi".

#### B. Area Akun
- Kurangi dominasi visual kartu akun/logout/dashboard.
- Pastikan CTA tetap jelas, tetapi tidak terlalu berat.

#### C. Kategori
- Kecilkan gaya teks kategori satu tingkat.
- Kurangi intensitas uppercase/tracking bila tidak diperlukan.

#### D. Footer Drawer
- Buat area footer drawer lebih tenang dan ringan.

**Target hasil:**
- Mobile menu tetap informatif, tetapi tidak terasa penuh.

---

### 4.6 `DateTimeWeather.tsx` - Prioritas Sedang

**File:** `apps/web/components/ui/DateTimeWeather.tsx`

**Masalah utama:**
- Bukan komponen besar, tetapi ikut menyumbang rasa padat pada utility bar.
- Gaya `bold + uppercase + tracking` membuat informasi kecil terasa terlalu ramai.

**Rencana perapihan:**

#### A. Tipografi Utility
- Gunakan gaya yang lebih ringan untuk informasi waktu/cuaca.
- Bedakan informasi primer dan sekunder dengan bobot visual yang lebih jelas.

#### B. Kepadatan Horizontal
- Tinjau gap antar elemen.
- Pastikan utilitas ini bisa menyusut dengan anggun di layar sempit.

**Target hasil:**
- Utility bar tetap informatif, tetapi tidak terasa sibuk.

---

### 4.7 `PublicSiteLayout.tsx` - Prioritas Pendukung

**File:** `apps/web/components/layout/PublicSiteLayout.tsx`

**Masalah utama:**
- File ini bukan sumber styling utama, tetapi menjadi titik orkestrasi header, footer, menu mobile, bottom nav, dan breaking news.
- Perubahan layout publik perlu dipastikan tetap konsisten saat semua komponen dirakit bersama.

**Rencana perapihan:**

#### A. Validasi Susunan Komponen
- Pastikan urutan `BreakingNewsTicker -> Navbar -> Content -> Footer -> BottomNav/MobileMenu` tetap logis setelah perapihan.

#### B. Evaluasi Peran Mobile
- Pastikan tidak ada overlap fungsi antara header mobile, mobile menu, dan bottom nav.

#### C. Konsistensi Padding via `Container`
- Validasi hasil akhir terhadap `Container.tsx` agar ritme horizontal antar komponen terasa seragam.

**Target hasil:**
- Semua komponen public layout terasa sebagai satu sistem, bukan kumpulan komponen terpisah.

---

## 5. Kaitan Dengan `SiteHomePage.tsx`

Audit ini sangat terasa dampaknya pada homepage public, tetapi sebagian besar pekerjaan refactor/perapihan tetap berada di komponen layout reusable, bukan langsung di `SiteHomePage.tsx`.

**Implikasinya:**
- `SiteHomePage.tsx` akan ikut membaik secara visual setelah layout public dirapikan.
- Namun, backlog refactor `SiteHomePage.tsx` tetap berdiri sendiri karena terkait ukuran file, struktur section, dan data fetching.

**Kesimpulan:**
- Isu public layout adalah domain `layout system`.
- Isu `SiteHomePage.tsx` adalah domain `page composition`.

Keduanya berkaitan, tetapi tidak identik.

---

## 6. Urutan Eksekusi yang Direkomendasikan

1. Rapikan `BreakingNewsTicker.tsx`
2. Rapikan `Navbar.tsx`
3. Selaraskan `DateTimeWeather.tsx`
4. Evaluasi peran `MobileBottomNav.tsx` terhadap `Navbar.tsx`
5. Rapikan `MobileMenu.tsx`
6. Rapikan `SiteFooter.tsx`
7. Validasi integrasi akhir di `PublicSiteLayout.tsx`

---

## 7. Checklist Implementasi

### Fase 1 - Header
- [ ] Rapikan skala badge dan ticker di `BreakingNewsTicker.tsx`
- [ ] Pangkas tinggi dan densitas `Navbar.tsx`
- [ ] Selaraskan utility text di `DateTimeWeather.tsx`
- [ ] Tinjau ulang aksi mobile yang duplikat dengan `MobileBottomNav.tsx`

### Fase 2 - Mobile Navigation
- [ ] Tegaskan peran `MobileBottomNav.tsx`
- [ ] Rapikan densitas visual `MobileMenu.tsx`
- [ ] Validasi pengalaman mobile secara menyeluruh

### Fase 3 - Footer
- [ ] Pangkas spacing dan dominasi tipografi di `SiteFooter.tsx`
- [ ] Selaraskan legal links dan social area

### Fase 4 - Integrasi
- [ ] Validasi konsistensi komposisi di `PublicSiteLayout.tsx`
- [ ] Review akhir ritme font, spacing, dan hirarki visual public layout

---

## 8. Catatan Implementasi

1. Jangan langsung mengecilkan semua elemen sekaligus; utamakan hirarki visual.
2. Mobile adalah breakpoint yang paling sensitif, jadi keputusan header harus berpijak pada keberadaan `MobileBottomNav`.
3. Gunakan `Container.tsx` sebagai acuan ritme horizontal agar header dan footer tetap terasa satu sistem.
4. Setelah implementasi tiap fase, lakukan review visual desktop, tablet, dan mobile.
5. Jika diperlukan, buat token tipografi khusus untuk public layout agar tidak terus bergantung pada angka ad-hoc di tiap komponen.

---

*Dokumen ini disusun sebagai rencana refactor/perapihan public layout sebelum perubahan kode dilakukan.*

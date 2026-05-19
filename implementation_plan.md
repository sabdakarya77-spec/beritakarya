# Rencana Implementasi: S-Tier Kategori Utama, Sub-menu & Kemitraan Footer (Revisi 2)

Rencana ini menetapkan struktur hierarki rubrik berita 12-poin gabungan (termasuk rubrik olahraga Piala Dunia & Timnas Garuda) beserta sub-menu detailnya, serta penambahan jalur bisnis formal di footer.

## Proposed Category Architecture (12-Point Menu)

Setiap kategori utama akan memiliki sub-menu dropdown dengan pemetaan slug API sebagai berikut:

1.  **Terbaru** (`Terbaru`) - Aliran berita real-time kronologis.
2.  **Nasional** (`Nasional`)
    *   Sub-menu: `Politik`, `Hukum & Keadilan`, `Pendidikan`, `Peristiwa`
3.  **Daerah** (`Daerah`)
    *   Sub-menu: `DKI Jakarta & Banten`, `Jawa Barat & Tengah`, `Jawa Timur & Bali`, `Sumatera & Kalimantan`, `Sulawesi & Papua`, `Kabar Desa`
4.  **Ekonomi** (`Ekonomi`)
    *   Sub-menu: `Makro & Keuangan`, `Bisnis & Saham`, `UMKM`, `Industrial`
5.  **Olahraga** (`Olahraga`)
    *   Sub-menu: `Piala Dunia`, `Timnas Garuda`, `Sepak Bola`, `Ragam Olahraga`
6.  **Teknologi** (`Teknologi`)
    *   Sub-menu: `Gadget & Review`, `AI & Inovasi`, `Startups & Digital`, `Game & Esports`
7.  **Opini** (`Opini`)
    *   Sub-menu: `Kolom & Esai`, `Tajuk Rencana`, `Wawancara`
8.  **Investigasi** (`Investigasi`)
    *   Sub-menu: `Laporan Investigasi`, `Sorotan Khusus`
9.  **Gaya Hidup** (`Lifestyle`)
    *   Sub-menu: `Wisata & Kuliner`, `Kesehatan & Wellness`, `Seni, Film & Fesyen`, `Otomotif`
10. **Advertorial** (`Advertorial`)
    *   Sub-menu: `Info Bisnis`, `Rilis Pers`
11. **Video** (`Video`)
    *   Sub-menu: `Dokumenter & Reportase`, `Galeri Foto`, `Podcast & Audio`
12. **🔖 Tersimpan** (`Tersimpan`) - Bookmark pengguna.

---

## User Review Required

> [!IMPORTANT]
> **Transparansi Advertorial:**
> Poin 10 (Advertorial) memisahkan konten komersial berbayar dari berita organik. Hal ini meningkatkan reputasi integritas jurnalistik situs di mata pembaca dan mesin pencari Google.
>
> **Mekanisme Navigasi Dropdown:**
> Di desktop, mengarahkan kursor (*hover*) pada kategori utama yang memiliki sub-menu akan membuka panel dropdown *glassmorphic* yang elegan. Di mobile, navigasi horizontal utama tetap menggunakan geser (*scroll*), tetapi akses sidebar menu akan menggunakan accordion list.

---

## Proposed Changes

### [MODIFY] [PublicSiteLayout.tsx](file:///d:/beritakarya/apps/web/components/layout/PublicSiteLayout.tsx)
- Ganti deklarasi array `categories` datar (`string[]`) menjadi array objek terstruktur `CategoryItem[]` berbasis visual name dan API slug.

### [MODIFY] [Navbar.tsx](file:///d:/beritakarya/apps/web/components/layout/Navbar.tsx)
- Perbarui tipe data `categories` pada properti menu.
- Implementasikan komponen dropdown hover di desktop menggunakan framer-motion untuk animasi panel sub-menu yang halus.
- Perbarui navigasi horizontal mobile untuk menyelaraskan item menu baru.

### [MODIFY] [SiteFooter.tsx](file:///d:/beritakarya/apps/web/components/layout/SiteFooter.tsx)
- Perbarui daftar tautan kategori agar menampilkan list terstruktur.
- Pada bagian **Informasi**, tambahkan tautan `/p/partnership` dengan label `"Kemitraan & Kerja Sama"` dan ubah `/p/ads` menjadi `"Info Iklan (Rate Card)"`.

### [MODIFY] [SiteHomePage.tsx](file:///d:/beritakarya/apps/web/components/pages/SiteHomePage.tsx)
- Sesuaikan pemrosesan query parameter `cat` agar mencocokkan slug kategori utama maupun sub-kategori ketika dipanggil oleh API backend.

---

## Verification Plan

### Automated Tests
- Validasi build: Jalankan perintah build lokal (`npm run build` atau `turbo run build`) untuk memastikan tidak ada kesalahan tipe TypeScript pada navigasi baru.

### Manual Verification
1.  **Aksi Hover Desktop:** Arahkan kursor ke Ekonomi, Olahraga, atau Teknologi, pastikan dropdown muncul halus dan sub-menu dapat diklik.
2.  **Filter API Berita:** Klik sub-kategori seperti "Piala Dunia" atau "UMKM", pastikan parameter URL berubah (`?cat=Piala%20Dunia` atau `?cat=UMKM`) dan data ter-update.
3.  **Tautan Footer Baru:** Periksa menu footer, pastikan teks "Kemitraan & Kerja Sama" muncul dan mengarah ke link `/p/partnership`.

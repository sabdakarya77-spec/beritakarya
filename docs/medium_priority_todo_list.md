# To-Do List Prioritas Sedang (🟡) — BeritaKarya Frontend Optimization

Berikut adalah daftar tugas berprioritas sedang (🟡) hasil audit frontend pada [beritakarya_frontend_audit.md](file:///home/nicholas/beritakarya/docs/beritakarya_frontend_audit.md). Tugas-tugas ini difokuskan pada perbaikan visual menengah, optimalisasi performa, responsivitas mobile, dan standardisasi transisi agar UX terasa lebih konsisten dan mulus.

---

## 🛠️ Daftar Tugas Prioritas Sedang

### 1. Animasi & Transisi (🟡)

- [x] **A-3: Perbaiki Transisi Navbar Collapse**
  - **Masalah:** Transisi `max-h` kasar menyebabkan layout shift kecil saat scroll karena tidak di-GPU-accelerate.
  - **Berkas Target:** [Navbar.tsx](file:///home/nicholas/beritakarya/apps/web/components/layout/Navbar.tsx)
  - **Solusi:** Ganti transisi `max-h` dengan Framer Motion `AnimatePresence` + `motion.div` (`animate={{ height: 'auto' }}` / `exit={{ height: 0 }}`) atau gunakan `transform: translateY(-100%)` yang lebih efisien.

- [x] **A-4: Terapkan Stagger Animation di Grid Cards**
  - **Masalah:** Grid "Fokus Redaksi" dan list berita muncul sekaligus sehingga terkesan kaku dan berat.
  - **Berkas Target:** [SiteHomePage.tsx](file:///home/nicholas/beritakarya/apps/web/components/pages/SiteHomePage.tsx)
  - **Solusi:** Berikan stagger `delay` prop ke `ScrollAnimate` atau `motion.div` dengan kalkulasi indeks (`i * 0.08`).

- [x] **A-5: Seragamkan Easing Menggunakan Token**
  - **Masalah:** Easing bercampur antara `ease-out`, custom cubic-bezier, dan default Framer Motion.
  - **Berkas Target:** [globals.css](file:///home/nicholas/beritakarya/apps/web/app/globals.css) & [ScrollAnimate.tsx](file:///home/nicholas/beritakarya/apps/web/components/ui/ScrollAnimate.tsx)
  - **Solusi:** Definisikan `--ease-fluent: cubic-bezier(0.16, 1, 0.3, 1)` di CSS dan sinkronkan transisi Tailwind serta Framer Motion untuk menggunakan token ini.

---

### 2. Tipografi (🟡)

- [x] **T-4: Terapkan `text-balance` secara Konsisten**
  - **Masalah:** Judul artikel/section yang terlalu panjang wrap dengan cara janggal (satu kata sendirian di baris terakhir).
  - **Berkas Target:** [globals.css](file:///home/nicholas/beritakarya/apps/web/app/globals.css) & [MagazineBentoHero.tsx](file:///home/nicholas/beritakarya/apps/web/components/berita/MagazineBentoHero.tsx)
  - **Solusi:** Tambahkan rule global `text-wrap: balance` untuk tag heading `h1, h2, h3` di globals.css.

---

### 3. Spacing & Layout (🟡)

- [x] **S-3: Ganti Accent Heading Kotak Solid (`h-6 w-6`)**
  - **Masalah:** Aksen merah di heading section berupa kotak solid terlihat sangat kaku dan kuno.
  - **Berkas Target:** [SiteHomePage.tsx](file:///home/nicholas/beritakarya/apps/web/components/pages/SiteHomePage.tsx)
  - **Solusi:** Ganti kotak solid dengan garis vertikal tipis yang lebih modern: `<span className="h-6 w-[3px] rounded-full bg-brand-red" />` atau gunakan icon Lucide secara konsisten.

- [x] **S-4: Standarisasi Ukuran Icon Sosial di Footer**
  - **Masalah:** Footer social icon menggunakan ukuran non-standar `h-[1.875rem] w-[1.875rem]` (30px).
  - **Berkas Target:** [SiteFooter.tsx](file:///home/nicholas/beritakarya/apps/web/components/layout/SiteFooter.tsx)
  - **Solusi:** Ganti ke ukuran standar Tailwind `h-8 w-8` (32px) agar lebih konsisten dan mudah di-override.

- [x] **S-5: Ganti `object-contain` ke `object-cover` pada Hero Gambar Artikel**
  - **Masalah:** Penggunaan `object-contain` pada hero image artikel meninggalkan letterbox kosong di sisi samping gambar portrait/landscape yang tidak sesuai rasio.
  - **Berkas Target:** [page.tsx (artikel)](file:///home/nicholas/beritakarya/apps/web/app/[site]/artikel/[slug]/page.tsx)
  - **Solusi:** Ganti ke `object-cover` dengan `aspect-[16/9]` atau `aspect-[3/2]`, dipadukan dengan alignment posisi dari `getHeroImagePosition()`.

---

### 4. Visual & Konsistensi (🟡)

- [x] **V-4: Konsistensi Warna `brand-red` Antara Light & Dark Mode**
  - **Masalah:** Light mode menggunakan `#B91C1C` (crimson gelap) sedangkan dark mode menggunakan `#EF4444` (merah terang), mengubah karakter brand.
  - **Berkas Target:** [globals.css](file:///home/nicholas/beritakarya/apps/web/app/globals.css)
  - **Solusi:** Selaraskan warna menjadi `#DC2626` untuk kedua mode, atau pastikan perbedaan warna hanya di tingkat lightness/kecerahan (bukan saturasi/hue).

- [x] **V-5: Integrasi BreakingNewsTicker ke LAYOUT_DIMENSIONS & Optimasi Marquee**
  - **Masalah:** Komponen `BreakingNewsTicker` tidak terdokumentasi di layout guide, berpotensi menimbulkan inkonsistensi posisi DOM.
  - **Berkas Target:** [BreakingNewsTicker.tsx](file:///home/nicholas/beritakarya/apps/web/components/ui/BreakingNewsTicker.tsx) & [Navbar.tsx](file:///home/nicholas/beritakarya/apps/web/components/layout/Navbar.tsx)
  - **Solusi:** Tambahkan detail posisinya ke dokumen [LAYOUT_DIMENSIONS.md](file:///home/nicholas/beritakarya/docs/LAYOUT_DIMENSIONS.md). Pastikan animasi marquee menggunakan CSS animation (bukan JS interval) agar ringan di perangkat low-end.

---

### 5. Mobile Experience (🟡)

- [x] **M-2: Gunakan Aspect Ratio untuk Bento Side Cards**
  - **Masalah:** Lompatan tinggi bento side cards dari `min-h-[120px]` ke `sm:min-h-[142px]` terasa patah saat resize screen.
  - **Berkas Target:** [MagazineBentoHero.tsx](file:///home/nicholas/beritakarya/apps/web/components/berita/MagazineBentoHero.tsx)
  - **Solusi:** Ganti `min-h` dengan `aspect-[3/2]` untuk mobile, atau atur dengan `aspect-ratio` fluid agar responsif secara alami.

- [x] **M-3: Buat Mobile Fallback untuk Sidebar "Akses Redaksi"**
  - **Masalah:** Di bawah breakpoint `lg`, sidebar "Akses Redaksi" (WA/Telegram/Email) hilang total padahal merupakan elemen penting untuk konversi pembaca.
  - **Berkas Target:** [SiteHomePage.tsx](file:///home/nicholas/beritakarya/apps/web/components/pages/SiteHomePage.tsx)
  - **Solusi:** Tambahkan layout compact (misal: horizontal scroll strip atau button group kompak) di bagian bawah feed khusus untuk tampilan mobile.

---

### 6. Performa & DX (🟡)

- [x] **P-1: Sesuaikan Viewport Margin pada ScrollAnimate**
  - **Masalah:** Dengan `margin: '-50px'`, animasi baru mulai ketika elemen hampir berada di tengah layar, terasa telat bagi user.
  - **Berkas Target:** [ScrollAnimate.tsx](file:///home/nicholas/beritakarya/apps/web/components/ui/ScrollAnimate.tsx)
  - **Solusi:** Ubah viewport margin menjadi `-120px` agar animasi terpicu sedikit lebih cepat sebelum elemen terlihat penuh oleh user.

- [x] **P-2: Kurangi Overhead Framer Motion pada NewsCard**
  - **Masalah:** Penggunaan `motion.article` pada setiap card dalam list panjang membebani memori dan bundle size.
  - **Berkas Target:** [NewsCard.tsx](file:///home/nicholas/beritakarya/apps/web/components/ui/NewsCard.tsx)
  - **Solusi:** Untuk card tipe `medium` dan `horizontal` yang berulang banyak, ganti dengan pure CSS transition (`transition-transform duration-200 hover:-translate-y-0.5`). Simpan Framer Motion khusus untuk hero cards.

---

## 📈 Rencana Eksekusi Terpadu (Fase Pengerjaan)

Untuk meminimalkan potensi konflik dan mempermudah proses review:

1. **Fase 1: Token & Global Styling (A-5, T-4, V-4)**
   - Fokus pada penyelarasan global CSS, easing token, `text-wrap: balance`, dan harmonisasi warna `brand-red`.
2. **Fase 2: Optimasi & Perbaikan Komponen (A-3, S-4, S-5, M-2, P-1, P-2)**
   - Update file-file komponen individual seperti `Navbar.tsx`, `NewsCard.tsx`, `MagazineBentoHero.tsx`, `ScrollAnimate.tsx`, `SiteFooter.tsx`, dan halaman artikel detail.
3. **Fase 3: Homepage & Fitur Mobile (A-4, S-3, V-5, M-3)**
   - Sesuaikan layout homepage, stagger grid animation, perbaikan visual heading accent, integrasi ticker, dan penyediaan fallback "Akses Redaksi" untuk mobile.

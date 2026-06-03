# To-Do List Prioritas Rendah / Nice-to-have (🟢) — BeritaKarya Frontend Optimization

Berikut adalah daftar tugas berprioritas rendah / nice-to-have (🟢) hasil audit frontend pada [beritakarya_frontend_audit.md](file:///home/nicholas/beritakarya/docs/beritakarya_frontend_audit.md). Tugas-tugas ini difokuskan pada pemolesan visual minor, kerapian kode, dan penyempurnaan pengalaman pengguna (UX) untuk memberikan sentuhan premium akhir pada BeritaKarya.

---

## 🛠️ Daftar Tugas Prioritas Rendah (Nice-to-have)

### 1. Animasi & Transisi (🟢)

- [ ] **A-6: Standardisasi Durasi Image Hover Scale**
  - **Masalah:** Durasi zoom image on hover berbeda-beda antar komponen (Hero lead menggunakan `duration-700`, side card menggunakan `duration-500`, dan `NewsCard` menggunakan `duration-500`). Hal ini membuat transisi terasa tidak seragam.
  - **Berkas Target:** 
    - [MagazineBentoHero.tsx](file:///home/nicholas/beritakarya/apps/web/components/berita/MagazineBentoHero.tsx)
    - [NewsCard.tsx](file:///home/nicholas/beritakarya/apps/web/components/ui/NewsCard.tsx)
  - **Solusi:** Satukan durasi transisi menjadi `duration-700` untuk semua efek zoom image on hover demi memberikan impresi majalah editorial yang konsisten dan elegan.

---

### 2. Tipografi (🟢)

- [ ] **T-5: Bersihkan Duplikasi Logika Drop Cap**
  - **Masalah:** Ada dua implementasi drop cap yang aktif bersamaan dan berpotensi tabrakan di `globals.css`:
    1. Otomatis (`article-content p:first-of-type::first-letter`)
    2. Manual via atribut (`p[data-drop-cap="true"]::first-letter`)
  - **Berkas Target:** 
    - [globals.css](file:///home/nicholas/beritakarya/apps/web/app/globals.css)
  - **Solusi:** Hapus implementasi otomatis yang pertama, dan pertahankan implementasi berbasis `data-drop-cap="true"` agar kontrol tata letak drop cap tetap berada di tangan editor secara granular.

---

### 3. Spacing & Layout (🟢)

- [ ] **S-6: Sesuaikan Spacing Margin Bottom Bento Hero di Mobile**
  - **Masalah:** Jarak bawah `mb-16` (64px) setelah bento hero terlalu besar dan boros whitespace di perangkat mobile (viewport kecil).
  - **Berkas Target:** 
    - [MagazineBentoHero.tsx](file:///home/nicholas/beritakarya/apps/web/components/berita/MagazineBentoHero.tsx)
  - **Solusi:** Ganti kelas margin bottom menjadi responsive: `mb-8 md:mb-14` agar visual spacing lebih seimbang di mobile.

---

### 4. Mobile Experience (🟢)

- [ ] **M-4: Tambahkan Overflow Handling untuk Trending Tag Pills di Mobile**
  - **Masalah:** Jika kategori/tag trending sangat banyak, layout `flex-wrap` bawaan akan memaksa tag membungkus ke bawah sehingga memenuhi layar mobile.
  - **Berkas Target:** 
    - [SiteHomePage.tsx](file:///home/nicholas/beritakarya/apps/web/components/pages/SiteHomePage.tsx)
  - **Solusi:** Pada tampilan mobile, ubah baris tag menjadi satu baris horizontal yang dapat digeser (`overflow-x-auto flex-nowrap scrollbar-none`), sementara pada desktop tetap menggunakan `flex-wrap`.

---

### 5. Performa & DX (🟢)

- [ ] **P-3: Verifikasi dan Integrasikan Loading Font Outfit**
  - **Masalah:** Font Inter di-import dengan benar, namun font Outfit (yang didefinisikan sebagai `font-sans` di Tailwind config) tidak memiliki deklarasi `@import` yang jelas di `globals.css` atau verifikasi preload di layout.
  - **Berkas Target:** 
    - [globals.css](file:///home/nicholas/beritakarya/apps/web/app/globals.css)
    - [tailwind.config.ts](file:///home/nicholas/beritakarya/apps/web/tailwind.config.ts)
  - **Solusi:** Verifikasi metode pemuatan font Outfit (misalnya melalui `next/font/google` di root layout dengan opsi `preload: true`), atau tambahkan `@import` eksternal di `globals.css` jika belum ter-preload untuk menghindari masalah FOUT (Flash of Unstyled Text).

---

## 📈 Rencana Eksekusi

Kita dapat mengeksekusi tugas-tugas ini secara berurutan:
1. **Pembersihan CSS & Font:** Menyelesaikan **T-5** (Drop Cap) dan **P-3** (Font Outfit).
2. **Poles Spacing & Responsivitas Mobile:** Menyelesaikan **S-6** (Bento Hero margin) dan **M-4** (Trending Tag Pills horizontal scroll).
3. **Penyelarasan Durasi Animasi:** Menyelesaikan **A-6** (Image Hover Scale `duration-700`).

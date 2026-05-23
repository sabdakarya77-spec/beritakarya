# UI/UX Priority Action Plan - BeritaKarya

**Tanggal:** 2026-05-23
**Status:** Draft kerja
**Tujuan:** Mengubah hasil audit UI/UX menjadi daftar aksi yang konkret, terurut, dan mudah dieksekusi.

---

## Ringkasan

Secara umum, frontend BeritaKarya sudah punya identitas visual yang kuat, terutama pada halaman artikel dan homepage. Nilai keseluruhan saat ini berada di kisaran **B+**, dengan potensi naik ke **A-** bila fokus perbaikannya diarahkan ke tiga hal:

1. **Trust**: navigasi harus benar, link harus hidup, CTA harus nyata.
2. **Clarity**: struktur halaman harus lebih mudah dipahami dalam 3-5 detik.
3. **Consistency**: pola visual, tindakan, dan konteks multi-site harus stabil.

Dokumen ini berisi prioritas perubahan yang direkomendasikan untuk 30 hari ke depan.

---

## Target Hasil

Jika item prioritas tinggi di dokumen ini dieksekusi dengan baik, dampak yang diharapkan:

- Homepage terasa lebih fokus dan tidak terlalu padat.
- Navigasi publik lebih dapat dipercaya.
- Dashboard lebih nyaman dipakai untuk kerja harian.
- Settings dan admin terasa lebih profesional, tidak melelahkan.
- Kualitas produk naik tanpa perlu mengubah DNA visual utama.

---

## Skala Prioritas

| Level | Makna |
|------|------|
| P1 | Harus dikerjakan dulu karena berdampak langsung ke trust dan usability inti |
| P2 | Penting untuk meningkatkan kualitas pengalaman secara nyata |
| P3 | Polish lanjutan setelah fondasi utama rapi |

## Estimasi Effort

| Level | Makna |
|------|------|
| S | Kecil, bisa selesai cepat |
| M | Sedang, perlu beberapa file atau pengujian ringan |
| L | Besar, perlu refactor atau validasi lintas halaman |

---

## P1 - Trust Dan Navigasi

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P1-01 | Link publik mengarah ke rute yang belum jelas seperti `/privacy`, `/terms`, `/cookies`, `/arsip`, `/bantuan` | User kehilangan trust karena navigasi terasa palsu atau putus | Ganti ke rute yang benar, buat halaman yang belum ada, atau sembunyikan dulu link yang belum siap | M | `apps/web/components/layout/SiteFooter.tsx`, `apps/web/components/layout/Navbar.tsx`, `apps/web/components/layout/MobileMenu.tsx` |
| P1-02 | Logo navbar dan footer masih kembali ke root `/` | Di arsitektur multi-site, user bisa terpental keluar konteks site aktif | Ubah semua logo agar mengarah ke `/${site}` aktif | S | `apps/web/components/layout/Navbar.tsx`, `apps/web/components/layout/SiteFooter.tsx` |
| P1-03 | Tombol dashboard di mobile menu hardcoded ke `/pusat/dashboard` | User regional bisa tersesat dan merasa sistem tidak konsisten | Gunakan site aktif dari context atau pathname | S | `apps/web/components/layout/MobileMenu.tsx` |
| P1-04 | CTA penting belum punya aksi nyata, seperti `Dukung Kami`, `Hubungi Support`, `Download Media Kit PDF` | UI terlihat bagus tetapi terasa belum selesai sebagai produk | Sambungkan ke flow nyata, misalnya halaman donasi, kontak support, atau URL media kit; bila belum ada, nonaktifkan sementara | M | `apps/web/components/layout/SiteFooter.tsx`, `apps/web/app/[site]/dashboard/page.tsx` |
| P1-05 | Elemen `Populer` di homepage terlihat seperti tab aktif padahal belum benar-benar bekerja | User mengira itu fitur interaktif, lalu kecewa saat tidak ada perubahan | Jadikan tab fungsional atau ubah tampilannya menjadi label biasa | M | `apps/web/components/pages/SiteHomePage.tsx` |

---

## P1 - Homepage Dan Discovery

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P1-06 | Homepage punya terlalu banyak blok unggulan sebelum user masuk ke feed utama | Cognitive load tinggi, user sulit tahu apa yang paling penting | Ringkas struktur awal jadi `hero -> fokus editor -> feed utama`; blok lain dipindah ke bawah atau dibuat kondisional | L | `apps/web/components/pages/SiteHomePage.tsx` |
| P1-07 | Sidebar kanan terlalu berat bila newsletter, populer, video, dan ads tampil bersamaan | Kompetisi perhatian terlalu tinggi dan halaman terasa penuh | Tentukan urutan prioritas sidebar dan batasi maksimal 2 modul utama per viewport | M | `apps/web/components/pages/SiteHomePage.tsx` |
| P1-08 | Strip `Trending` bagus secara visual tetapi belum terasa sebagai alat navigasi yang dominan | Discovery ada, tetapi nilai UX-nya belum maksimal | Tambahkan active state, heading yang lebih informatif, dan pertimbangkan hasil pencarian yang lebih jelas | M | `apps/web/components/pages/SiteHomePage.tsx` |

---

## P1 - Dashboard Usability

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P1-09 | Aksi penting di daftar artikel terlalu bergantung pada hover | Discoverability rendah, terutama bagi user baru | Tampilkan minimal 2 aksi utama tanpa hover, sisanya boleh masuk menu tambahan | M | `apps/web/app/[site]/dashboard/articles/page.tsx` |
| P1-10 | Dashboard overview membuat hampir semua kartu terasa sama pentingnya | User sulit tahu tindakan apa yang perlu dilakukan dulu | Tonjolkan 1-2 insight utama per role di area atas, sisanya jadi pendukung | M | `apps/web/app/[site]/dashboard/page.tsx`, `apps/web/components/dashboard/DashboardHeader.tsx`, `apps/web/components/dashboard/QuickActions.tsx` |
| P1-11 | Halaman settings terlalu padat, terlalu banyak efek visual, dan terlalu banyak teks mikro uppercase | Melelahkan dipakai untuk tugas administratif yang membutuhkan fokus | Sederhanakan treatment visual, naikkan readability, kelompokkan field kritikal dan field lanjutan lebih tegas | L | `apps/web/app/[site]/dashboard/settings/page.tsx` |
| P1-12 | Halaman admin terlalu dramatis untuk operasi CRUD rutin | Terasa berat dan kurang efisien untuk task operasional | Turunkan intensitas visual modal dan tabel, pertahankan kejelasan aksi | M | `apps/web/app/[site]/dashboard/admin/page.tsx` |

---

## P2 - Readability Dan Konsistensi Visual

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P2-01 | Terlalu banyak teks `9px-10px`, uppercase, dan tracking lebar | Keterbacaan turun, terutama di mobile dan dashboard | Tetapkan minimum ukuran label penting, gunakan uppercase hanya untuk metadata sekunder | M | `apps/web/app/globals.css`, `apps/web/components/layout/Navbar.tsx`, `apps/web/components/layout/SiteFooter.tsx`, `apps/web/app/[site]/dashboard/settings/page.tsx` |
| P2-02 | Efek pulse, bounce, glow, blur, dan shadow terlalu sering dipakai | Semua elemen berebut perhatian dan UI kehilangan hierarchy | Batasi animasi hanya untuk status penting, CTA utama, dan feedback | M | `apps/web/app/globals.css`, beberapa komponen dashboard dan homepage |
| P2-03 | Beberapa area mencampur tone premium editorial dengan tone admin operasional | Produk terasa belum punya bahasa visual yang disiplin per konteks | Definisikan aturan visual untuk `public editorial`, `dashboard operasional`, dan `admin system` | L | `apps/web/app/globals.css`, `apps/web/components/**`, `apps/web/app/[site]/dashboard/**` |

---

## P2 - Artikel Dan Editorial Experience

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P2-04 | Header artikel sedikit terlalu ramai sebelum user masuk ke isi | Fokus headline berkurang pada first read | Sederhanakan blok action dan metadata di atas body | M | `apps/web/app/[site]/artikel/[slug]/page.tsx` |
| P2-05 | Tombol share inline dan action utama belum sepenuhnya terasa satu sistem | Experience terasa terpisah-pisah | Konsolidasikan action `share`, `save`, `print`, `font size` dalam pola yang lebih konsisten | M | `apps/web/app/[site]/artikel/[slug]/page.tsx`, `apps/web/components/ui/ArticleActions.tsx`, `apps/web/components/ui/ShareSidebar.tsx` |
| P2-06 | Halaman info publik menggunakan slug terbatas, sementara footer menaut ke halaman legal yang berbeda | Arsitektur informasi terasa tidak sinkron | Samakan route footer dengan halaman info yang benar atau perluas map slug halaman info | M | `apps/web/components/layout/SiteFooter.tsx`, `apps/web/app/[site]/p/[slug]/page.tsx` |

---

## P2 - Mobile Experience

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P2-07 | Bottom navigation mobile sudah bagus tetapi belum benar-benar dibedakan antara pembaca dan user login | Beberapa CTA terasa terlalu maju untuk pembaca umum | Bedakan item nav berdasarkan status login dan role | M | `apps/web/components/layout/MobileBottomNav.tsx` |
| P2-08 | Mobile menu masih lebih mirip daftar link daripada pusat navigasi yang meyakinkan | Exploration terasa fungsional tetapi belum nyaman | Kelompokkan menu berdasarkan `baca`, `akun`, `kategori`, `lainnya` dengan hierarchy yang lebih kuat | M | `apps/web/components/layout/MobileMenu.tsx` |
| P2-09 | Font mikro pada mobile masih terlalu kecil di banyak titik | Readability dan tap confidence turun | Naikkan ukuran label kecil ke level yang aman untuk mobile | S | `apps/web/components/layout/MobileBottomNav.tsx`, `apps/web/components/layout/MobileMenu.tsx`, `apps/web/components/layout/Navbar.tsx` |

---

## P3 - Polish Dan Product Maturity

| ID | Masalah | Dampak UX | Solusi | Effort | File utama |
|------|------|------|------|------|------|
| P3-01 | Quick actions di dashboard masih berupa shortcut statis | Nilai produktivitas belum maksimal | Ubah menjadi action berbasis kondisi, misalnya review pending, draft belum selesai, KYC belum lengkap | M | `apps/web/components/dashboard/QuickActions.tsx`, `apps/web/app/[site]/dashboard/page.tsx` |
| P3-02 | Review queue belum membantu editor memprioritaskan antrean besar | Editor harus membaca satu per satu untuk menentukan prioritas | Tambahkan indikator urgensi seperti breaking, umur submit, author, dan kategori | M | `apps/web/app/[site]/dashboard/review/page.tsx` |
| P3-03 | Advertiser dashboard masih terasa placeholder | Persepsi produk monetisasi belum matang | Tambahkan state empty yang lebih nyata, CTA setup kampanye, dan onboarding langkah pertama | L | `apps/web/app/[site]/dashboard/page.tsx` |
| P3-04 | Belum ada dokumen aturan UI lintas konteks | Inkonsistensi akan terus berulang saat fitur bertambah | Buat mini design guideline untuk typography, label, card, motion, dan admin tone | M | `docs/` dan referensi implementasi di `apps/web/app/globals.css` |

---

## Rencana Eksekusi 30 Hari

### Minggu 1 - Perbaikan Trust

- Selesaikan semua link yang rusak atau belum valid.
- Betulkan semua arah logo dan route multi-site.
- Hidupkan atau nonaktifkan CTA palsu.
- Rapikan footer dan menu agar hanya menampilkan tujuan yang valid.

### Minggu 2 - Perapihan Homepage

- Kurangi jumlah blok unggulan di atas feed utama.
- Tegaskan hierarchy antara hero, trending, feed, sponsor, dan sidebar.
- Evaluasi ulang elemen yang terlihat interaktif tetapi belum berfungsi.

### Minggu 3 - Dashboard Clarity

- Tampilkan aksi utama tanpa hover.
- Ubah dashboard overview agar lebih fokus per role.
- Ringankan visual di halaman settings dan admin.

### Minggu 4 - Readability Dan Konsistensi

- Naikkan ukuran teks mikro.
- Kurangi uppercase berlebihan.
- Batasi animasi hanya pada elemen yang benar-benar butuh perhatian.
- Finalisasi aturan visual dasar untuk public, dashboard, dan admin.

---

## Rekomendasi Urutan File Untuk Dikerjakan

Urutan berikut direkomendasikan agar dampak terasa cepat:

1. `apps/web/components/layout/Navbar.tsx`
2. `apps/web/components/layout/SiteFooter.tsx`
3. `apps/web/components/layout/MobileMenu.tsx`
4. `apps/web/components/layout/MobileBottomNav.tsx`
5. `apps/web/components/pages/SiteHomePage.tsx`
6. `apps/web/app/[site]/dashboard/articles/page.tsx`
7. `apps/web/app/[site]/dashboard/page.tsx`
8. `apps/web/components/dashboard/QuickActions.tsx`
9. `apps/web/app/[site]/dashboard/settings/page.tsx`
10. `apps/web/app/[site]/dashboard/admin/page.tsx`
11. `apps/web/app/globals.css`

---

## Catatan Penutup

Masalah utama BeritaKarya saat ini bukan kurang bagus secara visual. Justru kekuatannya ada di karakter visual yang sudah terasa. Yang menahan grade naik adalah:

- terlalu banyak treatment visual di terlalu banyak tempat,
- navigasi yang belum sepenuhnya dapat dipercaya,
- dan pola UX yang belum selalu konsisten antar konteks.

Jika tim fokus pada dokumen ini, target realistis berikutnya adalah:

- **jangka pendek:** naik dari **B+** ke **A-**
- **jangka menengah:** mencapai pengalaman produk yang lebih matang, stabil, dan terasa premium tanpa berlebihan


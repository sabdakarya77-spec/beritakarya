# Rencana Penjelasan Istilah di Ruang Editor

## Latar Belakang

Ruang editor BeritaKarya sudah memiliki banyak fitur dan istilah yang kuat untuk workflow redaksi, tetapi tidak semua pengguna langsung memahami arti setiap menu, blok, label, atau status editorial.

Beberapa istilah seperti `blok`, `deck/excerpt`, `callout`, `embed`, `featured`, `breaking`, `exclusive`, `SEO`, `meta description`, dan status seperti `draft`, `review`, atau `approved` berpotensi membingungkan bagi reporter baru, kontributor, atau pengguna non-teknis.

Akibatnya:

- pengguna ragu memilih menu atau blok yang tepat
- pengguna tidak yakin fungsi sebuah field
- ada persepsi bahwa editor terasa rumit, padahal masalah utamanya adalah kurang konteks
- proses onboarding user baru menjadi lebih lambat

## Tujuan

Membuat istilah di ruang editor lebih mudah dipahami tanpa menambah beban visual berlebihan.

Target utamanya:

- pengguna cepat paham fungsi setiap istilah penting
- mengurangi trial and error saat menulis artikel
- meningkatkan rasa percaya diri pengguna saat memakai editor
- menjaga editor tetap rapi, cepat, dan tidak terasa seperti halaman dokumentasi

## Prinsip UX

Pendekatan yang akan dipakai:

- bantuan harus muncul dekat dengan konteksnya
- penjelasan harus singkat, jelas, dan memakai bahasa redaksi
- hindari definisi yang terlalu teknis
- satu istilah cukup dijelaskan dalam satu kalimat
- istilah penting boleh memakai label Indonesia yang lebih ramah
- penjelasan tambahan tidak boleh mengganggu flow menulis

## Ruang Lingkup Awal

Tahap awal difokuskan pada istilah yang paling sering dilihat pengguna di ruang editor.

Prioritas awal:

1. istilah di area judul dan excerpt
2. istilah di menu tambah blok
3. istilah di inspector editorial
4. istilah workflow seperti submit, review, approved, published
5. istilah SEO dasar

## Istilah Prioritas

Daftar istilah yang layak diberi penjelasan singkat:

- Judul
- Deck / Excerpt
- Blok
- Paragraf
- Heading
- Quote
- Callout
- Embed
- Gallery
- Image Grid
- Media Text
- Gambar Utama
- Kategori
- Tag
- Breaking
- Exclusive
- Featured
- Meta Title
- Meta Description
- Draft
- Kirim Review
- Review
- Revisi
- Disetujui
- Terbit

## Contoh Penjelasan Singkat

Contoh microcopy yang bisa dipakai:

- `Deck / Excerpt`: Ringkasan singkat isi berita untuk membantu pembaca memahami inti artikel.
- `Blok`: Unit penyusun artikel, seperti paragraf, gambar, kutipan, atau embed.
- `Callout`: Sorotan visual untuk menegaskan informasi penting atau catatan redaksi.
- `Embed`: Menyematkan video, posting media sosial, atau tautan interaktif ke artikel.
- `Featured`: Menandai artikel agar diprioritaskan tampil di area pilihan atau sorotan redaksi.
- `Meta Description`: Deskripsi singkat untuk mesin pencari dan preview tautan.
- `Kirim Review`: Mengirim draft ke redaksi untuk diperiksa sebelum diterbitkan.

## Bentuk Implementasi yang Disarankan

Beberapa opsi implementasi, dari yang paling ringan:

### Opsi 1: Helper Text

Tambahkan teks penjelas pendek di bawah field atau judul section.

Cocok untuk:

- Deck / Excerpt
- Gambar Utama
- Kategori dan Tag
- Meta Title
- Meta Description

Kelebihan:

- cepat dibuat
- mudah dipahami
- tidak perlu interaksi tambahan

Kekurangan:

- bisa membuat layout lebih padat jika terlalu banyak

### Opsi 2: Tooltip atau Info Icon

Tambahkan ikon `i` atau `?` di samping istilah, lalu tampilkan penjelasan saat hover atau click.

Cocok untuk:

- istilah teknis
- status editorial
- nama blok yang tidak umum

Kelebihan:

- hemat ruang
- penjelasan muncul hanya saat dibutuhkan

Kekurangan:

- kurang terlihat oleh pengguna yang tidak sadar ada tooltip

### Opsi 3: Empty State Guidance

Saat blok belum dipilih atau section masih kosong, tampilkan arahan singkat.

Cocok untuk:

- menu tambah blok
- panel editorial
- area SEO

Kelebihan:

- edukatif tanpa terasa seperti dokumentasi
- membantu user saat pertama kali memakai fitur

### Opsi 4: Bantuan Kontekstual Sekali Tampil

Tooltip onboarding atau hint yang muncul sekali untuk user baru lalu bisa ditutup.

Cocok untuk:

- pengguna pertama kali
- fitur editor yang kompleks

Kelebihan:

- efektif untuk onboarding

Kekurangan:

- perlu state penyimpanan agar tidak terus muncul

## Rekomendasi Implementasi Bertahap

Supaya ringan dan cepat dieksekusi, implementasi disarankan bertahap:

### Tahap 1

Tambahkan helper text pada istilah yang paling penting:

- Deck / Excerpt
- Gambar Utama
- Kategori
- Tag
- Meta Title
- Meta Description
- tombol Kirim Review

### Tahap 2

Tambahkan tooltip/info icon pada:

- nama blok
- istilah editorial flags
- istilah status workflow

### Tahap 3

Tambahkan onboarding ringan untuk user baru:

- pengenalan blok
- arti inspector editorial
- alur draft sampai publish

## Catatan Copywriting

Agar konsisten, microcopy sebaiknya:

- memakai bahasa Indonesia yang natural
- menjelaskan fungsi, bukan teori
- tidak lebih dari 12 sampai 20 kata jika memungkinkan
- tetap konsisten antara label, tooltip, dan helper text

Contoh arah penyederhanaan istilah:

- `Taxonomy` -> `Kategori dan Tag`
- `Featured` -> tetap `Featured`, tetapi diberi arti singkat
- `Callout` -> tetap `Callout`, tetapi diberi subtitle seperti "sorotan informasi"
- `Embed` -> bisa diberi bantuan "sematkan video atau tautan"

## Risiko Jika Tidak Dirancang

Beberapa risiko yang perlu dihindari:

- terlalu banyak tooltip sehingga terasa ramai
- helper text terlalu panjang dan membuat editor terasa berat
- istilah berubah-ubah antar halaman
- penjelasan tidak sesuai bahasa redaksi pengguna

## Langkah Pengerjaan Berikutnya

Checklist lanjutan yang bisa dikerjakan setelah dokumen ini:

1. petakan semua istilah di ruang editor yang tampil ke pengguna
2. tandai istilah yang paling sering membingungkan
3. tulis microcopy final untuk tiap istilah
4. tentukan mana yang memakai helper text dan mana yang memakai tooltip
5. implementasikan bertahap mulai dari area dengan impact tertinggi
6. uji ke beberapa user redaksi untuk melihat istilah mana yang masih membingungkan

## Status

Dokumen ini dibuat sebagai catatan awal agar ide penjelasan istilah di ruang editor tidak hilang dan bisa langsung dilanjutkan ke tahap desain atau implementasi.

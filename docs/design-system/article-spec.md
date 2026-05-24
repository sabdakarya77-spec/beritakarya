# Article Page Spec

## Objective

Article page BeritaKarya harus terasa seperti halaman baca editorial premium: tenang, fokus pada isi, disiplin dalam ritme vertikal, dan jelas dalam transisi dari metadata ke hero image, body artikel, interaksi pembaca, hingga discovery lanjutan.

## Grid

- Main container: `1160px max` via `max-w-container`
- Content gutter:
  - Mobile: `16px`
  - Tablet: `32px`
  - Desktop: `40px`
- Article layout:
  - Header shell: single editorial stage inside container
  - Content rail desktop: `tools / article / sidebar`
  - Main article body: `43rem -> 45rem max` for comfortable reading measure
  - Sidebar desktop: editorial utility rail only, not wider than needed

## Container Rules

- Semua shell publik wajib memakai `Container`
- Header artikel, hero image, body content, recommendation block, dan footer wajib sejajar pada satu garis container
- Floating tools desktop harus mengikuti layout article content, bukan `fixed` ke tepi viewport
- Sidebar hanya tampil pada desktop besar dan tidak boleh mendorong body artikel menjadi terlalu sempit

## Typography Scale

- Eyebrow/meta minimum: `11px`
- Headline article:
  - Mobile: `32px`
  - Tablet/Desktop: `40px -> 60px`
- Author/meta support text: `10px -> 11px`
- Body article: `16.8px -> 18px`
- Quote/editorial emphasis: lebih besar dari body, tetap nyaman dibaca

## Header Rules

- Metadata atas hanya menampilkan:
  - kategori
  - tanggal publish
- Hindari label generik seperti `Edisi Hari Ini` bila tidak membawa makna editorial yang nyata
- Headline wajib menjadi fokus utama sebelum reader tools dan utility lain
- Area author/meta bawah dibagi jelas:
  - kiri: identitas penulis
  - kanan: reading time, word count, bookmark
- Meta chips harus terasa refined, bukan seperti badge utilitas dashboard

## Hero Rules

- Hero image harus terasa flagship:
  - radius besar
  - frame rapi
  - caption tertata
- Caption dan credit foto harus hadir sebagai layer editorial, bukan sekadar text kecil tanpa ritme
- Hero tidak boleh lebih dominan dari headline, tetapi harus cukup kuat sebagai transisi ke body

## Body Rules

- Article body harus memakai reading measure yang stabil, idealnya `43rem -> 45rem`
- Paragraf, heading, quote, list, dan callout harus mengikuti satu sistem scale yang sama
- Font size control wajib benar-benar memengaruhi elemen body utama, bukan hanya wrapper
- Vertical spacing antar block harus terasa lega, tetapi tidak membentuk area kosong yang tak bertujuan

## Floating Tools

- Desktop only (`xl` ke atas)
- Posisi: menempel ke article content rail, bukan ke viewport kiri
- Isi utama:
  - font size
  - komentar
  - bagikan
  - print
- Panel tools harus visually belong ke rail:
  - radius konsisten
  - border konsisten
  - shadow konsisten
  - dark theme dan light theme harus sama-sama aman

## Sidebar Rules

- Sidebar article page berfungsi sebagai intelligence rail sekunder
- Urutan prioritas sidebar:
  - Bagikan & Simpan
  - Info Artikel
  - Kategori Terkait
  - Topik Terkait
  - Advertisement
- Sidebar tidak boleh mengulang fungsi utama yang sudah lebih tepat diletakkan di bawah artikel

## Comment And Recommendation Rules

- Setelah artikel selesai, ritme section harus jelas:
  - tags
  - komentar
  - rekomendasi artikel
- Hindari pesan komentar yang berulang atau terlalu defensif
- `Kategori Terkait` di sidebar dan `Rekomendasi Artikel` di bawah artikel harus punya peran berbeda
- Empty state harus singkat, jelas, dan tidak terasa seperti placeholder kasar

## Color Rules

- Base surface:
  - Light: `--bg-main` / `brand-surface`
  - Dark: `brand-dark` (`#020617`)
- Accent:
  - `brand-red` hanya untuk active state, CTA utama, dan emphasis penting
- Borders:
  - Light: `black/5` atau `black/10`
  - Dark: `white/5` atau `white/10`
- Hover state ikon sosial harus diuji di dua tema, terutama platform dengan warna netral seperti `X`

## Component Rules

- Major panels: `rounded-3xl` atau setara
- Reader tools rail: rounded besar, compact, premium
- Meta chips:
  - subtle border
  - soft background
  - tidak terlalu padat
- Bookmark, share, dan utility lain harus terasa satu keluarga visual

## Definition Of Done

- Header artikel jelas: kategori + tanggal, headline, author/meta
- Hero image premium dan caption tertata
- Body article nyaman dibaca pada desktop, tablet, dan mobile
- Floating tools desktop dekat dengan artikel dan berfungsi penuh
- Font size control benar-benar mengubah scale body article
- Sidebar memiliki fungsi sekunder yang jelas, tidak repetitif
- Comment section bersih, tidak mengulang pesan yang sama
- Recommendation flow setelah artikel terasa natural
- Light theme dan dark theme sama-sama stabil untuk hover, border, icon, dan panel

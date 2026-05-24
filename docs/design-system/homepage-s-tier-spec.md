# Homepage S-Tier Spec

## Objective

Homepage BeritaKarya harus terasa seperti front page editorial premium: jelas dalam hirarki, disiplin dalam container, dan memiliki ritme baca yang memandu pembaca dari headline utama ke stream berita lanjutan.

## Grid

- Main container: `1160px max` via `max-w-container`
- Content gutter:
  - Mobile: `16px`
  - Tablet: `32px`
  - Desktop: `40px`
- Homepage layout:
  - Hero shell: single editorial stage inside container
  - Main content area: `8/4` split on desktop
  - Feed cards: `2-up` for featured (Fokus Redaksi, Pilihan Editor), then `2-up grid` for Berita Lanjutan
  - Editorial extras: `3-up` or `4-up` grid for opinion, editor picks, photo, video blocks

## Container Rules

- Semua section publik wajib memakai `Container`
- Tidak boleh ada kombinasi baru `max-w-7xl`, `max-w-[1160px]`, atau width manual untuk shell homepage; gunakan token `max-w-container`
- Bleed hanya dipakai untuk modul yang memang perlu edge treatment, bukan sebagai solusi default alignment
- Header, ticker, homepage content, dan footer harus mengikuti garis container yang sama

## Typography Scale

- Display brand: `32px -> 51px`
- Section title: `30px -> 36px`
- Card title medium: `24px`
- Card title stream/horizontal: `20px`
- Body/deck: `14px -> 15px`
- Eyebrow/meta minimum: `11px`

## Section Order

1. Breaking ticker
2. Utility + brand navigation (Navbar)
3. Hero stage (Magazine Bento)
4. Fokus Redaksi (editorial picks without card container)
5. Trending (compact single-line tags)
6. Berita Lanjutan (2-column grid)
7. Sidebar intelligence:
   - Info Pasar (market widget)
   - Paling Populer
   - Partner Placement
8. Editorial extras (without card containers):
   - Pilihan Editor
   - Opini & Analisis
   - (Opsional) Foto Jurnalistik, Laporan Video
9. Footer (3-column layout, clean and professional)

## Visual Rhythm

- Hero harus menjadi area paling dominan di atas fold
- Setelah hero, wajib ada section transisi yang lebih ringan (Fokus Redaksi) sebelum masuk ke feed utama
- Feed utama tidak boleh hanya berupa grid berulang; harus ada perbedaan antara featured stories (Fokus Redaksi) dan stream stories (Berita Lanjutan)
- Sidebar harus berfungsi sebagai intelligence rail, bukan tumpukan widget acak
- **Editorial sections (Fokus Redaksi, Pilihan Editor, Opini, Berita Lanjutan) should be seamless without card containers**:
  - No border, no background color, no shadow, tampil clean tanpa batasan kotak
  - Tanpa kotak amber, tetap dengan efek hover shadow untuk interaktifitas
  - Menghilangkan kotak besar, menjadi grid tanpa batasan dengan styling yang tetap profesional
- Only ad slots and widgets should use card containers for clear separation

## Color Rules

- Base surface:
  - Light: `--bg-main` (#F8FAFC, off-white for better readability) / `brand-surface` (#F1F5F9)
  - Dark: `brand-dark` (#020617, Navy Slate, not pure black)
- Accent:
  - `brand-red` dipakai untuk intent, label penting, active state, dan CTA utama
- Inverse surface:
  - Dipakai hanya untuk ticker, sidebar widgets, and video block
- Borders:
  - Light: `black/5` atau `black/10`
  - Dark: `white/5` atau `white/10`
- Hindari mencampur terlalu banyak `gray-*`, `slate-*`, dan opacity random dalam satu section

## Component Rules

- Rounded system:
  - Major panels (ads, widgets): `rounded-3xl`
  - Buttons/chips: `rounded-xl` atau `rounded-full`
- Shadow system:
  - Dipakai hanya pada major cards/panels (ads, widgets)
  - Hover shadow tidak boleh lebih dominan dari hierarchy konten
- Tabs:
  - Aktif = white surface + red text
  - Nonaktif = muted text

## Definition Of Done

- Semua shell utama sejajar pada satu container system
- Tidak ada meta text penting di bawah `11px`
- Homepage memiliki minimal 3 level hierarchy: hero, featured feed, stream
- Sidebar memiliki fungsi editorial yang jelas (market info, popular, ads)
- Warna brand terasa tegas, bukan berisik
- Desktop, tablet, dan mobile tetap menjaga ritme yang sama
- **Editorial sections (Fokus Redaksi, Pilihan Editor, Opini, Berita Lanjutan) are seamless without card containers**:
  - Tanpa border, background, dan shadow, tampil clean tanpa batasan kotak
  - Tanpa kotak amber, tetap dengan efek hover shadow untuk interaktifitas
  - Menghilangkan kotak besar, menjadi grid tanpa batasan dengan styling yang tetap profesional
- Only ads and widgets use card containers for clear visual separation
- Footer is structured with 3 columns and clean professional styling

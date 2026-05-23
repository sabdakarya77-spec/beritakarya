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
  - Feed cards: `2-up` for featured, then `1-up stacked horizontal` for stream
  - Editorial extras: `3-up` grid for opinion, editor picks, photo, video blocks

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
2. Utility + brand navigation
3. Hero stage
4. Radar Redaksi
5. Radar Topik
6. Arus Berita utama
7. Sidebar intelligence:
   - Social distribution
   - Most popular
   - Quick access to newsroom
   - Video/ad module
8. Editorial extras:
   - Pilihan Editor
   - Opini & Analisis
   - Foto Jurnalistik
   - Laporan Video
9. Footer

## Visual Rhythm

- Hero harus menjadi area paling dominan di atas fold
- Setelah hero, wajib ada section transisi yang lebih ringan sebelum masuk ke feed utama
- Feed utama tidak boleh hanya berupa grid berulang; harus ada perbedaan antara featured stories dan stream stories
- Sidebar harus berfungsi sebagai intelligence rail, bukan tumpukan widget acak

## Color Rules

- Base surface:
  - Light: `white` / `brand-surface`
  - Dark: `brand-dark`
- Accent:
  - `brand-red` dipakai untuk intent, label penting, active state, dan CTA utama
- Inverse surface:
  - Dipakai hanya untuk ticker, social rail, dan video block
- Borders:
  - Light: `black/5` atau `black/10`
  - Dark: `white/5` atau `white/10`
- Hindari mencampur terlalu banyak `gray-*`, `slate-*`, dan opacity random dalam satu section

## Component Rules

- Rounded system:
  - Major panels: `rounded-3xl`
  - Buttons/chips: `rounded-xl` atau `rounded-full`
- Shadow system:
  - Dipakai hanya pada major cards/panels
  - Hover shadow tidak boleh lebih dominan dari hierarchy konten
- Tabs:
  - Aktif = white surface + red text
  - Nonaktif = muted text

## Definition Of Done

- Semua shell utama sejajar pada satu container system
- Tidak ada meta text penting di bawah `11px`
- Homepage memiliki minimal 3 level hierarchy: hero, featured feed, stream
- Sidebar memiliki fungsi editorial yang jelas
- Warna brand terasa tegas, bukan berisik
- Desktop, tablet, dan mobile tetap menjaga ritme yang sama

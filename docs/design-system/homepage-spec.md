# Homepage S-Tier Spec

## Objective

Homepage BeritaKarya harus terasa seperti front page editorial premium: jelas dalam hirarki, disiplin dalam container, dan memiliki ritme baca yang memandu pembaca dari headline utama ke stream berita lanjutan.

## Grid

- Main container: `1160px max` via `Container` component with `max-w-container` (default size)
- Container sizes:
  - `default`: `max-w-container` (1160px) - for general content
  - `content`: `max-w-content` (760px) - for reading-optimized content
  - `full`: `max-w-full` - for edge-to-edge sections
  - `bleed` prop: creates edge-to-edge effect extending to viewport edges
- Content gutter: handled responsively by Container component
- Homepage layout:
  - Hero shell: MagazineBentoHero with bento grid (lead 8-col + 3 side articles 4-col)
  - Main content area: `8/4` split on desktop (lg:col-span-8 main, lg:col-span-4 sidebar)
  - Featured feed: `2-up` grid (2 columns)
  - Berita Lanjutan: `2-up` grid (2 columns)
  - Editorial extras: `3-up` grid (3 columns)
  - Fokus Redaksi: `4-up` grid (4 columns on desktop)

## Container Rules

- Semua section publik wajib memakai `Container`
- Tidak boleh ada kombinasi baru `max-w-7xl`, `max-w-[1160px]`, atau width manual untuk shell homepage; gunakan token `max-w-container`
- Bleed hanya dipakai untuk modul yang memang perlu edge treatment, bukan sebagai solusi default alignment
- Header, ticker, homepage content, dan footer harus mengikuti garis container yang sama
- Container component telah distandarisasi dengan `size` prop dan `bleed` option

## Typography Scale

- Hero display title: `2.65rem` (42px) - xl breakpoint, `2.4rem` lg, `2.25rem` md, `2rem` sm, `1.75rem` mobile
- Section title: `2.2rem` md, `1.9rem` base
- Card title medium: `1.08rem` (17px) - `line-clamp-2`
- Card title (Fokus Redaksi): `0.95rem` lg, `0.9rem` mobile
- Body/deck: `14px -> 15px`
- Eyebrow/meta minimum: `10px -> 11px`

## Section Order

1. Breaking News Ticker (in PublicSiteLayout)
   - Full-width ticker dengan Breaking News label
   - Animasi horizontal scroll infinite
   - Background brand-red dengan Zap icon
2. Utility + brand navigation (Navbar - PublicSiteLayout)
   - Top utility bar (date, weather, theme toggle, saved articles count)
   - Main navbar dengan logo, category navigation, search, profile
   - Sticky header with blur backdrop on article pages
3. Leaderboard AdSpace (SiteHomePage)
   - Centered dalam rounded-3xl container dengan shadow
   - Border `border-black/5`, bg white, p-4 md:p-6
4. Hero stage - MagazineBentoHero
   - Bento grid: lead article (8 cols) + 3 side articles (4 cols)
   - Total height: 450px lg, 470px xl
   - Gradient overlay dari black/90 ke transparent
5. Fokus Redaksi
   - 4-column grid of NewsCard variant "medium"
   - Seamless tanpa card container (tanpa border, background, shadow)
   - Eyebrow dengan Zap icon + brand-red
6. Trending
   - Flex row dengan tag chips
   - Tags dengan `#` prefix, rounded-full, uppercase
7. Main Feed + Sidebar grid (8/4 split)
   - Featured Feed: 2-column grid dengan priority NewsCard
   - Inline Sponsor Ad (in-feed): muncul jika mainFeed > 3 items
   - Berita Lanjutan: 2-column grid dengan NewsCard variant "medium"
8. Sidebar intelligence rail:
   - Akses Redaksi widget (WhatsApp, Telegram, Email links)
   - Paling Populer (5 articles dengan numbered ranking)
   - Info Pasar (IHSG, USD/IDR, Emas with live indicators)
   - Partner Placement atau Pilihan Visual (VideoWidget)
9. Editorial extras (tanpa card containers, seamless):
   - Pilihan Editor (3-column grid)
   - Opini & Analisis (3-column grid dengan author info)
   - Foto Jurnalistik (3-column grid dengan overlay style)
   - Laporan Video Eksklusif (3-column grid dengan dark bg slate-950)
10. SiteFooter (PublicSiteLayout - 3-column layout)

## Visual Rhythm

- Hero harus menjadi area paling dominan di atas fold
- Setelah hero, wajib ada section transisi yang lebih ringan (Fokus Redaksi) sebelum masuk ke feed utama
- Feed utama tidak boleh hanya berupa grid berulang; harus ada perbedaan antara featured stories (Fokus Redaksi) dan stream stories (Berita Lanjutan)
- Sidebar harus berfungsi sebagai intelligence rail, bukan tumpukan widget acak
- **Editorial sections (Fokus Redaksi, Pilihan Editor, Opini, Berita Lanjutan) should be seamless without card containers**:
  - No border, no background color, no shadow, tampil clean tanpa batasan kotak
  - Hover shadow pada Pilihan Editor untuk interaktifitas
  - Menghilangkan kotak besar, menjadi grid tanpa batasan dengan styling yang tetap profesional
- Only ad slots and widgets should use card containers for clear separation

## Color Rules

- Base surface:
  - Light: `bg-[var(--bg-main)]` / `bg-white`
  - Dark: `dark:bg-[#020617]` (Navy Slate, not pure black)
- Accent:
  - `brand-red` (customizable per site via CSS property `--brand-red`, default `#e11d48`) untuk intent, label penting, active state, dan CTA utama
- Inverse surface:
  - Dipakai untuk ticker (brand-red bg), video section (slate-950), sidebar dark panels
- Borders:
  - Light: `border-black/5` atau `border-black/10`
  - Dark: `border-white/5` atau `border-white/10`
- Shadow system:
  - Major panels (ads, widgets): `shadow-[0_18px_42px_rgba(15,23,42,0.05)]` atau `shadow-[0_28px_56px_rgba(2,6,23,0.26)]`
  - Hover shadow pada Pilihan Editor: `hover:shadow-xl`

## Component Rules

- Rounded system:
  - Major panels (ads, widgets): `rounded-3xl`
  - Cards/articles: `rounded-2xl`
  - Buttons/chips: `rounded-xl` atau `rounded-full`
- Shadow system:
  - Dipakai hanya pada major cards/panels (ads, widgets)
  - Hover shadow tidak boleh lebih dominan dari hierarchy konten
- Tabs:
  - Aktif = white surface + red text
  - Nonaktif = muted text

## Specific Component Details

### MagazineBentoHero
- Grid: `lg:grid-cols-12` dengan `lg:col-span-8` (lead) + `lg:col-span-4` (side stack)
- Lead article height: `h-[300px]` mobile, full `lg:h-full`
- Side articles: `min-h-[142px] flex-1`
- Image positioning calculated based on aspect ratio

### NewsCard
- Variants: default (large), "medium" (for grids)
- Shows: featuredImage, category badge, title, excerpt, author, date
- Category colors via `getCategoryColor()` function

### BreakingNewsTicker
- Full-width dengan brand-red label
- Motion animation: horizontal scroll 40s infinite loop
- Gradient overlays on left/right edges

### Sidebar Widgets
- Akses Redaksi: dark slate-950 bg dengan emerald/sky accent borders
- Paling Populer: white bg dengan numbered ranking (01-05)
- Info Pasar: white bg dengan market data (IHSG, USD/IDR, Emas)
- Video/Partner: conditional display based on siteSettings

## Definition Of Done

- Semua shell utama sejajar pada satu container system
- Tidak ada meta text penting di bawah `10px`
- Homepage memiliki minimal 3 level hierarchy: hero, featured feed, stream
- Sidebar memiliki fungsi editorial yang jelas (market info, popular, contact)
- Warna brand terasa tegas, bukan berisik (customizable `--brand-red` per site)
- Desktop, tablet, dan mobile tetap menjaga ritme yang sama
- **Editorial sections (Fokus Redaksi, Pilihan Editor, Opini, Berita Lanjutan) are seamless without card containers**:
  - Tanpa border, background, dan shadow, tampil clean tanpa batasan kotak
  - Hover shadow pada Pilihan Editor untuk interaktifitas
  - Menghilangkan kotak besar, menjadi grid tanpa batasan dengan styling yang tetap profesional
- Only ads and widgets use card containers for clear visual separation
- Footer is structured with 3 columns (brand, categories, partnership) and clean professional styling

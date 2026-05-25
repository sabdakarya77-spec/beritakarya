# Public Ads Page Spec - `/[site]/p/ads`

## Objective

Halaman informasi layanan iklan publik yang menampilkan paket iklan yang tersedia untuk advertiser. Halaman ini berfungsi sebagai **catalog tanpa harga** - harga dan proses booking dilakukan di dashboard.

## Relationship

- **Dashboard `/dashboard/ads`** → Superadmin membuat paket iklan
- **Public Page `/p/ads`** → Menampilkan paket untuk advertiser (tanpa harga)
- **Order Page `/dashboard/ads/order`** → Proses booking + harga terlihat

## Layout Structure

```
Container (max-w-6xl)
├── Page Header
│   ├── Eyebrow: "Halaman Informasi" dengan dot marker
│   └── Title: "Layanan Iklan Mandiri"
│   └── Subtitle: Deskripsi value proposition
│
├── Value Propositions (3-column grid)
│   └── Card: Icon + Title + Description
│       - Trafik Regional Murni
│       - Gambar & Video Banner
│       - Transparansi Performa
│
├── Package Section
│   ├── Section Header
│   │   ├── Eyebrow: "Slot Iklan" dengan dot marker
│   │   └── Title: "Pilihan Paket Iklan"
│   │   └── Subtitle: "Format standar Dewan Pers & IAB Indonesia"
│   │
│   └── Package Grid (2-column on md, responsive)
│       └── Package Card (per paket dari API):
│           ├── Header: Icon + Badge "Paket"
│           ├── Package Name
│           ├── Description (dari DB atau fallback slot desc)
│           ├── Specifications List:
│           │   ├── Ukuran (dari SLOT_CONFIG)
│           │   ├── Format (dari DB: allowedFormat)
│           │   └── Durasi: X Hari (dari DB)
│           ├── Mockup Placeholder
│           └── Footer:
│               ├── Info: "Durasi: X Hari"
│               └── CTA: "Pesan Paket" → /dashboard/ads/order
│
├── Call to Action Section
│   └── Dark bg (bg-[#020617]) rounded-3xl
│       ├── Title: "Siap Meluncurkan Kampanye Iklan Anda?"
│       ├── Description
│       └── Buttons:
│           ├── "Daftar Sebagai Pengiklan" → /register?role=advertiser
│           └── "Masuk Portal Mitra" → /login
│
└── Terms & Conditions Section
    └── Eyebrow + Title
    └── Content dari DB (siteSettings.advertising)
```

## Container Rules

- Semua section publik wajib memakai `Container`
- `Container size="default"` (max-w-container / 1160px)
- Padding: `py-16 md:py-20`

## Design Tokens

### Border & Radius
- Card containers: `rounded-2xl`
- CTA section: `rounded-3xl`
- Mockup placeholder: `rounded-xl`
- Badge: `rounded-full`

### Colors
- Background: `bg-white` / `dark:bg-white/[0.02]`
- Border: `border-black/5` / `dark:border-white/5`
- Shadow: `shadow-[0_18px_42px_rgba(15,23,42,0.05)]`
- Hover shadow: `shadow-[0_24px_48px_rgba(15,23,42,0.08)]`
- CTA bg: `bg-[#020617]` (dark navy, not pure black)
- CTA border: `border-white/5`

### Typography
- Page title: `text-3xl md:text-4xl lg:text-5xl font-serif font-black`
- Section title: `text-2xl md:text-3xl font-serif font-black`
- Card title: `text-lg font-black`
- Body: `text-sm`
- Meta: `text-[10px] font-black uppercase`

## API Integration

### Fetch Packages
```typescript
async function getAdPackages(site: string): Promise<AdPackage[]> {
  const res = await fetch(`${apiUrl}/api/v1/ads/packages?site=${site}`)
  return res.data?.filter((pkg: AdPackage) => pkg.isActive) || []
}
```

### Package Interface
```typescript
interface AdPackage {
  id: string
  name: string
  slot: string           // 'leaderboard' | 'rectangle' | 'rectangle_secondary' | 'in_feed'
  allowedFormat: string  // 'ALL' | 'IMAGE' | 'VIDEO' | etc
  durationDays: number
  price: string         // TIDAK ditampilkan di public page
  description: string | null
  isActive: boolean
}
```

### Slot Config (Fallback Descriptions)
```typescript
const SLOT_CONFIG: Record<string, { name: string; size: string; desc: string; icon: any }> = {
  leaderboard: { name: 'Leaderboard Atas', size: '970 x 90 px / Mobile: 320 x 50 px', ... },
  rectangle: { name: 'Sidebar Rectangle Utama', size: '300 x 250 px', ... },
  rectangle_secondary: { name: 'Sidebar Rectangle Sekunder', size: '300 x 250 px', ... },
  in_feed: { name: 'In-Feed Homepage', size: '300 x 250 px', ... },
}
```

## Section Details

### 1. Value Proposition Cards
- 3-column grid: `grid-cols-1 md:grid-cols-3`
- Gap: `gap-6 md:gap-8`
- Hover effect: `hover:-translate-y-1`

### 2. Package Cards
- 2-column grid: `grid-cols-1 md:grid-cols-2`
- Grouped by slot type
- Shows: name, description, duration, size specs
- **Price: NOT displayed**
- CTA links to dashboard order page

### 3. CTA Section
- Dark background: `bg-[#020617]`
- Gradient overlay: `from-brand-red/10 to-transparent`
- Buttons: primary (brand-red) + secondary (white/5)

### 4. Terms Section
- Border top divider
- Content from `siteSettings.advertising`
- Fallback message if empty

## Definition Of Done

- [x] Fetch packages from API dynamically
- [x] Filter only `isActive: true` packages
- [x] Group packages by slot type
- [x] Display duration (NOT price) on public page
- [x] Link to dashboard order page with package ID
- [x] Consistent design tokens with other public pages
- [x] Responsive grid layout
- [x] Fallback UI when no packages available

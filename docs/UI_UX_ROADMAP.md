# UI/UX Roadmap — BeritaKarya (S-Tier)

| Field | Nilai |
|-------|--------|
| **Versi** | 1.0.0 |
| **Terakhir diperbarui** | 25 Mei 2026 |
| **Status** | Living document — centang item saat selesai & verifikasi |
| **Terkait** | [AUDIT_SISTEM.md](../AUDIT_SISTEM.md), [layout-system.md](./design-system/layout-system.md), [homepage-s-tier-spec.md](./design-system/homepage-s-tier-spec.md), [article-spec.md](./design-system/article-spec.md) |

---

## Cara memakai checklist ini

1. Centang dengan mengubah `- [ ]` menjadi `- [x]` di file ini (atau di PR description).
2. Item bertanda **(verifikasi)** wajib dicek manual di browser (desktop + mobile) sebelum dicentang.
3. Item bertanda **(CI)** harus hijau di pipeline sebelum dicentang.
4. Jangan centang “sudah ada komponen” jika belum memenuhi **Definition of Done** di spec terkait.

**Legenda prioritas:** `P0` minggu ini · `P1` 2–4 minggu · `P2` 1–2 bulan · `P3` backlog

---

## Progress ringkas

| Fase | Judul | Progress |
|------|--------|----------|
| A | Fondasi & design system | _0 / 24_ |
| B | Homepage S-Tier | _0 / 32_ |
| C | Halaman artikel | _0 / 28_ |
| D | Discovery & navigasi | _0 / 18_ |
| E | Dashboard & CMS | _0 / 26_ |
| F | Aksesibilitas | _0 / 20_ |
| G | Performance & perceived quality | _0 / 16_ |
| H | Design ops & QA | _0 / 14_ |

> **Tip:** Update angka di tabel atas setiap sprint.

---

## Fase A — Fondasi & design system

### A.1 Dokumentasi & token (sudah dimulai)

- [x] `docs/design-system/layout-system.md` — Container & token layout
- [x] `docs/design-system/homepage-s-tier-spec.md`
- [x] `docs/design-system/article-spec.md`
- [x] CSS custom properties di `apps/web/app/globals.css` (brand, container, status)
- [x] `tailwind.config.ts` — token `max-w-container`, spacing container
- [x] Komponen `Container` + unit test (`Container.test.tsx`)
- [x] ESLint `no-restricted-syntax` — paksa Container di halaman publik
- [ ] **P0** Satu dokumen indeks **Design System v1** (link ke semua spec + aturan warna/font)
- [ ] **P0** Selaraskan font: pilih satu pasangan final (hindari drift Inter vs Outfit di CSS/Tailwind) **(verifikasi)**
- [ ] **P1** Token semantik: `text-muted`, `surface-elevated`, `border-subtle` (ganti `gray-*` ad-hoc di page)
- [ ] **P1** Dukungan `appearance.primaryColor` per site di komponen (bukan hanya settings API)

### A.2 Primitives (belum ada — inti S-tier)

- [ ] **P0** `Button` — variant: primary, secondary, ghost, danger, link
- [ ] **P0** `Input`, `Textarea`, `Label`, `FieldError`
- [ ] **P0** `Select` — aksesibel (keyboard + screen reader)
- [ ] **P1** `Dialog` / `Sheet` — konfirmasi hapus, modal KYC
- [ ] **P1** `DropdownMenu` — aksi tabel artikel
- [ ] **P1** `Tabs` — settings & filter (aktif = surface putih + teks merah per spec)
- [ ] **P1** `Badge` / `Chip` — selaraskan dengan `StatusBadge` & kategori
- [ ] **P2** Adopsi Radix UI atau shadcn/ui sebagai base (opsional, disarankan)
- [ ] **P2** Aturan: halaman baru hanya import dari `components/ui/primitives/`

### A.3 Storybook & katalog

- [ ] **P1** Storybook terpasang di monorepo (`apps/web`)
- [ ] **P1** Story: `Container` (default, content, bleed)
- [ ] **P1** Story: `NewsCard`, `MagazineBentoHero`, `StatusBadge`
- [ ] **P2** Story: semua primitives
- [ ] **P2** Chromatic / visual review on PR (opsional)

---

## Fase B — Homepage S-Tier

> Acuan: [homepage-s-tier-spec.md](./design-system/homepage-s-tier-spec.md) · Implementasi: `SiteHomePage.tsx`, `MagazineBentoHero.tsx`

### B.1 Grid & container

- [x] `SiteHomePage` memakai `Container`
- [x] Komponen `MagazineBentoHero` ada
- [ ] **P0** Tidak ada `max-w-7xl` / `max-w-[1160px]` manual di shell homepage publik **(verifikasi)**
- [ ] **P0** Gutter: 16px / 32px / 40px sesuai breakpoint **(verifikasi)**
- [ ] **P0** Layout desktop: area utama `8/4` (konten + sidebar) **(verifikasi)**
- [ ] **P1** Header, ticker, konten, footer sejajar satu garis container **(verifikasi)**
- [ ] **P1** Bleed hanya untuk modul yang memang perlu edge treatment

### B.2 Urutan section (spec § Section Order)

- [ ] **P0** 1. Breaking ticker (`BreakingNewsTicker`) **(verifikasi)**
- [ ] **P0** 2. Navbar **(verifikasi)**
- [ ] **P0** 3. Hero — Magazine Bento, dominan above the fold **(verifikasi)**
- [ ] **P0** 4. Fokus Redaksi — tanpa card container **(verifikasi)**
- [ ] **P0** 5. Trending — tag satu baris ringkas **(verifikasi)**
- [ ] **P0** 6. Berita Lanjutan — grid 2 kolom **(verifikasi)**
- [ ] **P0** 7. Sidebar: Info Pasar, Paling Populer, Partner/iklan **(verifikasi)**
- [ ] **P1** 8. Pilihan Editor, Opini & Analisis (tanpa card) **(verifikasi)**
- [ ] **P2** 8b. Foto Jurnalistik / Laporan Video (opsional) **(verifikasi)**
- [ ] **P0** 9. Footer 3 kolom profesional (`SiteFooter`) **(verifikasi)**

### B.3 Tipografi & warna

- [ ] **P0** Display brand ≈ 32px → 51px responsif **(verifikasi)**
- [ ] **P0** Section title ≈ 30px → 36px **(verifikasi)**
- [ ] **P0** Meta/eyebrow tidak di bawah 11px untuk teks penting **(verifikasi)**
- [ ] **P1** Body/deck 14px → 15px **(verifikasi)**
- [ ] **P1** `brand-red` hanya untuk intent/CTA/active — tidak berlebihan **(verifikasi)**
- [ ] **P1** Kurangi campuran acak `gray-*` / `slate-*` dalam satu section

### B.4 Visual rhythm & editorial sections

- [ ] **P0** Minimal 3 level hierarchy: hero → featured → stream **(verifikasi)**
- [ ] **P0** Fokus Redaksi terasa “transisi ringan” setelah hero **(verifikasi)**
- [ ] **P0** Fokus Redaksi / Pilihan Editor / Opini / Berita Lanjutan: tanpa border/bg/shadow default **(verifikasi)**
- [ ] **P0** Hover shadow halus pada item editorial (tidak dominan dari hierarchy) **(verifikasi)**
- [ ] **P0** Hanya iklan & widget memakai card container (`rounded-3xl`, shadow) **(verifikasi)**
- [ ] **P1** Sidebar = intelligence rail, bukan tumpukan widget acak **(verifikasi)**

### B.5 Definition of Done — Homepage (centang semua untuk “S-Tier homepage”)

- [ ] Semua shell utama sejajar pada satu container system
- [ ] Tidak ada meta text penting di bawah 11px
- [ ] Homepage punya hero, featured feed, stream
- [ ] Sidebar: market, populer, ads — fungsi jelas
- [ ] Warna brand tegas, tidak berisik
- [ ] Ritme sama di desktop, tablet, mobile
- [ ] Section editorial seamless; hanya ads/widget pakai card
- [ ] Footer 3 kolom rapi

---

## Fase C — Halaman artikel (reading experience)

> Acuan: [article-spec.md](./design-system/article-spec.md) · `apps/web/app/[site]/artikel/[slug]/page.tsx`

### C.1 Layout & container

- [x] `Container` dipakai di halaman artikel
- [x] `ReadingProgress` ada
- [x] `FontSizeControl` ada
- [ ] **P0** Shell header, hero, body, rekomendasi, footer sejajar container **(verifikasi)**
- [ ] **P0** Body measure stabil ~43–45rem (`Container size="content"`) **(verifikasi)**
- [ ] **P1** Rail desktop: tools / artikel / sidebar (spec) **(verifikasi)**
- [ ] **P1** Floating tools menempel ke rail artikel, bukan fixed ke viewport kiri **(verifikasi)**

### C.2 Header & hero

- [ ] **P0** Metadata atas: kategori + tanggal publish saja **(verifikasi)**
- [ ] **P0** Headline fokus utama (mobile 32px+, desktop 40–60px) **(verifikasi)**
- [ ] **P0** Author kiri · reading time / bookmark kanan **(verifikasi)**
- [ ] **P0** Hero image: radius besar, frame rapi, caption + credit **(verifikasi)**
- [ ] **P1** Hapus label generik tanpa nilai editorial (mis. “Edisi Hari Ini”) **(verifikasi)**

### C.3 Body & tipografi

- [x] Drop cap & gaya `.article-content` di `globals.css`
- [ ] **P0** Font size control memengaruhi elemen body utama, bukan hanya wrapper **(verifikasi)**
- [ ] **P0** Spacing vertikal antar blok konsisten **(verifikasi)**
- [ ] **P1** Pull quote / blockquote sesuai spec **(verifikasi)**
- [ ] **P1** Blok editor (gambar, list, grid) rapi di mobile **(verifikasi)**

### C.4 Tools, sidebar, pasca-artikel

- [ ] **P1** Floating tools desktop (xl+): font, komentar, bagikan, print **(verifikasi)**
- [ ] **P1** Sidebar: Bagikan & Simpan → Info Artikel → Kategori Terkait → Topik → Iklan **(verifikasi)**
- [ ] **P1** Sidebar tidak duplikasi fungsi blok bawah artikel **(verifikasi)**
- [ ] **P0** Urutan bawah artikel: tags → komentar → rekomendasi **(verifikasi)**
- [ ] **P1** Empty state komentar singkat & manusiawi **(verifikasi)**
- [ ] **P1** “Kategori Terkait” (sidebar) vs “Rekomendasi Artikel” (bawah) peran berbeda **(verifikasi)**

### C.5 Definition of Done — Artikel

- [ ] Header: kategori + tanggal, headline, author/meta
- [ ] Hero premium + caption tertata
- [ ] Body nyaman di desktop, tablet, mobile
- [ ] Floating tools desktop berfungsi penuh
- [ ] Font size control mengubah scale body
- [ ] Sidebar sekunder jelas, tidak repetitif
- [ ] Komentar bersih, tidak pesan defensif berulang
- [ ] Alur rekomendasi natural
- [ ] Light & dark theme stabil (hover, border, icon)

---

## Fase D — Discovery & navigasi publik

### D.1 Pencarian & kategori

- [ ] **P1** `FullScreenSearch`: shortcut keyboard (`/` atau `Ctrl+K`) **(verifikasi)**
- [ ] **P1** Skeleton + empty state hasil pencarian
- [ ] **P1** Halaman kategori: breadcrumb konsisten
- [ ] **P2** Highlight query di hasil (jika Meilisearch aktif)

### D.2 Multisite & identitas edisi

- [ ] **P1** Indikator edisi aktif (“Anda membaca: {nama site}”) di navbar **(verifikasi)**
- [ ] **P1** Subdomain / `?site=` perilaku jelas untuk tester **(verifikasi)**
- [ ] **P2** Halaman indeks semua edisi (jika multisite publik)

### D.3 Halaman pendukung

- [ ] **P1** Penulis (`penulis/[id]`): profil + daftar artikel dengan hierarchy jelas
- [ ] **P1** Halaman statis (`p/[slug]`): kebijakan, tentang — typography konsisten
- [ ] **P2** `SavedArticlesFeed` / bookmark: UX login & empty state

### D.4 Auth publik (login/register)

- [ ] **P1** Login/register memakai primitives `Button` / `Input`
- [ ] **P1** Error state jelas (bukan hanya alert generik)
- [ ] **P2** Redirect reader vs staff setelah login selaras role

---

## Fase E — Dashboard & editor (CMS)

### E.1 Shell dashboard

- [x] Layout dashboard dengan sidebar + role guard
- [x] KYC gatekeeping untuk reporter/kontributor/wapimred
- [ ] **P0** Middleware Next.js: guard `/{site}/dashboard` (server-side) — lihat AUDIT F-H01
- [ ] **P1** Navigasi sidebar: 2 level + collapse; menu per role
- [ ] **P1** Ganti `max-w-7xl` manual di halaman dashboard dengan layout token konsisten
- [ ] **P1** Dark mode dashboard stabil (kartu, border, chart)
- [ ] **P2** Breadcrumb + judul halaman konsisten

### E.2 Daftar & workflow artikel

- [ ] **P0** Tabel artikel: filter status, sort, pagination
- [ ] **P1** Status pill memakai `StatusBadge` / token workflow
- [ ] **P1** Pipeline visual: draft → review → published (satu glance)
- [ ] **P1** Approve/reject dengan alasan wajib + notifikasi ke penulis
- [ ] **P1** Kalender selaras dengan artikel `scheduled`
- [ ] **P2** Bulk actions (archive, assign editor)

### E.3 Editor blok

- [x] Editor canvas + blok + inspector
- [x] `ReadinessSummary`, `AIConsentModal`, `useKeyboardShortcuts`
- [ ] **P0** Indikator autosave (“Tersimpan · HH:mm”)
- [ ] **P1** Onboarding tour 60 detik (reporter baru)
- [ ] **P1** Cheat sheet keyboard (`?`)
- [ ] **P1** AI sidebar: quota visible, tidak menutupi canvas
- [ ] **P2** Mobile: mode read-only / approve-only + pesan “gunakan desktop untuk menulis”

### E.4 Halaman berat (refactor UX)

- [ ] **P1** Settings: pecah tab (Umum, Editorial, Legal, SEO, Integrasi) — file saat ini sangat besar
- [ ] **P1** Media library: grid + upload progress + filter
- [ ] **P1** KYC review: alur dokumen jelas untuk wapimred
- [ ] **P2** Admin AI usage: chart terbaca + export

### E.5 Mikro-UX dashboard

- [ ] **P1** Semua loading pakai `Skeleton`
- [ ] **P1** Toast standar untuk sukses/gagal (selaraskan `Toaster`)
- [ ] **P1** Empty state dengan CTA di setiap modul utama
- [ ] **P2** `RealTimePulse` / notifikasi tidak mengganggu (toast + badge saja)

---

## Fase F — Aksesibilitas (WCAG 2.1 AA target)

### F.1 Global

- [ ] **P0** Audit kontras `brand-text-muted` light + dark (≥ 4.5:1 teks normal)
- [ ] **P0** `focus-visible` ring konsisten di semua kontrol interaktif
- [ ] **P1** `prefers-reduced-motion`: nonaktifkan `ScrollAnimate` / animasi berat
- [ ] **P1** Skip link “Lompat ke konten utama”
- [ ] **P2** Halaman fokus bahasa (`lang="id"` sudah — pastikan di layout)

### F.2 Komponen kunci

- [ ] **P0** Icon-only buttons punya `aria-label`
- [ ] **P0** Form: `<label>` + `aria-describedby` untuk error
- [ ] **P1** Breaking ticker: `aria-live="polite"` + kontrol pause
- [ ] **P1** Modal: focus trap + Esc close
- [ ] **P1** Kartu berita: judul dalam `<article>` / heading hierarchy benar

### F.3 Testing a11y

- [ ] **P1** axe-core di Playwright untuk homepage + artikel + login **(CI)**
- [ ] **P1** Lighthouse Accessibility ≥ 90 pada 3 URL inti
- [ ] **P2** Test keyboard-only untuk dashboard submit artikel

---

## Fase G — Performance & perceived quality

### G.1 Font & aset

- [ ] **P1** Self-host font (hapus render-blocking Google Fonts di `globals.css`)
- [ ] **P1** `SmartImage`: prop `sizes` benar per layout
- [ ] **P2** Placeholder blur dari API/media

### G.2 Bundle & loading

- [ ] **P1** Dynamic import editor (hanya di route dashboard artikel)
- [ ] **P1** `loading.tsx` per route publik penting (`[site]`, artikel)
- [ ] **P1** Skeleton layout match final layout (kurangi CLS)
- [ ] **P2** Jalankan `pnpm --filter @beritakarya/web analyze` — dokumentasi budget KB

### G.3 Metrik Core Web Vitals

- [ ] **P1** LCP homepage < 2.5s (production) **(verifikasi)**
- [ ] **P1** CLS homepage & artikel < 0.1 **(verifikasi)**
- [ ] **P2** INP < 200ms pada interaksi utama (search, menu)

---

## Fase H — Design ops & QA

### H.1 CI & regression

- [x] Playwright spec `tests/e2e/container-layout.spec.ts` ada
- [ ] **P0** Script `"e2e": "playwright test"` di `apps/web/package.json`
- [ ] **P0** Job Playwright di GitHub Actions (staging)
- [ ] **P1** Snapshot visual homepage + artikel (baseline commit)
- [ ] **P1** `pnpm test` + lint di `ci.yml` (selaras deploy workflow)

### H.2 Definition of Done — setiap PR UI

- [ ] Memakai `Container` / primitives (bukan width manual baru di publik)
- [ ] Screenshot desktop + mobile disertakan di PR
- [ ] Tidak melanggar homepage/article spec jika menyentuh halaman tersebut
- [ ] axe: 0 critical pada halaman yang diubah
- [ ] Dark mode dicek jika menyentuh warna/surface

### H.3 Metrik produk (opsional)

- [ ] **P2** Dashboard internal: bounce homepage, time on article, scroll depth
- [ ] **P2** Sesi usability 5 reporter + 5 pembaca / bulan
- [ ] **P3** NPS atau CSAT pembaca edisi pilot

---

## Sprint 30 hari (rekomendasi)

| Minggu | Fokus | Item checklist utama |
|--------|--------|----------------------|
| **1** | Homepage compliance | B.1–B.5, audit `SiteHomePage.tsx` vs spec |
| **2** | Primitives + Storybook | A.2, A.3 (Button, Input, 3 story) |
| **3** | Artikel + a11y dasar | C.1–C.5, F.1–F.2 (kontras, focus, font control) |
| **4** | Dashboard + CI | E.1–E.2, H.1, P0 middleware dashboard |

---

## Dependensi teknis (dari audit — blok UX jika gagal)

Centang di [AUDIT_SISTEM.md](../AUDIT_SISTEM.md); ringkas di sini:

- [ ] **P0** Middleware auth `/{site}/dashboard` (F-H01)
- [ ] **P0** CI menjalankan `pnpm test` + Postgres service
- [ ] **P1** CSRF pada `/api/v1/ai` (editor AI tidak error/putus session)

---

## Referensi file implementasi

| Area | Path |
|------|------|
| Homepage | `apps/web/components/pages/SiteHomePage.tsx` |
| Hero | `apps/web/components/berita/MagazineBentoHero.tsx` |
| Artikel | `apps/web/app/[site]/artikel/[slug]/page.tsx` |
| Container | `apps/web/components/layout/Container.tsx` |
| Token CSS | `apps/web/app/globals.css` |
| Editor | `apps/web/components/editor/` |
| Dashboard layout | `apps/web/app/[site]/dashboard/layout.tsx` |
| E2E layout | `apps/web/tests/e2e/container-layout.spec.ts` |

---

## Changelog dokumen

| Tanggal | Perubahan |
|---------|-----------|
| 2026-05-25 | v1.0.0 — Roadmap awal + checklist semua fase |

---

*Centang item = komitmen tim. Review roadmap ini setiap akhir sprint dan perbarui angka **Progress ringkas**.*

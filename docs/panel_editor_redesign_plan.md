# Redesign Plan — Panel Editor Sidebar

> **Tujuan:** Transformasi Panel Editor dari template generik menjadi produk editorial kelas premium yang terinspirasi dari Linear, Vercel Dashboard, dan Arc Browser.  
> **Scope:** Semua 5 tab panel — Content, Settings, SEO, History, AI Assistant.  
> **Prinsip Utama:** Minimalis, elegan, informatif, dan terasa seperti produk bukan template.

---

## 1. Design System Tokens ✅

Sebelum mengubah satu pun komponen, kita standardisasi variabel desain terlebih dahulu. Semua komponen panel akan menggunakan token ini.

### Warna (Dark Mode — Primary)

| Token | Value | Kegunaan |
|---|---|---|
| `panel-bg` | `#0e1118` | Background panel utama |
| `panel-surface` | `#161b27` | Background card / surface |
| `panel-elevated` | `#1c2333` | Background elemen terangkat (input, dropdown) |
| `panel-border` | `rgba(255,255,255,0.07)` | Border halus semua elemen |
| `panel-border-hover` | `rgba(255,255,255,0.15)` | Border saat hover |
| `accent-red` | `#ef4444` | Aksen brand utama |
| `accent-red-muted` | `rgba(239,68,68,0.12)` | Background aksen merah lembut |
| `accent-amber` | `#f59e0b` | Badge Featured |
| `accent-purple` | `#8b5cf6` | Eksklusif & AI Assistant |
| `text-primary` | `#f1f5f9` | Teks utama |
| `text-secondary` | `#64748b` | Teks label/placeholder |
| `text-muted` | `#334155` | Teks sangat redup (divider label) |

### Tipografi

| Elemen | Font | Size | Weight | Transform |
|---|---|---|---|---|
| Section Label | Inter | `10px` | `600` | Tidak ada (hapus UPPERCASE) |
| Body Text | Inter | `13px` | `400` | — |
| Stat Number | Inter | `28px` | `800` | — |
| Stat Label | Inter | `11px` | `500` | — |
| Button | Inter | `12px` | `600` | — |

### Jarak (Spacing)

- Padding panel konten: `px-4 py-5`
- Gap antar section: `space-y-5`
- Border radius komponen: `rounded-xl` (12px)
- Border radius kecil (input, pill): `rounded-lg` (8px)

---

## 2. `EditorSidebar.tsx` — Struktur & Header ✅

**File:** `apps/web/components/editor/EditorSidebar.tsx`

### A. Header Panel

**Sebelum (Masalah):** Text "PANEL EDITOR" uppercase kaku, tombol close generik.

**Sesudah:**
- Ganti header teks statis menjadi **status artikel dinamis** — menampilkan dot status berwarna (hijau = `Draft`, kuning = `Menunggu Review`, merah = `Breaking`) dan nama status artikel.
- Font header lebih kecil, weight lebih ringan (`text-[11px] font-medium`), warna `text-secondary`.
- Tombol collapse menggunakan ikon `PanelRightClose` dari Lucide dengan efek hover `bg-panel-elevated`.

### B. Tab Navigation

**Sebelum (Masalah):** Tab hanya berisi ikon saja, tidak ada label, tidak ada state visual yang kuat.

**Sesudah — Full Redesign:**
- Ubah dari `flex` horizontal menjadi **vertical icon sidebar** di sisi kiri panel, atau tetap horizontal namun tambah label mini di bawah ikon.
- Setiap tab memiliki: ikon + label teks 2-3 huruf di bawahnya.
- State aktif: `background pill` penuh dengan warna `accent-red-muted`, ikon & teks berwarna `accent-red`, dan **tidak ada lagi garis bawah merah** yang terasa murahan.
- State hover: `bg-panel-elevated` dengan transisi 150ms.
- Tambah **tooltip** saat hover pada setiap tab (untuk aksesibilitas).

```
┌──────────────────────────────────┐
│  ● Draft          [Panel Close]  │
├──────────────────────────────────┤
│  [📄]  [⚙️]  [🔍]  [🕐]  [✨]  │
│  Info  Sett  SEO  Hist   AI     │
├──────────────────────────────────┤
│         [Tab Content]            │
└──────────────────────────────────┘
```

---

## 3. `TabContent.tsx` — Tab "Info Artikel" ✅

**File:** `apps/web/components/editor/tabs/TabContent.tsx`

**Perubahan:**

### A. Statistik Words & Min Read — Premium Card Redesign

**Sebelum:** Dua kotak `bg-gray-50` datar dengan angka dan label sederhana. Terasa seperti `<div>` kosong.

**Sesudah:**
- Setiap card memiliki **border kiri tipis berwarna aksen** (`border-l-2 border-accent-red`).
- Background `bg-panel-surface` dengan `border border-panel-border`.
- Angka statistik menggunakan font `text-3xl font-extrabold` dengan warna `text-primary`.
- Label (`Words`, `Min Read`) di bawah angka menggunakan `text-[11px] text-secondary`.
- Tambahkan **ikon kecil** di pojok kanan atas setiap card (ikon `Type` untuk Words, ikon `Clock` untuk Min Read).
- Tambahkan animasi counter saat nilai berubah (menggunakan CSS `transition-all`).

### B. Section Label — Ubah Gaya

**Sebelum:** `text-xs font-bold uppercase tracking-wider text-gray-500` — terasa kuno.

**Sesudah:** `text-[11px] font-semibold text-secondary` — tidak uppercase, lebih modern. Tambahkan garis tipis pemisah di samping label:
```
── Block Statistik ─────────────────
```
Implementasi menggunakan `flex items-center gap-2` dengan elemen `<div className="flex-1 h-px bg-panel-border" />`.

### C. Block Statistics List — Visualisasi Lebih Informatif

**Sebelum:** Hanya list teks dengan angka di kanan. Tidak ada konteks visual.

**Sesudah:**
- Setiap baris ditambah **mini progress bar** tipis di bawah label yang menunjukkan proporsi blok tersebut dari total keseluruhan.
- Warna progress bar berbeda per tipe: merah untuk Paragraphs, biru untuk Headings, amber untuk Images.

```
📝 Paragraphs                  4
   ████████░░░░░░  (40% dari total)

#  Headings                    2  
   ████░░░░░░░░░░  (20% dari total)
```

### D. Tambahan — Completion Score

Tambahkan sebuah **completion/readiness score** baru di bawah stats. Score berbentuk lingkaran progress (SVG circle) yang menunjukkan seberapa lengkap artikel:
- Judul terisi ✓
- Gambar utama ada ✓
- Kategori dipilih ✓
- Min. 300 kata ✓
- dst.

Score ini akan menjadi visual motivasi bagi jurnalis untuk melengkapi artikel sebelum publish.

---

## 4. `TabSettings.tsx` — Tab "Pengaturan" ✅

**File:** `apps/web/components/editor/tabs/TabSettings.tsx`

### A. Gambar Utama — Upload Zone Redesign

**Sebelum:** Dua kotak `border-dashed` yang generik dengan ikon dan teks kecil.

**Sesudah (Belum ada gambar):**
- Satu zona upload besar full-width dengan tinggi `h-36`, bukan dua kotak kecil.
- Background dengan **gradient subtle** dari `panel-surface` ke `panel-elevated`.
- Zona upload memiliki animasi **pulse border** yang elegan saat hover (border berwarna `accent-red` dengan opacity animasi).
- Di dalam zona: ikon upload besar, teks "Seret gambar ke sini", dan dua tombol inline kecil "Upload" dan "Galeri" — **bukan dua kotak terpisah**.
- Saat drag-over: background berubah menjadi `accent-red-muted` dengan animasi scale.

**Sesudah (Sudah ada gambar):**
- Gambar ditampilkan full-width dengan `aspect-video` dan overlay gelap saat hover.
- Overlay menampilkan dua tombol ikon (ganti & hapus) — ini sudah bagus, pertahankan.
- Tambahkan **informasi metadata gambar** di bawah preview: dimensi, ukuran file.

### B. Dropdown Kategori — Redesign Komponen

**Sebelum:** `<button>` dan dropdown `<div>` biasa dengan styling minimal.

**Sesudah:**
- Trigger button menggunakan styling `bg-panel-elevated border border-panel-border` yang konsisten.
- Ikon kategori (jika ada) ditampilkan di sebelah kiri nama kategori yang dipilih.
- Dropdown menggunakan animasi `opacity-0 → opacity-100` + `translate-y-1 → translate-y-0` (150ms).
- Parent kategori memiliki label yang bolder, sub-kategori diberikan indentasi dengan warna lebih redup.
- Saat item dipilih: tampil centang `✓` di sebelah kanan dengan warna `accent-red`.

### C. Input Tags — Pill Style Modern

**Sebelum:** Input biasa dengan pill `bg-gray-100` yang datar.

**Sesudah:**
- Tags yang sudah ditambahkan berbentuk pill dengan `bg-panel-elevated border border-panel-border` — konsisten dengan design system.
- Tombol hapus `×` per tag menggunakan ikon `X` dari Lucide yang muncul saat hover.
- Input field memiliki placeholder animasi yang lebih halus.
- Tambahkan hint teks: "Tekan Enter untuk menambahkan" di bawah input (hanya muncul saat input aktif).

### D. Badge Editorial — Toggle Switch Pengganti Checkbox

**Sebelum:** Checkbox HTML standar + label dalam border box. Terasa seperti form HTML.

**Sesudah — Full Redesign:**
- Hapus checkbox HTML, ganti dengan **custom toggle switch pill** yang responsif.
- Setiap badge card memiliki:
  - Sisi kiri: ikon badge dengan background sesuai warna badge (merah untuk Breaking, ungu untuk Eksklusif, amber untuk Featured).
  - Teks judul + deskripsi singkat.
  - Sisi kanan: **toggle switch** dengan animasi slide.
- Saat aktif: seluruh card mendapat border tipis berwarna badge tersebut (`border-red-500/40` untuk Breaking, dll.) dan background `bg-red-500/5`.

```
┌─────────────────────────────────────────┐
│  [⚡]  Breaking News               [●─] │  ← OFF
│        Tampilkan badge merah            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [⚡]  Breaking News               [─●] │  ← ON (border merah, bg merah redup)
│        Tampilkan badge merah            │
└─────────────────────────────────────────┘
```

---

## 5. `SEOPanel.tsx` — Tab "SEO" ✅

**File:** `apps/web/components/editor/seo/SEOPanel.tsx`

### A. Header Section SEO

**Sebelum:** Ikon merah + judul tebal + deskripsi. Terasa besar dan memakan ruang.

**Sesudah:** Hapus header ikon besar. Gunakan **section label** yang ringkas dan konsisten dengan tab lainnya. Ini menghemat ruang vertikal yang sangat berharga.

### B. Input Meta Title & Description

**Sebelum:** Input biasa dengan label uppercase.

**Sesudah:**
- Label menggunakan gaya konsisten (non-uppercase, `text-[11px]`).
- Counter karakter (`0/60`) ditampilkan dengan warna yang berubah: abu-abu → kuning (mendekati batas) → merah (melebihi batas). Gunakan indikator `bg-bar` linear kecil di bawah input.
- Input menggunakan `bg-panel-elevated` yang konsisten.

### C. Google Preview Card

**Sebelum:** Card dengan border biasa, terasa generik.

**Sesudah:**
- Tambahkan **label "Preview Google"** yang lebih elegan dengan indikator ikon Google yang kecil.
- Preview card menggunakan shadow yang lebih dalam dan tampilan yang lebih akurat menyerupai hasil pencarian Google sesungguhnya.
- Tambahkan versi **Mobile Preview** dan **Desktop Preview** yang bisa di-toggle.

### D. SEO Tips Box

**Sebelum:** Box berwarna biru dengan teks bullet list. Terasa seperti informasi statis yang tidak berguna.

**Sesudah:**
- Ganti dengan **SEO Score Badge** dinamis yang menghitung score berdasarkan kondisi artikel aktual:
  - ✅ Meta title terisi & 50-60 karakter
  - ✅ Meta description terisi & 120-160 karakter
  - ⚠️ Keyword utama belum diisi
  - dst.
- Ini jauh lebih berguna daripada tips statis yang tidak pernah dibaca.

---

## 6. Tab "History" — Redesign Placeholder

**File:** `EditorSidebar.tsx` (inline content)

**Sebelum:** Ikon + teks "Version history coming soon" di tengah layar kosong. Terasa tidak selesai dan tidak profesional.

**Sesudah:**
- Tampilkan **timeline placeholder yang elegan** — seolah-olah ada data, tetapi dalam state `blur/disabled` yang halus.
- Contoh: tampilkan 3-4 item histori palsu (skeleton) dengan avatar, tanggal, dan judul versi yang di-blur.
- Di bagian atas, tampilkan **banner info** yang elegan: "Riwayat versi akan tersedia setelah fitur ini diluncurkan. Artikel Anda tetap aman." dengan desain card yang premium.
- Tombol CTA: "Aktifkan Auto-Save" (yang bisa dikaitkan ke fitur existing).

---

## 7. `AIPanel.tsx` — Tab "AI Assistant" ✅

**File:** `apps/web/components/editor/ai/AIPanel.tsx`

### A. Header AI Panel

**Sebelum:** Header dengan background putih/gelap biasa. Ikon ungu dalam kotak.

**Sesudah:**
- Gunakan **gradient header** yang halus: `from-violet-950/30 via-panel-bg to-panel-bg`.
- Ikon AI menggunakan animasi shimmer/glow yang sangat halus untuk memberi kesan "live".
- Tampilkan indikator **"Connected"** dengan dot hijau berkedip kecil untuk menunjukkan koneksi AI aktif.

### B. Sub-Tab Navigasi (Tulis, Optimasi, Validasi, Gambar, SEO)

**Sebelum:** Tab dengan border-bottom `border-purple-500`. Terasa terlalu purple, tidak selaras dengan brand merah.

**Sesudah:**
- Gunakan desain **tab pill** yang melayang: semua tab dalam satu baris pill container (`bg-panel-elevated rounded-xl p-1`), tab aktif menggunakan `bg-panel-surface` dengan shadow kecil — persis seperti tab di Linear atau Arc.
- Aktif menggunakan warna `accent-purple` yang konsisten hanya di tab AI ini.

### C. Tombol Aksi (Tulis Ulang, Perluas, dll.)

**Sebelum:** Tombol ungu dan cokelat yang bertabrakan, tidak konsisten dengan brand.

**Sesudah:**
- **Semua tombol primer** menggunakan warna `accent-red` (brand utama).
- **Tombol sekunder** menggunakan `bg-panel-elevated border border-panel-border` — transparan dengan border subtle.
- Hapus warna cokelat/amber dari tombol aksi AI. Konsistensi adalah kunci.
- Tambahkan **loading state** yang elegan saat AI sedang memproses: tombol menampilkan animasi dot loading, bukan spinner yang generik.

### D. Footer Model Info

**Sebelum:** Teks kecil "Model: gpt-4o • Powered by OpenAI" di footer dengan background berbeda.

**Sesudah:**
- Tampilkan dalam satu baris ramping dengan ikon model yang relevan.
- Tambahkan **dropdown pilihan model** (GPT-4o, GPT-4o Mini, dll.) yang bisa diklik — memberikan kontrol lebih kepada pengguna.

---

## 8. Collapsed State Panel ✅

**Sebelum:** Tombol bulat merah di tepi kanan layar. Terasa mengganggu.

**Sesudah:**
- Ganti dengan **slim vertical tab bar** selebar `48px` yang selalu terlihat di sisi kanan.
- Menampilkan 5 ikon tab dalam kondisi panel tertutup.
- Mengklik salah satu ikon akan membuka panel dan langsung berpindah ke tab yang diklik.
- Tab aktif dalam collapsed state mendapat dot indikator merah kecil di pojok kanan atas ikonnya.

---

## 9. Urutan Implementasi

| Fase | Task | File yang Diubah |
|---|---|---|
| **1** | Terapkan Design System Tokens (warna, spacing, tipografi) | `globals.css` atau `tailwind.config.ts` | ✅
| **2** | Redesign `EditorSidebar.tsx` — Header + Tab Nav | `EditorSidebar.tsx` | ✅
| **3** | Redesign `TabContent.tsx` — Stat Cards + Block List | `tabs/TabContent.tsx` | ✅
| **4** | Redesign `TabSettings.tsx` — Upload Zone + Toggle Badge | `tabs/TabSettings.tsx` | ✅
| **5** | Redesign `SEOPanel.tsx` — Score Dinamis + Preview | `seo/SEOPanel.tsx` | ✅
| **6** | Redesign History Placeholder | `EditorSidebar.tsx` (inline) | ✅
| **7** | Redesign `AIPanel.tsx` — Header + Tab Pill + Tombol | `ai/AIPanel.tsx` | ✅
| **8** | Redesign Collapsed State | `EditorSidebar.tsx` | ✅

---

## 10. Inspirasi & Referensi Desain

- **Linear.app** — Sidebar yang sangat bersih, spacing sempurna, dark mode elegan.
- **Vercel Dashboard** — Card stat dengan hierarki visual yang kuat.
- **Arc Browser** — Tab pill navigation yang modern dan responsif.
- **Craft.do** — Editor sidebar yang terasa seperti produk premium Apple.

---

*Rencana ini dirancang agar dapat diimplementasikan secara bertahap tanpa merusak fungsionalitas yang sudah ada.*

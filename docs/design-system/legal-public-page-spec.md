# Legal Public Page Spec - `/[site]/p/[slug]`

## Objective

Halaman legal publik berfungsi sebagai dokumen resmi portal untuk publik. Halaman ini harus terasa seperti dokumen editorial yang rapi, kredibel, dan konsisten dengan ritme visual homepage, article page, dan ads public page.

Slug yang memakai spec ini:
- `about` → Tentang Kami
- `ethics` → Kode Etik
- `editorial` → Redaksi
- `terms` → Ketentuan Penggunaan
- `media-siber` → Pedoman Media Siber

## Layout Principle

- Shell luar harus sejajar dengan sistem publik lain melalui `Container`
- Header halaman memakai pola yang sama dengan ads public:
  - eyebrow kecil dengan dot marker merah
  - title serif besar
  - spacing vertikal lapang
- Isi dokumen legal harus lebih sempit dari homepage agar nyaman dibaca
- Konten tidak perlu card besar; tampil seperti dokumen editorial bersih

## Layout Structure

```text
Container
└── Page Shell (`py-16 md:py-20`, `max-w-4xl mx-auto`)
    ├── Global Header
    │   ├── Eyebrow: "Halaman Informasi"
    │   └── H1: nama halaman legal
    │
    ├── Intro Copy
    │   └── max-w-3xl, text-sm/md:text-base
    │
    └── Document Section
        ├── Divider top
        ├── Document Label: "Dokumen Portal"
        ├── H2: nama dokumen
        └── Prose Content
            ├── rich text HTML dari settings
            └── fallback empty state jika konten belum tersedia
```

## Width & Spacing

- Outer shell: `Container`
- Page width: `max-w-4xl mx-auto`
- Intro width: `max-w-3xl`
- Vertical spacing:
  - shell: `py-16 md:py-20`
  - intro to content: `space-y-10 md:space-y-12`
  - document section top padding: `pt-10 md:pt-12`
- Divider: `border-t border-black/5 dark:border-white/5`

## Header Pattern

- Eyebrow row:
  - dot marker: `h-2 w-2 rounded-full bg-brand-red`
  - label: `text-[11px] font-black uppercase tracking-[0.18em] text-brand-red`
- Main title:
  - `text-3xl md:text-4xl lg:text-5xl`
  - `font-serif font-black`
  - `uppercase leading-none tracking-tight`
- Intro text:
  - `text-sm md:text-base`
  - `text-brand-text-muted`
  - `leading-relaxed`

## Document Section Pattern

- Secondary label:
  - eyebrow: `Dokumen Portal`
- Section title:
  - `text-2xl md:text-3xl`
  - `font-serif font-black`
  - `tracking-tight`
- No heavy card wrapper by default
- Document content sits directly in the flow to preserve reading rhythm

## Typography & Prose

Gunakan prose styling yang lebih editorial, bukan textarea/plain dump:

- Base prose:
  - `prose prose-sm md:prose-base lg:prose-lg dark:prose-invert`
- Heading style:
  - `prose-headings:font-serif`
  - `prose-headings:font-black`
  - `prose-headings:tracking-tight`
- Paragraph and list color:
  - `prose-p:text-brand-text-muted`
  - `prose-li:text-brand-text-muted`
- Strong emphasis:
  - `prose-strong:text-brand-black`
  - `dark:prose-strong:text-white`
- Links:
  - `prose-a:text-brand-red`
- List spacing:
  - `prose-ul:pl-6`
  - `prose-ol:pl-6`

## Content Source

Konten berasal dari pengaturan site settings:

- `about` → `siteSettings.aboutUs`
- `ethics` → `siteSettings.codeOfEthics`
- `editorial` → `siteSettings.editorial`
- `terms` → `siteSettings.termsOfService`
- `media-siber` → `siteSettings.mediaSiber`

## Rich Text Rendering

Halaman legal publik harus mendukung rich text sederhana dari dashboard settings:

- Inline formatting:
  - `b`, `strong`
  - `i`, `em`
  - `u`
  - `a`
  - `br`
- Block formatting:
  - `p`
  - `div align="left|center|right"`
  - `h2`
  - `h3`
  - `ul`
  - `ol`
  - `li`

Jika konten lama masih plain text, renderer harus mengubahnya menjadi paragraf HTML sederhana agar tetap terbaca rapi.

## Intro Copy Rules

Setiap slug legal boleh memiliki intro yang berbeda, tetapi gayanya harus konsisten:

- singkat
- formal
- menjelaskan fungsi dokumen
- maksimal 1-2 kalimat

Contoh mapping:

```ts
const LEGAL_PAGE_INTROS = {
  about: 'Mengenal identitas, arah editorial, dan komitmen portal dalam melayani pembaca di wilayah ini.',
  ethics: 'Pedoman etika redaksi dan prinsip kerja jurnalistik yang menjadi dasar setiap proses peliputan.',
  editorial: 'Struktur redaksi, penanggung jawab, dan informasi kelembagaan yang menjadi fondasi operasional portal.',
  terms: 'Ketentuan penggunaan layanan, hak cipta, serta batas tanggung jawab yang berlaku bagi seluruh pengguna.',
  'media-siber': 'Rujukan pedoman media siber dan praktik publikasi yang mengikuti prinsip tanggung jawab pers.',
}
```

## Empty State

Jika konten legal belum tersedia:

- gunakan empty state ringan dalam container visual
- style:
  - `bg-brand-surface dark:bg-white/[0.02]`
  - `border border-dashed border-black/5 dark:border-white/10`
  - `rounded-2xl`
  - `p-12 text-center`
- copy:
  - informatif
  - menyebut nama site
  - tanpa nada error

## Consistency With Other Public Pages

Yang harus sama dengan homepage/article/ads:

- `Container` sebagai shell utama
- spacing `py-16 md:py-20`
- eyebrow marker merah
- serif headings
- border token `border-black/5` dan `dark:border-white/5`
- warna dark surface konsisten

Yang boleh berbeda:

- width isi teks lebih sempit untuk kenyamanan baca
- tidak perlu card grid atau sidebar
- fokus pada ritme dokumen, bukan marketing atau feed

## Definition Of Done

- [x] Halaman legal publik memakai shell yang konsisten dengan halaman publik lain
- [x] Header halaman mengikuti pola eyebrow + serif title
- [x] Intro copy hadir sebelum isi dokumen
- [x] Document section memiliki divider dan label sekunder
- [x] Prose styling mendukung rich text legal dari dashboard settings
- [x] Konten lama plain text tetap terbaca rapi
- [x] Empty state tampil konsisten dengan design system publik

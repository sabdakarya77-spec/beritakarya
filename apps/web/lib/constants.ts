export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Pimred (CEO) / Admin IT',
  wapimred: 'Wakil Pemimpin Redaksi (Wapimred)',
  reporter: 'Reporter (Internal)',
  kontributor: 'Kontributor (Penulis Lepas)',
  advertiser: 'Pengiklan',
  reader: 'Pembaca'
}

export const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
  wapimred: 'bg-red-100 text-red-700 border-red-200',
  reporter: 'bg-green-100 text-green-700 border-green-200',
  kontributor: 'bg-blue-100 text-blue-700 border-blue-200',
  advertiser: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reader: 'bg-gray-100 text-gray-700 border-gray-200'
}

export const CATEGORY_COLORS: Record<string, string> = {
  nasional: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30',
  daerah: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30',
  politik: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30',
  ekonomi: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30',
  teknologi: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30',
  hukum: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30',
  olahraga: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30',
  opini: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30',
  investigasi: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30',
  lifestyle: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30',
  gaya_hidup: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30',
  advertorial: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30',
  video: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30',
  tersimpan: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-900/30'
}

export function getCategoryColor(categoryName: string = 'umum'): string {
  const key = categoryName.toLowerCase().replace(/\s+/g, '_').trim()
  return CATEGORY_COLORS[key] || 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30'
}

export interface SubCategory {
  name: string;
  slug: string;
}

export interface CategoryItem {
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}

export const CATEGORIES_CONFIG: CategoryItem[] = [
  { name: 'Terbaru', slug: 'Terbaru' },
  {
    name: 'Nasional',
    slug: 'Nasional',
    subCategories: [
      { name: 'Politik', slug: 'Politik' },
      { name: 'Hukum & Keadilan', slug: 'Hukum' },
      { name: 'Pendidikan', slug: 'Pendidikan' },
      { name: 'Peristiwa', slug: 'Peristiwa' }
    ]
  },
  {
    name: 'Daerah',
    slug: 'Daerah',
    subCategories: [
      { name: 'DKI Jakarta & Banten', slug: 'Jakarta' },
      { name: 'Jawa Barat & Tengah', slug: 'Jawa' },
      { name: 'Jawa Timur & Bali', slug: 'Bali' },
      { name: 'Sumatera & Kalimantan', slug: 'Sumatera' },
      { name: 'Sulawesi & Papua', slug: 'Sulawesi' },
      { name: 'Kabar Desa', slug: 'Desa' }
    ]
  },
  {
    name: 'Ekonomi',
    slug: 'Ekonomi',
    subCategories: [
      { name: 'Makro & Keuangan', slug: 'Keuangan' },
      { name: 'Bisnis & Saham', slug: 'Bisnis' },
      { name: 'UMKM', slug: 'UMKM' },
      { name: 'Industrial', slug: 'Industrial' }
    ]
  },
  {
    name: 'Olahraga',
    slug: 'Olahraga',
    subCategories: [
      { name: 'Piala Dunia', slug: 'Piala Dunia' },
      { name: 'Timnas Garuda', slug: 'Timnas' },
      { name: 'Sepak Bola', slug: 'Sepak Bola' },
      { name: 'Ragam Olahraga', slug: 'Ragam Olahraga' }
    ]
  },
  {
    name: 'Teknologi',
    slug: 'Teknologi',
    subCategories: [
      { name: 'Gadget & Review', slug: 'Gadget' },
      { name: 'AI & Inovasi', slug: 'AI' },
      { name: 'Startups & Digital', slug: 'Startups' },
      { name: 'Game & Esports', slug: 'Game' }
    ]
  },
  {
    name: 'Opini',
    slug: 'Opini',
    subCategories: [
      { name: 'Kolom & Esai', slug: 'Kolom' },
      { name: 'Tajuk Rencana', slug: 'Tajuk' },
      { name: 'Wawancara', slug: 'Wawancara' }
    ]
  },
  {
    name: 'Investigasi',
    slug: 'Investigasi',
    subCategories: [
      { name: 'Laporan Investigasi', slug: 'Laporan Investigasi' },
      { name: 'Sorotan Khusus', slug: 'Sorotan' }
    ]
  },
  {
    name: 'Gaya Hidup',
    slug: 'Lifestyle',
    subCategories: [
      { name: 'Wisata & Kuliner', slug: 'Wisata' },
      { name: 'Kesehatan & Wellness', slug: 'Kesehatan' },
      { name: 'Seni, Film & Fesyen', slug: 'Seni' },
      { name: 'Otomotif', slug: 'Otomotif' }
    ]
  },
  {
    name: 'Advertorial',
    slug: 'Advertorial',
    subCategories: [
      { name: 'Info Bisnis', slug: 'Info Bisnis' },
      { name: 'Rilis Pers', slug: 'Rilis Pers' }
    ]
  },
  {
    name: 'Video',
    slug: 'Video',
    subCategories: [
      { name: 'Dokumenter & Reportase', slug: 'Dokumenter' },
      { name: 'Galeri Foto', slug: 'Galeri Foto' },
      { name: 'Podcast & Audio', slug: 'Podcast' }
    ]
  },
  { name: 'Tersimpan', slug: 'Tersimpan' }
];

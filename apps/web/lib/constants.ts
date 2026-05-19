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
  hukum: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30'
}

export function getCategoryColor(categoryName: string = 'umum'): string {
  const key = categoryName.toLowerCase().trim()
  return CATEGORY_COLORS[key] || 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30'
}

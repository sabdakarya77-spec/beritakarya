import { Globe } from 'lucide-react'
import { InspectorSection, FieldLabel } from './InspectorSection'
import { cn } from '../../../lib/utils'

interface SEOSectionProps {
  metaTitle: string
  metaDescription: string
  title: string
  categorySlug: string
  updateArticleData: (data: any) => void
}

export function SEOSection({
  metaTitle,
  metaDescription,
  title,
  categorySlug,
  updateArticleData
}: SEOSectionProps) {
  return (
    <>
      <InspectorSection
        eyebrow="Preview"
        title="Tampilan Mesin Pencari"
        description="Cek bagaimana judul dan deskripsi akan tampil di halaman hasil pencarian."
        helper="Preview ini membantu membayangkan tampilan artikel di hasil pencarian, meski hasil akhir bisa sedikit berbeda di Google."
      >
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            <Globe size={12} />
            Preview Google
          </p>
          <h4 className="line-clamp-1 text-lg font-medium text-blue-600 dark:text-blue-400">
            {metaTitle || title || 'Judul artikel...'}
          </h4>
          <p className="mt-1 line-clamp-1 text-sm text-green-700 dark:text-green-500/80">
            beritakarya.co › {categorySlug} › ...
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
            {metaDescription || 'Tambahkan meta description agar artikel tampil lebih meyakinkan di hasil pencarian.'}
          </p>
        </div>
      </InspectorSection>

      <InspectorSection
        eyebrow="Meta"
        title="Optimasi SEO"
        description="Jaga judul dan deskripsi tetap ringkas, jelas, dan konsisten dengan angle editorial."
        helper="SEO membantu artikel lebih mudah ditemukan di mesin pencari. Fokus utamanya tetap judul yang jelas dan deskripsi yang meyakinkan."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <FieldLabel helper="Judul alternatif untuk mesin pencari. Jika kosong, sistem biasanya memakai judul artikel utama.">Meta Title</FieldLabel>
            <input
              type="text"
              value={metaTitle}
              onChange={(event) => updateArticleData({ metaTitle: event.target.value })}
              placeholder="Kustomisasi judul untuk SEO..."
              className={cn(
                "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors dark:bg-slate-900 dark:text-white",
                metaTitle.length > 60
                  ? "border-red-300 focus:border-red-500 dark:border-red-500/30 dark:focus:border-red-500"
                  : metaTitle.length >= 40
                    ? "border-emerald-300 focus:border-emerald-500 dark:border-emerald-500/20 dark:focus:border-emerald-500"
                    : metaTitle.length > 0
                      ? "border-amber-200 focus:border-amber-500 dark:border-amber-500/20 dark:focus:border-amber-500"
                      : "border-gray-200 focus:border-brand-red dark:border-white/10"
              )}
            />
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className={cn(
                "font-medium transition-colors",
                metaTitle.length > 60 
                  ? "text-red-500" 
                  : metaTitle.length >= 40 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : metaTitle.length > 0 
                      ? "text-amber-600 dark:text-amber-400" 
                      : "text-gray-400"
              )}>
                {metaTitle.length === 0 
                  ? 'Kosong' 
                  : metaTitle.length > 60 
                    ? 'Terlalu panjang (melebihi batas Google)' 
                    : metaTitle.length >= 40 
                      ? 'Panjang optimal' 
                      : 'Terlalu pendek (kurang optimal)'}
              </span>
              <span className={cn(
                "font-mono transition-colors",
                metaTitle.length > 60 
                  ? "text-red-500 font-bold" 
                  : metaTitle.length >= 40 
                    ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                    : metaTitle.length > 0
                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                      : "text-gray-400"
              )}>
                {metaTitle.length} / 60
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel helper="Ringkasan pendek untuk cuplikan hasil pencarian dan preview tautan.">Meta Description</FieldLabel>
            <textarea
              rows={4}
              value={metaDescription}
              onChange={(event) => updateArticleData({ metaDescription: event.target.value })}
              placeholder="Deskripsi singkat untuk cuplikan pencarian..."
              className={cn(
                "w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors dark:bg-slate-900 dark:text-white",
                metaDescription.length > 160
                  ? "border-red-300 focus:border-red-500 dark:border-red-500/30 dark:focus:border-red-500"
                  : metaDescription.length >= 120
                    ? "border-emerald-300 focus:border-emerald-500 dark:border-emerald-500/20 dark:focus:border-emerald-500"
                    : metaDescription.length > 0
                      ? "border-amber-200 focus:border-amber-500 dark:border-amber-500/20 dark:focus:border-amber-500"
                      : "border-gray-200 focus:border-brand-red dark:border-white/10"
              )}
            />
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className={cn(
                "font-medium transition-colors",
                metaDescription.length > 160 
                  ? "text-red-500" 
                  : metaDescription.length >= 120 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : metaDescription.length > 0 
                      ? "text-amber-600 dark:text-amber-400" 
                      : "text-gray-400"
              )}>
                {metaDescription.length === 0 
                  ? 'Kosong' 
                  : metaDescription.length > 160 
                    ? 'Terlalu panjang (melebihi batas Google)' 
                    : metaDescription.length >= 120 
                      ? 'Panjang optimal' 
                      : 'Terlalu pendek (kurang optimal)'}
              </span>
              <span className={cn(
                "font-mono transition-colors",
                metaDescription.length > 160 
                  ? "text-red-500 font-bold" 
                  : metaDescription.length >= 120 
                    ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                    : metaDescription.length > 0
                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                      : "text-gray-400"
              )}>
                {metaDescription.length} / 160
              </span>
            </div>
          </div>
        </div>
      </InspectorSection>
    </>
  )
}

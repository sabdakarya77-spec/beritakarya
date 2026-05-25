import { Globe } from 'lucide-react'
import { InspectorSection, FieldLabel } from './InspectorSection'

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
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
            <p className="text-right text-[11px] text-gray-400">{metaTitle.length} / 60</p>
          </div>

          <div className="space-y-2">
            <FieldLabel helper="Ringkasan pendek untuk cuplikan hasil pencarian dan preview tautan.">Meta Description</FieldLabel>
            <textarea
              rows={4}
              value={metaDescription}
              onChange={(event) => updateArticleData({ metaDescription: event.target.value })}
              placeholder="Deskripsi singkat untuk cuplikan pencarian..."
              className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
            <p className="text-right text-[11px] text-gray-400">{metaDescription.length} / 160</p>
          </div>
        </div>
      </InspectorSection>
    </>
  )
}

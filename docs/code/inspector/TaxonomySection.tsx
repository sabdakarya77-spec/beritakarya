import { useState } from 'react'
import { ChevronRight, Tag, X } from 'lucide-react'
import type { Category } from '@beritakarya/types'
import { InspectorSection, FieldLabel } from './InspectorSection'

interface TaxonomySectionProps {
  categoryId: string | null
  tags: string[]
  categoriesTree: Category[]
  updateArticleData: (data: any) => void
}

export function TaxonomySection({
  categoryId,
  tags,
  categoriesTree,
  updateArticleData
}: TaxonomySectionProps) {
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    const nextTag = tagInput.trim()
    if (!nextTag || tags.includes(nextTag)) return
    updateArticleData({ tags: [...tags, nextTag] })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateArticleData({ tags: tags.filter((currentTag) => currentTag !== tag) })
  }

  return (
    <InspectorSection
      eyebrow="Taksonomi"
      title="Kategori dan Tag"
      description="Pastikan artikel mudah ditemukan, dipilah, dan dibawa ke permukaan yang tepat."
      helper="Kategori menentukan kanal utama artikel. Tag membantu artikel terhubung dengan topik, tokoh, atau isu yang sama."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel helper="Pilih kanal utama artikel. Gunakan kategori yang paling mewakili topik utama berita.">Kategori</FieldLabel>
          <select
            value={categoryId || ''}
            onChange={(event) => updateArticleData({ categoryId: event.target.value || null })}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Pilih kategori...</option>
            {categoriesTree.map((parent) => (
              <optgroup key={parent.id} label={parent.name}>
                <option value={parent.id}>{parent.name} (Utama)</option>
                {parent.subCategories?.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    ↳ {subCategory.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <FieldLabel helper="Tag berfungsi sebagai penanda tambahan, misalnya nama tokoh, lokasi, isu, atau peristiwa terkait.">Tagar dan Topik</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 transition-colors hover:text-brand-red">
                  <X size={12} />
                </button>
              </span>
            )) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada tag yang ditambahkan.</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                placeholder="Tambah tag..."
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTag()
                  }
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={addTag}
              className="flex items-center justify-center rounded-2xl bg-brand-red px-4 text-white transition-colors hover:bg-red-700"
              aria-label="Tambahkan tag"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </InspectorSection>
  )
}

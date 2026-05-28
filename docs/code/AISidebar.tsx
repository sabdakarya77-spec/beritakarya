'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkles, ChevronDown, Wand2, ScanSearch, CheckCheck, LayoutTemplate, Image as ImageIcon, SearchCheck } from 'lucide-react'
import { WriteTab } from './ai/WriteTab'
import { OptimizeTab } from './ai/OptimizeTab'
import { ValidateTab } from './ai/ValidateTab'
import { LayoutTab } from './ai/LayoutTab'
import { ImageTab } from './ai/ImageTab'
import { SEOAuditTab } from './ai/SEOAuditTab'
import { useEditorStore } from '../../store/editorStore'
import { cn } from '../../lib/utils'

type Tab = 'write' | 'optimize' | 'validate' | 'seo' | 'layout' | 'image'

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: 'write', label: 'Tulis', icon: Wand2 },
  { id: 'optimize', label: 'Optimasi', icon: ScanSearch },
  { id: 'validate', label: 'Validasi', icon: CheckCheck },
  { id: 'seo', label: 'SEO Audit', icon: SearchCheck },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'image', label: 'Gambar', icon: ImageIcon }
]

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o', price: 'Premium', hint: 'Kualitas terbaik untuk artikel penting' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', price: 'Seimbang', hint: 'Cepat dan tetap akurat untuk workflow harian' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', price: 'Hemat', hint: 'Cocok untuk draft cepat dan eksplorasi awal' }
]

export function AISidebar() {
  const { blocks, activeBlockId } = useEditorStore()
  const [tab, setTab] = useState<Tab>('write')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')

  useEffect(() => {
    const saved = localStorage.getItem('ai-model')
    if (saved) setSelectedModel(saved)
  }, [])

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeBlockId) ?? null,
    [activeBlockId, blocks]
  )

  const activeBlockLabel = useMemo(() => {
    if (!activeBlock) return 'Belum ada blok aktif'
    const labels: Record<string, string> = {
      paragraph: 'Paragraf',
      heading: 'Subjudul',
      quote: 'Kutipan',
      image: 'Gambar',
      imageGrid: 'Grid Gambar',
      gallery: 'Galeri',
      list: 'Daftar',
      callout: 'Highlight',
      embed: 'Embed',
      mediaText: 'Media & Teks'
    }
    return labels[activeBlock.type] || activeBlock.type
  }, [activeBlock])

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value
    setSelectedModel(model)
    localStorage.setItem('ai-model', model)
  }

  const selectedModelMeta = AI_MODELS.find((model) => model.value === selectedModel) ?? AI_MODELS[0]

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red text-white shadow-lg shadow-brand-red/15">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
              Assist
            </p>
            <h4 className="mt-1 text-sm font-semibold text-brand-black dark:text-white">
              Asisten AI dalam workflow editor
            </h4>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Gunakan AI untuk menulis ulang, memeriksa kualitas, dan mengoptimasi artikel tanpa keluar dari inspector.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              Fokus Saat Ini
            </p>
            <p className="mt-2 text-sm font-semibold text-brand-black dark:text-white">
              {activeBlockLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {activeBlock ? 'AI akan terasa lebih relevan jika Anda memilih blok yang ingin dibantu terlebih dahulu.' : 'Pilih blok pada kanvas untuk memberi konteks yang lebih jelas ke panel AI.'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
            <label className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              Model AI
            </label>
            <div className="relative mt-2">
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} · {model.price}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {selectedModelMeta.hint}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            Toolset AI
          </p>
          <h4 className="mt-1 text-sm font-semibold text-brand-black dark:text-white">
            Pilih bantuan yang paling sesuai
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-xs font-black uppercase tracking-[0.18em] transition-all',
                tab === id
                  ? 'border-brand-red/30 bg-brand-red/[0.05] text-brand-red dark:border-brand-red/20 dark:bg-brand-red/[0.08]'
                  : 'border-gray-200/80 bg-gray-50/70 text-gray-500 hover:border-brand-red/20 hover:text-brand-red dark:border-white/10 dark:bg-slate-900/60 dark:text-gray-300'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-gray-200/80 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
          <div style={{ display: tab === 'write' ? 'block' : 'none' }}>
            <WriteTab model={selectedModel} />
          </div>
          <div style={{ display: tab === 'optimize' ? 'block' : 'none' }}>
            <OptimizeTab model={selectedModel} />
          </div>
          <div style={{ display: tab === 'validate' ? 'block' : 'none' }}>
            <ValidateTab model={selectedModel} />
          </div>
          <div style={{ display: tab === 'seo' ? 'block' : 'none' }}>
            <SEOAuditTab />
          </div>
          <div style={{ display: tab === 'layout' ? 'block' : 'none' }}>
            <LayoutTab model={selectedModel} />
          </div>
          <div style={{ display: tab === 'image' ? 'block' : 'none' }}>
            <ImageTab model={selectedModel} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-dashed border-gray-200 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-950/40">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
          Catatan Editorial
        </p>
        <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
          AI bersifat asistif. Semua hasil tetap perlu ditinjau ulang agar akurat, selaras dengan angle redaksi, dan aman dipublikasikan.
        </p>
      </section>
    </div>
  )
}

'use client'
import { useMemo, useState } from 'react'
import { Search, Type, Heading1, List, Quote, Sparkles, Image, Grid2X2, GalleryVertical, PlaySquare, Columns2, X, Plus } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'

interface BlockTypeOption {
  type: Block['type']
  label: string
  category: string
  keywords: string[]
  icon: typeof Type
}

const BLOCK_TYPES: BlockTypeOption[] = [
  { type: 'paragraph', label: 'Paragraf', category: 'Teks', keywords: ['teks', 'isi', 'body'], icon: Type },
  { type: 'heading', label: 'Subjudul', category: 'Teks', keywords: ['heading', 'judul', 'h2', 'h3'], icon: Heading1 },
  { type: 'list', label: 'Daftar', category: 'Teks', keywords: ['list', 'bullet', 'poin'], icon: List },
  { type: 'quote', label: 'Kutipan', category: 'Sorotan', keywords: ['quote', 'kutipan', 'statement'], icon: Quote },
  { type: 'callout', label: 'Highlight', category: 'Sorotan', keywords: ['callout', 'highlight', 'sorot'], icon: Sparkles },
  { type: 'image', label: 'Gambar', category: 'Media', keywords: ['foto', 'image', 'gambar'], icon: Image },
  { type: 'imageGrid', label: 'Grid Gambar', category: 'Media', keywords: ['grid', 'galeri', 'foto'], icon: Grid2X2 },
  { type: 'gallery', label: 'Galeri', category: 'Media', keywords: ['gallery', 'slideshow', 'galeri'], icon: GalleryVertical },
  { type: 'mediaText', label: 'Media & Teks', category: 'Media', keywords: ['media', 'teks', 'kolom'], icon: Columns2 },
  { type: 'embed', label: 'Embed', category: 'Sisipan', keywords: ['youtube', 'embed', 'video'], icon: PlaySquare },
]

interface Props {
  afterId?: string
  compact?: boolean
  onClose?: () => void
}

export function AddBlockMenu({ afterId, compact, onClose }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addBlock } = useEditorStore()

  const handleAdd = (type: Block['type']) => {
    addBlock(type, afterId)
    setOpen(false)
    setQuery('')
    onClose?.()
  }

  const filteredBlocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return BLOCK_TYPES

    return BLOCK_TYPES.filter(({ label, keywords }) =>
      [label, ...keywords].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-500 shadow-sm transition-colors hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-gray-300"
      >
        <Plus size={13} />
        <span>Tambah blok</span>
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white/95 p-3 shadow-xl dark:border-white/10 dark:bg-slate-900/90">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari blok..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-[12px] text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </div>
        <button
          onClick={() => { setOpen(false); setQuery(''); }}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Tutup"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {filteredBlocks.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-transparent py-2.5 px-2 text-center transition-all hover:border-brand-red/20 hover:bg-brand-red/[0.03] dark:hover:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-brand-red group-hover:text-white dark:bg-white/5 dark:group-hover:bg-brand-red dark:group-hover:text-white">
              <Icon size={16} />
            </span>
            <span className="text-[10px] font-medium text-gray-500 transition-colors group-hover:text-brand-black dark:text-gray-400 dark:group-hover:text-white">{label}</span>
          </button>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="col-span-3 rounded-xl border border-dashed border-gray-200 py-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-gray-500">
            Tidak ada blok yang cocok
          </div>
        )}
      </div>
    </div>
  )
}
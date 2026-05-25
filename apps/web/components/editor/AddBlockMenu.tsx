'use client'
import { useMemo, useState } from 'react'
import { Search, Type, Heading1, List, Quote, Sparkles, Image, Grid2X2, GalleryVertical, PlaySquare, Columns2, X } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'

type BlockCategory = 'Teks' | 'Media' | 'Sorotan' | 'Sisipan'

interface BlockTypeOption {
  type: Block['type']
  label: string
  desc: string
  category: BlockCategory
  keywords: string[]
  icon: typeof Type
}

const BLOCK_TYPES: BlockTypeOption[] = [
  { type: 'paragraph', label: 'Paragraf', desc: 'Teks isi berita utama', category: 'Teks', keywords: ['teks', 'isi', 'body'], icon: Type },
  { type: 'heading', label: 'Subjudul', desc: 'Pecah alur artikel per bagian', category: 'Teks', keywords: ['heading', 'judul', 'h2', 'h3'], icon: Heading1 },
  { type: 'list', label: 'Daftar', desc: 'Poin fakta atau rangkuman cepat', category: 'Teks', keywords: ['list', 'bullet', 'poin'], icon: List },
  { type: 'quote', label: 'Kutipan', desc: 'Sorot pernyataan narasumber', category: 'Sorotan', keywords: ['quote', 'kutipan', 'statement'], icon: Quote },
  { type: 'callout', label: 'Highlight', desc: 'Tarik perhatian ke info penting', category: 'Sorotan', keywords: ['callout', 'highlight', 'sorot'], icon: Sparkles },
  { type: 'image', label: 'Gambar', desc: 'Satu foto dengan caption', category: 'Media', keywords: ['foto', 'image', 'gambar'], icon: Image },
  { type: 'imageGrid', label: 'Grid Gambar', desc: 'Dua atau tiga foto sejajar', category: 'Media', keywords: ['grid', 'galeri', 'foto'], icon: Grid2X2 },
  { type: 'gallery', label: 'Galeri', desc: 'Kumpulan foto dalam satu blok', category: 'Media', keywords: ['gallery', 'slideshow', 'galeri'], icon: GalleryVertical },
  { type: 'mediaText', label: 'Media & Teks', desc: 'Visual dan narasi berdampingan', category: 'Media', keywords: ['media', 'teks', 'kolom'], icon: Columns2 },
  { type: 'embed', label: 'Embed', desc: 'YouTube atau konten eksternal', category: 'Sisipan', keywords: ['youtube', 'embed', 'video'], icon: PlaySquare },
]

const BLOCK_GROUPS: BlockCategory[] = ['Teks', 'Media', 'Sorotan', 'Sisipan']

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

    return BLOCK_TYPES.filter(({ label, desc, keywords }) =>
      [label, desc, ...keywords].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query])

  if (compact && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-3 py-1 text-xs font-semibold text-gray-400 transition-colors hover:bg-brand-red/5 hover:text-brand-red"
      >
        + Tambah blok
      </button>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-dashed border-gray-300/80 bg-white/80 px-5 py-4 text-left transition-colors hover:border-brand-red/40 hover:bg-brand-red/[0.03] dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-brand-red/30"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-lg leading-none text-gray-500 dark:bg-white/5 dark:text-gray-300">
            +
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-black dark:text-white">Tambah blok baru</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pilih format konten yang sesuai untuk ritme baca artikel.</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Slash / menu</span>
      </button>
    )
  }

  return (
    <div className="rounded-[28px] border border-gray-200/80 bg-white/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/90">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            Sisipkan Blok
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cari tipe konten atau pilih dari grup editorial yang paling relevan.
          </p>
        </div>
        <button
          onClick={() => {
            setOpen(false)
            setQuery('')
          }}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Tutup menu blok"
        >
          <X size={16} />
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari paragraf, subjudul, gambar, embed..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </div>

      <div className="space-y-5">
        {BLOCK_GROUPS.map((group) => {
          const items = filteredBlocks.filter((block) => block.category === group)
          if (!items.length) return null

          return (
            <section key={group}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  {group}
                </p>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">{items.length} opsi</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {items.map(({ type, label, desc, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleAdd(type)}
                    className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4 text-left transition-all hover:border-brand-red/30 hover:bg-brand-red/[0.04] dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-brand-red/30"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm dark:bg-slate-900 dark:text-gray-300">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-brand-black dark:text-white">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}

        {filteredBlocks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
            Tidak ada tipe blok yang cocok dengan kata kunci tersebut.
          </div>
        )}
      </div>
    </div>
  )
}

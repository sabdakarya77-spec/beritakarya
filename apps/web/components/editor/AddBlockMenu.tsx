'use client'
import { useMemo, useState } from 'react'
import { Search, Type, Heading1, List, Quote, Sparkles, Image, Grid2X2, GalleryVertical, PlaySquare, Columns2, X, Plus } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'
import { EditorHelpHint } from './EditorHelpHint'

type BlockCategory = 'Teks' | 'Media' | 'Sorotan' | 'Sisipan'

interface BlockTypeOption {
  type: Block['type']
  label: string
  desc: string
  helper?: string
  category: BlockCategory
  keywords: string[]
  icon: typeof Type
}

const BLOCK_TYPES: BlockTypeOption[] = [
  { type: 'paragraph', label: 'Paragraf', desc: 'Blok teks utama untuk isi berita dan narasi utama.', helper: 'Unit teks utama untuk menulis isi berita dan narasi.', category: 'Teks', keywords: ['teks', 'isi', 'body'], icon: Type },
  { type: 'heading', label: 'Subjudul', desc: 'Memecah artikel ke beberapa bagian agar alurnya mudah dipindai.', helper: 'Membagi artikel menjadi bagian-bagian dengan judul bantu agar mudah discan.', category: 'Teks', keywords: ['heading', 'judul', 'h2', 'h3'], icon: Heading1 },
  { type: 'list', label: 'Daftar', desc: 'Cocok untuk poin fakta, langkah, atau rangkuman cepat.', helper: 'Daftar poin untuk fakta, langkah-langkah, atau rangkuman.', category: 'Teks', keywords: ['list', 'bullet', 'poin'], icon: List },
  { type: 'quote', label: 'Kutipan', desc: 'Menonjolkan ucapan narasumber atau kalimat penting.', helper: 'Menampilkan ucapan narasumber atau kalimat penting secara menonjol.', category: 'Sorotan', keywords: ['quote', 'kutipan', 'statement'], icon: Quote },
  { type: 'callout', label: 'Highlight', desc: 'Sorotan visual untuk info penting, catatan redaksi, atau peringatan.', helper: 'Sorotan visual untuk info penting, catatan redaksi, atau peringatan.', category: 'Sorotan', keywords: ['callout', 'highlight', 'sorot'], icon: Sparkles },
  { type: 'image', label: 'Gambar', desc: 'Satu foto dengan caption untuk memperkuat konteks berita.', helper: 'Satu foto dengan keterangan untuk memperkuat konteks berita.', category: 'Media', keywords: ['foto', 'image', 'gambar'], icon: Image },
  { type: 'imageGrid', label: 'Grid Gambar', desc: 'Menampilkan dua atau tiga foto sejajar dalam satu blok.', helper: 'Menyusun 2-3 foto sejajar dalam satu blok visual.', category: 'Media', keywords: ['grid', 'galeri', 'foto'], icon: Grid2X2 },
  { type: 'gallery', label: 'Galeri', desc: 'Kumpulan beberapa foto jika satu visual tidak cukup.', helper: 'Koleksi foto yang bisa discroll atau di-klik untuk memperbesar.', category: 'Media', keywords: ['gallery', 'slideshow', 'galeri'], icon: GalleryVertical },
  { type: 'mediaText', label: 'Media & Teks', desc: 'Visual dan narasi berdampingan untuk highlight yang lebih terarah.', helper: 'Menempatkan visual dan teks bersebelahan untuk sorotan yang terarah.', category: 'Media', keywords: ['media', 'teks', 'kolom'], icon: Columns2 },
  { type: 'embed', label: 'Embed', desc: 'Menyematkan YouTube atau konten eksternal langsung ke artikel.', helper: 'Menyisipkan video YouTube atau konten eksternal agar langsung diputar di artikel.', category: 'Sisipan', keywords: ['youtube', 'embed', 'video'], icon: PlaySquare },
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

    return BLOCK_TYPES.filter(({ label, desc, keywords }) =>
      [label, desc, ...keywords].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query])

  if (compact && !open) {
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Blok adalah unit isi artikel seperti paragraf, subjudul, gambar, kutipan, atau embed.</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Slash / menu</span>
      </button>
    )
  }

  return (
    <div className="rounded-[22px] border border-gray-200/80 bg-white/95 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/90">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari paragraf, subjudul, gambar, embed..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-[13px] text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </div>
        <button
          onClick={() => {
            setOpen(false)
            setQuery('')
          }}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Tutup menu blok"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
          {filteredBlocks.length} blok tersedia
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/70 bg-gray-50/40 dark:border-white/10 dark:bg-slate-950/30">
        {filteredBlocks.map(({ type, label, desc, helper, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            className="flex w-full items-start gap-2.5 border-b border-gray-200/70 bg-transparent px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-brand-red/[0.04] dark:border-white/10 dark:hover:bg-white/[0.03]"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-gray-500 dark:bg-slate-900 dark:text-gray-300">
              <Icon size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="block text-[13px] font-semibold leading-5 text-brand-black dark:text-white">{label}</span>
                {helper && <EditorHelpHint text={helper} />}
              </span>
              <span className="mt-0.5 block truncate text-[10px] leading-4 text-gray-400 dark:text-gray-500">{desc}</span>
            </span>
          </button>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
            Tidak ada tipe blok yang cocok dengan kata kunci tersebut.
          </div>
        )}
      </div>
    </div>
  )
}

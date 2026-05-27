'use client'
import { useMemo, useState } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'
import { BLOCK_CATALOG } from './core/blockCatalog'
import { supportsMode } from './core/blockGuards'

interface Props {
  afterId?: string
  isOpen?: boolean
  onClose?: () => void
}

export function AddBlockMenu({ afterId, isOpen = false, onClose }: Props) {
  const [query, setQuery] = useState('')
  const { addBlock } = useEditorStore()

  const handleAdd = (type: Block['type']) => {
    addBlock(type, afterId)
    setQuery('')
    onClose?.()
  }

  const filteredBlocks = useMemo(() => {
    const availableBlocks = BLOCK_CATALOG.filter((item) => supportsMode(item.type, 'gridblock'))
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return availableBlocks

    return availableBlocks.filter(({ label, description, aliases, category }) =>
      [label, description, category, ...aliases].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query])

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-500 shadow-sm transition-colors hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-gray-300"
      >
        <Plus size={13} />
        <span>Tambah blok</span>
      </button>
    )
  }

  return (
    <div className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-gray-200/70 bg-white/95 p-2.5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/95">
      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari blok..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-[12px] text-brand-black outline-none transition-colors focus:border-gray-300 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </div>
        <button
          onClick={() => { setQuery(''); onClose?.(); }}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Tutup"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {filteredBlocks.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            className="group flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left transition-all hover:border-gray-200 hover:bg-gray-50 dark:hover:border-white/10 dark:hover:bg-white/[0.03]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-800 group-hover:text-white dark:bg-white/5 dark:group-hover:bg-white/20 dark:group-hover:text-white">
              <Icon size={15} />
            </span>
            <span className="min-w-0 text-[12px] font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">{label}</span>
          </button>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-gray-200 py-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-gray-500">
            Tidak ada blok yang cocok
          </div>
        )}
      </div>
    </div>
  )
}

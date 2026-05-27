'use client'

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../../store/editorStore'

interface BlockActionRailProps {
  blockId: string
  index: number
  totalBlocks: number
}

/**
 * BlockActionRail — Floating toolbar for block actions.
 *
 * Isi:
 * - move up/down
 * - delete
 *
 * Drag handle dan transform akan ditambahkan di iterasi berikutnya.
 * Dipisahkan dari GridBlockWrapper agar action toolbar reusable.
 */
export function BlockActionRail({ blockId, index, totalBlocks }: BlockActionRailProps) {
  const { moveBlock, removeBlock } = useEditorStore()

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-gray-200/50 bg-white/95 p-0.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
      <button
        onClick={(e) => { e.stopPropagation(); moveBlock(blockId, 'up') }}
        disabled={index === 0}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-10 dark:hover:bg-white/5 dark:hover:text-white"
        title="Naik"
      >
        <ChevronUp size={12} strokeWidth={3} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); moveBlock(blockId, 'down') }}
        disabled={index === totalBlocks - 1}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-10 dark:hover:bg-white/5 dark:hover:text-white"
        title="Turun"
      >
        <ChevronDown size={12} strokeWidth={3} />
      </button>

      <div className="mx-0.5 h-3 w-px bg-gray-200/60 dark:bg-white/10" />

      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Hapus blok ini?')) {
            removeBlock(blockId)
          }
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        title="Hapus"
      >
        <Trash2 size={11} strokeWidth={3} />
      </button>
    </div>
  )
}
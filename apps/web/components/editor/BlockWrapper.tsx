'use client'
import { type ReactNode } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'
import { ChevronUp, ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AddBlockMenu } from './AddBlockMenu'
import { useState } from 'react'

interface Props {
  block: Block
  index: number
  children: ReactNode
}

export function BlockWrapper({ block, index, children }: Props) {
  const { moveBlock, removeBlock, blocks, isFocusMode, activeBlockId, setActiveBlockId } = useEditorStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const isActive = activeBlockId === block.id

  if (isFocusMode) {
    return <div className="py-2 lg:py-3">{children}</div>
  }

  return (
    <div
      className="group relative mb-5 lg:mb-6"
      onClick={() => setActiveBlockId(block.id)}
      onFocusCapture={() => setActiveBlockId(block.id)}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-3 bottom-3 w-px rounded-full bg-transparent transition-colors",
          isActive && "bg-brand-red/50"
        )}
      />

      <div
        className={cn(
          "absolute -top-5 left-1/2 z-30 -translate-x-1/2 transition-all duration-200",
          isActive ? "opacity-100 pointer-events-auto" : "pointer-events-none scale-95 opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1.5 px-3 shadow-2xl dark:border-white/10 dark:bg-slate-900">
          <div className="mr-1 flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <GripVertical size={12} />
            Blok {index + 1}
          </div>
          <button
            onClick={() => moveBlock(block.id, 'up')}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-brand-black dark:hover:text-white disabled:opacity-20 transition-colors"
            title="Naik"
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => moveBlock(block.id, 'down')}
            disabled={index === blocks.length - 1}
            className="p-1.5 text-gray-400 hover:text-brand-black dark:hover:text-white disabled:opacity-20 transition-colors"
            title="Turun"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          <div className="w-px h-4 bg-gray-100 dark:bg-white/5 mx-1" />

          <button
            onClick={() => {
              if (confirm('Hapus blok ini?')) {
                removeBlock(block.id)
              }
            }}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex items-center gap-1.5"
            title="Hapus blok"
          >
            <Trash2 size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Hapus</span>
          </button>
        </div>
      </div>

      <div className={cn(
        "rounded-[26px] border px-3 py-3 transition-all duration-200 lg:px-4 lg:py-4",
        isActive
          ? "border-brand-red/20 bg-brand-red/[0.03] shadow-[0_16px_40px_rgba(224,36,36,0.08)] dark:border-brand-red/20 dark:bg-brand-red/[0.06]"
          : "border-transparent bg-transparent group-hover:border-gray-200/70 group-hover:bg-gray-50/40 dark:group-hover:border-white/10 dark:group-hover:bg-white/[0.02]"
      )}>
        {children}
      </div>

      <div
        className={cn(
          "relative mt-3 h-8 transition-opacity lg:mt-4",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gray-100 dark:bg-white/5" />
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={cn(
              "absolute flex h-8 items-center gap-2 rounded-full border bg-white px-3 text-xs font-semibold text-gray-500 shadow-sm transition-all dark:bg-slate-900 dark:text-gray-300",
              showAddMenu || isActive
                ? "border-brand-red/30 text-brand-red dark:border-brand-red/30"
                : "border-gray-200 dark:border-white/10 hover:border-brand-red/30 hover:text-brand-red"
            )}
            title="Sisipkan blok setelah bagian ini"
          >
            <Plus size={14} className={cn("transition-transform", showAddMenu && "rotate-45")} />
            <span>Tambah blok</span>
          </button>
        </div>
      </div>
      
      {showAddMenu && (
        <div className="my-5 animate-in fade-in slide-in-from-top-2 lg:my-6">
          <AddBlockMenu afterId={block.id} onClose={() => setShowAddMenu(false)} />
        </div>
      )}
    </div>
  )
}

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
          "absolute -top-5 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ease-out",
          isActive 
            ? "opacity-100 pointer-events-auto translate-y-0" 
            : "pointer-events-none translate-y-2 scale-95 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-0.5 rounded-full border border-gray-200/50 bg-white/95 p-1 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
          <div className="mr-1 flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <GripVertical size={11} className="text-gray-400/60" />
            <span className="select-none">Blok {index + 1}</span>
          </div>
          
          <button
            onClick={() => moveBlock(block.id, 'up')}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-20 dark:hover:bg-white/5 dark:hover:text-white"
            title="Naik"
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => moveBlock(block.id, 'down')}
            disabled={index === blocks.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-20 dark:hover:bg-white/5 dark:hover:text-white"
            title="Turun"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          <div className="mx-1 h-3.5 w-px bg-gray-200/60 dark:bg-white/10" />

          <button
            onClick={() => {
              if (confirm('Hapus blok ini?')) {
                removeBlock(block.id)
              }
            }}
            className="group/del flex h-8 items-center gap-1.5 rounded-full px-3 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Hapus blok"
          >
            <Trash2 size={13} strokeWidth={2.5} className="transition-transform group-hover/del:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-widest">Hapus</span>
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
          "mt-4 flex justify-end transition-opacity lg:mt-5",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <button 
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={cn(
            "inline-flex h-8 items-center rounded-full border bg-white/80 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all backdrop-blur-md dark:bg-slate-900/80",
            showAddMenu || isActive
              ? "gap-2 border-brand-red/30 px-4 text-brand-red dark:border-brand-red/30"
              : "gap-0 border-gray-200 px-2.5 text-gray-400 dark:border-white/10 dark:text-gray-500 hover:gap-2 hover:border-brand-red/30 hover:px-4 hover:text-brand-red"
          )}
          title="Sisipkan blok setelah bagian ini"
          aria-label="Tambah blok"
        >
          <Plus size={14} className={cn("transition-transform duration-300", showAddMenu && "rotate-45")} />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300",
              showAddMenu || isActive
                ? "max-w-24 opacity-100"
                : "max-w-0 opacity-0 group-hover:max-w-24 group-hover:opacity-100"
            )}
          >
            Tambah blok
          </span>
        </button>
      </div>
      
      {showAddMenu && (
        <div className="my-5 animate-in fade-in slide-in-from-top-2 lg:my-6">
          <AddBlockMenu afterId={block.id} onClose={() => setShowAddMenu(false)} />
        </div>
      )}
    </div>
  )
}

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
    return <div className="py-1">{children}</div>
  }

  return (
    <div
      className="group relative mb-1"
      onClick={() => setActiveBlockId(block.id)}
      onFocusCapture={() => setActiveBlockId(block.id)}
    >
      <div
        className={cn(
          "absolute -top-5 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ease-out",
          isActive 
            ? "opacity-100 pointer-events-auto translate-y-0" 
            : "pointer-events-none translate-y-2 scale-95 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-0.5 rounded-full border border-gray-200/50 bg-white/95 p-0.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
          <div className="mr-0.5 flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-gray-400 dark:bg-white/5 dark:text-gray-500">
            <GripVertical size={10} className="opacity-40" />
            <span className="select-none">{index + 1}</span>
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
            disabled={index === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-10 dark:hover:bg-white/5 dark:hover:text-white"
            title="Naik"
          >
            <ChevronUp size={12} strokeWidth={3} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
            disabled={index === blocks.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black disabled:opacity-10 dark:hover:bg-white/5 dark:hover:text-white"
            title="Turun"
          >
            <ChevronDown size={12} strokeWidth={3} />
          </button>

          <div className="mx-0.5 h-3 w-px bg-gray-200/60 dark:bg-white/10" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Hapus blok ini?')) {
                removeBlock(block.id)
              }
            }}
            className="group/del flex h-7 items-center gap-1 rounded-full px-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Hapus"
          >
            <Trash2 size={11} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className={cn(
        "relative rounded-lg border-2 transition-all duration-200",
        isActive
          ? "border-brand-red/10 bg-brand-red/[0.01] dark:border-brand-red/20 dark:bg-brand-red/[0.02]"
          : "border-transparent bg-transparent"
      )}>
        <div className="px-2 py-1 lg:px-3 lg:py-1.5">
          {children}
        </div>
      </div>

      <div
        className={cn(
          "relative -mb-1 flex items-center justify-center py-2 transition-all duration-300",
          isActive ? "opacity-100 h-8" : "opacity-0 h-2 group-hover:opacity-100 group-hover:h-8"
        )}
      >
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-white/5" />
        
        <button 
          onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu); }}
          className={cn(
            "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:border-brand-red/50 hover:text-brand-red dark:border-white/10 dark:bg-slate-900",
            showAddMenu && "rotate-45 border-brand-red text-brand-red"
          )}
          title="Tambah blok"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>
      
      {showAddMenu && (
        <div className="my-2 animate-in fade-in slide-in-from-top-1">
          <AddBlockMenu afterId={block.id} onClose={() => setShowAddMenu(false)} />
        </div>
      )}
    </div>
  )
}

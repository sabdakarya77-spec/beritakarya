'use client'
import { type ReactNode, useRef, useState } from 'react'
import { useEditorStore } from '../../../../store/editorStore'
import type { Block } from '@beritakarya/types'
import { Plus } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { AddBlockMenu } from '../../AddBlockMenu'
import { BlockActionRail } from '../gridblock/shared/BlockActionRail'

interface Props {
  block: Block
  index: number
  children: ReactNode
}

/**
 * GridBlockWrapper — Shell untuk setiap block di GridBlock mode.
 *
 * Sisakan:
 * - selected state (active border)
 * - block shell (container + styling)
 *
 * Toolbar action dipindahkan ke BlockActionRail (shared component).
 */
export function GridBlockWrapper({ block, index, children }: Props) {
  const { blocks, isFocusMode, activeBlockId, setActiveBlockId, addBlock } = useEditorStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const isActive = activeBlockId === block.id

  if (isFocusMode) {
    return <div className="py-1">{children}</div>
  }

  return (
    <div
      className="group relative"
      onClick={() => setActiveBlockId(block.id)}
      onFocusCapture={() => setActiveBlockId(block.id)}
    >
      {/* Block Actions Toolbar — dipisahkan ke shared component */}
      <div
        className={cn(
          "absolute -top-4 right-0 z-30 transition-all duration-300 ease-out",
          isActive
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "pointer-events-none translate-y-2 scale-95 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        <BlockActionRail blockId={block.id} index={index} totalBlocks={blocks.length} />
      </div>

      {/* Block Content */}
      <div className={cn(
        "relative rounded-lg transition-all duration-200",
        isActive
          ? "border-2 border-brand-red/10 bg-brand-red/[0.01] dark:border-brand-red/20 dark:bg-brand-red/[0.02]"
          : "border-0 bg-transparent group-hover:border group-hover:border-gray-100 dark:group-hover:border-white/5"
      )}>
        <div className="px-1 py-0.5 lg:px-2 lg:py-0.5">
          {children}
        </div>
      </div>

      {/* Add Block Button */}
      <div
        className={cn(
          "absolute bottom-0 right-0 z-30 flex items-center justify-end pb-1 pr-1 transition-all duration-300",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu) }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-all hover:text-gray-900 dark:hover:text-white",
            showAddMenu && "rotate-45 text-gray-900 dark:text-white"
          )}
          title="Tambah blok"
        >
          <Plus size={13} strokeWidth={3} />
        </button>
      </div>
      
      {showAddMenu && (
        <div className="my-2 animate-in fade-in slide-in-from-top-1">
          <AddBlockMenu afterId={block.id} isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} />
        </div>
      )}
    </div>
  )
}
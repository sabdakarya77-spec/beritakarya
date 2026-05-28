'use client'

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { type Editor } from '@tiptap/react'
import { cn } from '../../../../../../lib/utils'

export interface SlashMenuItem {
  title: string
  description: string
  icon: string
  aliases?: string[]
  command: (editor: Editor) => void
}

export interface SlashMenuProps {
  editor: Editor
  items: SlashMenuItem[]
  command: (item: SlashMenuItem) => void
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const SlashMenuComponent = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ editor, items, command }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    
    // Update selected index when items change
    useEffect(() => {
      setSelectedIndex(0)
    }, [items])
    
    // Expose onKeyDown to parent for keyboard navigation
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
          return true
        }
        
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length)
          return true
        }
        
        if (event.key === 'Enter') {
          if (items[selectedIndex]) {
            command(items[selectedIndex])
          }
          return true
        }
        
        return false
      },
    }))
    
    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          // Close menu - handled by parent extension
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    // Scroll selected item into view
    useEffect(() => {
      const selectedElement = containerRef.current?.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])
    
    if (items.length === 0) {
      return (
        <div
          ref={containerRef}
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl p-2 min-w-[200px]"
        >
          <p className="text-xs text-gray-400 px-3 py-2">Tidak ada hasil</p>
        </div>
      )
    }
    
    return (
      <div
        ref={containerRef}
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden max-h-[320px] overflow-y-auto min-w-[200px]"
      >
        <div className="p-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 mb-1">
            Sisipkan Blok
          </p>
          {items.map((item, index) => (
            <button
              key={index}
              data-index={index}
              onClick={() => command(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                index === selectedIndex
                  ? "bg-brand-red/10 dark:bg-brand-red/20"
                  : "hover:bg-gray-50 dark:hover:bg-white/5",
                "text-left group"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black",
                  index === selectedIndex
                    ? "bg-brand-red/20 text-brand-red"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                  "group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors"
                )}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
              {index === selectedIndex && (
                <div className="text-[10px] text-gray-400 hidden sm:block">
                  Tekan Enter
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Keyboard hints */}
        <div className="px-3 pb-2 flex items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-2">
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">↑↓</kbd>
            <span>Navigasi</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">Enter</kbd>
            <span>Pilih</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">Esc</kbd>
            <span>Tutup</span>
          </div>
        </div>
      </div>
    )
  }
)

SlashMenuComponent.displayName = 'SlashMenuComponent'

export default SlashMenuComponent
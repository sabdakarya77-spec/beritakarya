'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * Slash command item definition
 */
interface SlashCommandItem {
  title: string
  description: string
  icon: string
  command: (editor: Editor) => void
}

/**
 * Default slash commands
 */
const DEFAULT_COMMANDS: SlashCommandItem[] = [
  {
    title: 'Paragraph',
    description: 'Teks paragraf biasa',
    icon: '📝',
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Heading 1',
    description: 'Judul besar',
    icon: 'H1',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Judul sedang',
    icon: 'H2',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Judul kecil',
    icon: 'H3',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'Daftar dengan poin',
    icon: '•',
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Daftar bernomor',
    icon: '1.',
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Quote',
    description: 'Kutipan blok',
    icon: '"',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    description: 'Blok kode',
    icon: '{ }',
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Divider',
    description: 'Garis pemisah',
    icon: '—',
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

/**
 * GridBlockSlashMenu Props
 */
export interface GridBlockSlashMenuProps {
  editor: Editor
  commands?: SlashCommandItem[]
}

/**
 * GridBlockSlashMenu Component
 * 
 * Provides slash command functionality for quick block insertion.
 * Shows a dropdown menu when user types "/" at the start of a line.
 */
export function GridBlockSlashMenu({ 
  editor, 
  commands = DEFAULT_COMMANDS 
}: GridBlockSlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  // Filter commands based on query
  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  )

  // Listen for "/" character input
  useEffect(() => {
    if (!editor) return

    const handleTransaction = () => {
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 10),
        from,
        '\n'
      )

      // Check if there's a slash at the start
      if (textBefore.includes('/') && !textBefore.includes(' ')) {
        const queryText = textBefore.split('/').pop() || ''
        setQuery(queryText)
        setIsOpen(true)
        setSelectedIndex(0)
        
        // Get cursor position for menu placement
        const coords = editor.view.coordsAtPos(from)
        setPosition({
          top: coords.bottom + 8,
          left: coords.left,
        })
      } else {
        setIsOpen(false)
        setQuery('')
      }
    }

    editor.on('transaction', handleTransaction)
    return () => editor.off('transaction', handleTransaction)
  }, [editor])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => 
            i < filteredCommands.length - 1 ? i + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => 
            i > 0 ? i - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].command(editor)
            setIsOpen(false)
            setQuery('')
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, editor])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border py-2 min-w-[240px] max-h-[320px] overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 pb-2 text-xs text-gray-500 border-b">
        Slash Commands
      </div>
      
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.title}
          type="button"
          onClick={() => {
            cmd.command(editor)
            setIsOpen(false)
            setQuery('')
          }}
          className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
            index === selectedIndex ? 'bg-blue-50' : ''
          }`}
        >
          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-sm font-medium">
            {cmd.icon}
          </span>
          <div>
            <div className="text-sm font-medium text-gray-900">{cmd.title}</div>
            <div className="text-xs text-gray-500">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default GridBlockSlashMenu
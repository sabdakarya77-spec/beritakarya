'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

interface SlashCommandItem {
  title: string
  description: string
  icon: string
  command: (editor: Editor) => void
}

const DEFAULT_COMMANDS: SlashCommandItem[] = [
  { title: 'Paragraph', description: 'Teks paragraf biasa', icon: '📝',
    command: (ed) => ed.chain().focus().setParagraph().run() },
  { title: 'Heading 1', description: 'Judul besar', icon: 'H1',
    command: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Judul sedang', icon: 'H2',
    command: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Bullet List', description: 'Daftar dengan poin', icon: '•',
    command: (ed) => ed.chain().focus().toggleBulletList().run() },
  { title: 'Quote', description: 'Kutipan blok', icon: '"',
    command: (ed) => ed.chain().focus().toggleBlockquote().run() },
]

export function GridBlockSlashMenu({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return () => {}
    
    const handleTransaction = () => {
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 10), from, '\n')
      setIsOpen(textBefore.includes('/'))
    }
    
    editor.on('transaction', handleTransaction)
    return () => { editor.off('transaction', handleTransaction) }
  }, [editor])

  if (!isOpen) return null

  return (
    <div ref={menuRef} className="absolute z-50 bg-white rounded shadow-lg border p-2 min-w-[200px]">
      {DEFAULT_COMMANDS.map((cmd) => (
        <button key={cmd.title} type="button" onClick={() => { cmd.command(editor); setIsOpen(false) }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded">
          <span className="mr-2">{cmd.icon}</span>{cmd.title}
        </button>
      ))}
    </div>
  )
}

export default GridBlockSlashMenu
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { 
  Plus,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Image,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

interface FloatingMenuBarProps {
  editor: Editor
}

/**
 * Custom Floating Menu - appears on empty lines
 * Shows quick insert options: Heading, List, Quote, Code, Divider, Image
 */
export function FloatingMenuBar({ editor }: FloatingMenuBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const { state } = editor
    const { selection } = state
    const { $from } = selection

    // Check if current line is empty
    const currentLineText = $from.nodeBefore?.textContent || ''
    const isEmptyLine = $from.parentOffset === 0 && currentLineText.trim() === ''

    if (!isEmptyLine) {
      setIsVisible(false)
      return
    }

    const { view } = editor
    const coords = view.coordsAtPos($from.pos)
    
    setPosition({ 
      top: coords.top, 
      left: coords.left - 60 
    })
    setIsVisible(true)
  }, [editor])

  useEffect(() => {
    const handleTransaction = () => {
      updatePosition()
    }

    editor.on('transaction', handleTransaction)
    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [editor, updatePosition])

  if (!isVisible) return null

  const insertImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const menuItems = [
    {
      icon: <Heading1 size={16} />,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 size={16} />,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 size={16} />,
      title: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      icon: <List size={16} />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered size={16} />,
      title: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: <Quote size={16} />,
      title: 'Quote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: <Code size={16} />,
      title: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      icon: <Minus size={16} />,
      title: 'Divider',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
  ]

  return (
    <div 
      className="fixed z-40 flex items-center gap-1 p-1.5 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-700 opacity-0 hover:opacity-100 transition-opacity"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={insertImage}
        title="Insert Image"
        className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
      >
        <Image size={16} />
      </button>

      <div className="w-px h-5 bg-slate-600" />

      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          title={item.title}
          className={cn(
            'p-2 rounded-lg transition-colors',
            item.isActive()
              ? 'bg-brand-red/20 text-brand-red'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}

export default FloatingMenuBar
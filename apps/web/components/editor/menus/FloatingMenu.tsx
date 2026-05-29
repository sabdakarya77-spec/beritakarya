'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
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
 * Custom Floating Menu - appears on empty lines using Tiptap FloatingMenuPlugin
 * Shows quick insert options: Heading, List, Quote, Code, Divider, Image
 */
export function FloatingMenuBar({ editor }: FloatingMenuBarProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const pluginRef = useRef<ReturnType<typeof FloatingMenuPlugin> | null>(null)

  useEffect(() => {
    if (!editor || !elementRef.current) return

    pluginRef.current = FloatingMenuPlugin({
      editor,
      element: elementRef.current,
      pluginKey: 'floatingMenuBar',
      shouldShow: ({ editor: ed, view }) => {
        const { selection } = view.state
        const { $anchor, empty } = selection
        
        // Only show when selection is empty (cursor) and at the start of a paragraph
        if (!empty) return false
        
        // Check if cursor is at the start of an empty paragraph
        const isAtStart = $anchor.parent.type.name === 'paragraph' && 
          $anchor.parent.content.size === 0
        
        return isAtStart
      },
    })

    editor.registerPlugin(pluginRef.current)

    return () => {
      if (pluginRef.current) {
        editor.unregisterPlugin('floatingMenuBar')
      }
    }
  }, [editor])

  const insertImage = useCallback(() => {
    const url = window.prompt('Enter image URL')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const menuItems = [
    {
      icon: <Heading1 size={16} />,
      title: 'Heading 1',
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 size={16} />,
      title: 'Heading 2',
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 size={16} />,
      title: 'Heading 3',
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor?.isActive('heading', { level: 3 }),
    },
    {
      icon: <List size={16} />,
      title: 'Bullet List',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList'),
    },
    {
      icon: <ListOrdered size={16} />,
      title: 'Numbered List',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList'),
    },
    {
      icon: <Quote size={16} />,
      title: 'Quote',
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote'),
    },
    {
      icon: <Code size={16} />,
      title: 'Code Block',
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock'),
    },
    {
      icon: <Minus size={16} />,
      title: 'Divider',
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
  ]

  return (
    <div
      ref={elementRef}
      className="flex items-center gap-1 p-1.5 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-700"
      style={{ display: 'none' }}
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
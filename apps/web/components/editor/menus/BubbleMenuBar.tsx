'use client'

import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link,
  Highlighter
} from 'lucide-react'
import { cn } from '../../../lib/utils'

interface BubbleMenuBarProps {
  editor: Editor
}

/**
 * Bubble Menu - appears on text selection using Tiptap BubbleMenuPlugin
 * Shows formatting options: Bold, Italic, Underline, Strike, Code, Link, Highlight
 */
export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const pluginRef = useRef<ReturnType<typeof BubbleMenuPlugin> | null>(null)

  useEffect(() => {
    if (!editor || !elementRef.current) return

    pluginRef.current = BubbleMenuPlugin({
      editor,
      element: elementRef.current,
      pluginKey: 'bubbleMenuBar',
      shouldShow: ({ editor: ed }) => {
        return !ed.state.selection.empty
      },
    })

    editor.registerPlugin(pluginRef.current)

    return () => {
      if (pluginRef.current) {
        editor.unregisterPlugin('bubbleMenuBar')
      }
    }
  }, [editor])

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL', previousUrl)

    if (url === null) return
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      ref={elementRef}
      className="flex items-center gap-1 p-1 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-700"
      style={{ display: 'none' }}
    >
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Code"
      >
        <Code size={16} />
      </BubbleButton>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      <BubbleButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Add Link (Ctrl+K)"
      >
        <Link size={16} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={16} />
      </BubbleButton>
    </div>
  )
}

interface BubbleButtonProps {
  onClick: () => void
  isActive: boolean
  title: string
  children: React.ReactNode
}

function BubbleButton({ onClick, isActive, title, children }: BubbleButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-colors',
        isActive
          ? 'bg-brand-red text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      )}
    >
      {children}
    </button>
  )
}

export default BubbleMenuBar
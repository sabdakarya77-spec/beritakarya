'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
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
 * Custom Bubble Menu - appears on text selection
 * Shows formatting options: Bold, Italic, Underline, Strike, Code, Link, Highlight
 */
export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const { from, to } = editor.state.selection
    if (from === to) {
      setIsVisible(false)
      return
    }

    const { view } = editor
    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)
    
    const left = (start.left + end.left) / 2
    const top = start.top - 50

    setPosition({ top, left })
    setIsVisible(true)
  }, [editor])

  useEffect(() => {
    const handleSelectionChange = () => {
      updatePosition()
    }

    editor.on('selectionUpdate', handleSelectionChange)
    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
    }
  }, [editor, updatePosition])

  if (!isVisible) return null

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
      className="fixed z-50 flex items-center gap-1 p-1 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
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
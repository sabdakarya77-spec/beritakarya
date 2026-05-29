'use client'

import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { FloatingMenu } from '@tiptap/react/menus'
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
  AlertCircle,
  Columns,
  GalleryHorizontal,
  Grid,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

interface FloatingMenuBarProps {
  editor: Editor
}

/**
 * Floating Menu — appears on empty paragraph lines.
 * Uses Tiptap's built-in FloatingMenu component (same pattern as BubbleMenu)
 * for reliable plugin lifecycle management.
 */
export function FloatingMenuBar({ editor }: FloatingMenuBarProps) {
  const insertImage = useCallback(() => {
    const url = window.prompt('Masukkan URL gambar')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const menuItems = [
    {
      icon: <Image size={16} />,
      title: 'Gambar',
      action: () => insertImage(),
    },
    { divider: true },
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
    { divider: true },
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
    { divider: true },
    {
      icon: <Quote size={16} />,
      title: 'Kutipan',
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: 'quote',
            attrs: { variant: 'default' },
            content: [{ type: 'paragraph' }],
          })
          .run(),
      isActive: () => editor?.isActive('quote'),
    },
    {
      icon: <AlertCircle size={16} />,
      title: 'Callout',
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: 'callout',
            attrs: { variant: 'info', icon: '💡' },
            content: [{ type: 'paragraph' }],
          })
          .run(),
      isActive: () => editor?.isActive('callout'),
    },
    {
      icon: <Columns size={16} />,
      title: 'Media + Teks',
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: 'mediaText',
            attrs: { layout: 'left', imageUrl: '' },
            content: [{ type: 'paragraph' }],
          })
          .run(),
    },
    {
      icon: <Grid size={16} />,
      title: 'Image Grid',
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: 'imageGrid',
            attrs: { cols: 2, images: [] },
          })
          .run(),
    },
    {
      icon: <GalleryHorizontal size={16} />,
      title: 'Galeri',
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: 'gallery',
            attrs: { images: [] },
          })
          .run(),
    },
    { divider: true },
    {
      icon: <Code size={16} />,
      title: 'Code Block',
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock'),
    },
    {
      icon: <Minus size={16} />,
      title: 'Pemisah',
      action: () => editor?.chain().focus().setHorizontalRule().run(),
    },
  ]

  return (
    <FloatingMenu
      editor={editor}
      options={{
        placement: 'bottom-start',
        offset: 8,
      }}
      shouldShow={({ state }) => {
        const { $anchor, empty } = state.selection
        if (!empty) return false
        // Only show on truly empty paragraphs
        return (
          $anchor.parent.type.name === 'paragraph' &&
          $anchor.parent.content.size === 0
        )
      }}
    >
      <div className="floating-menu-bar flex items-center gap-0.5 p-1.5 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-sm">
        {menuItems.map((item, index) => {
          if ('divider' in item) {
            return (
              <div
                key={`divider-${index}`}
                className="w-px h-5 bg-slate-600/60 mx-0.5"
              />
            )
          }

          const isActive = 'isActive' in item && item.isActive?.()

          return (
            <button
              key={index}
              onClick={item.action}
              title={item.title}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-brand-red/20 text-brand-red'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-110'
              )}
            >
              {item.icon}
            </button>
          )
        })}
      </div>
    </FloatingMenu>
  )
}

export default FloatingMenuBar
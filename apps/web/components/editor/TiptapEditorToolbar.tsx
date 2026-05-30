'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Code2,
  Unlink,
  GalleryHorizontal,
  Grid,
  Columns,
  AlertCircle,
  Video
} from 'lucide-react'
import { MediaLibraryModal } from './MediaLibraryModal'
import { type MediaItem } from '../../hooks/useMediaLibrary'

interface TiptapEditorToolbarProps {
  editor: Editor
}

/**
 * Toolbar for Tiptap Editor
 * Provides formatting controls and actions
 */
export function TiptapEditorToolbar({ editor }: TiptapEditorToolbarProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Masukkan URL:', previousUrl)
    
    if (url === null) return
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleMediaSelect = (media: MediaItem) => {
    if (media.url) {
      editor.chain().focus().setImage({ 
        src: media.url,
        alt: media.altText || ''
      }).run()
    }
    setShowMediaLibrary(false)
  }

  const addImage = () => {
    setShowMediaLibrary(true)
  }

  return (
    <div className="tiptap-editor-toolbar-container max-w-full overflow-hidden">
      <div className="tiptap-toolbar flex flex-nowrap lg:flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-t-lg overflow-x-auto no-scrollbar max-w-full">
      {/* Undo/Redo */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Text Formatting */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Blockquote & Code Block */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex shrink-0 items-center gap-1 pr-2 border-r border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Link & Image */}
      <div className="flex shrink-0 items-center gap-1">
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Insert Link (Ctrl+K)"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          title="Insert Image"
        >
          <Image className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Premium Interactive Blocks */}
      <div className="flex shrink-0 items-center gap-1 pl-2 border-l border-gray-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: 'gallery', attrs: { images: [] } }).run()}
          active={editor.isActive('gallery')}
          title="Sisipkan Galeri Gambar"
          className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/30"
        >
          <GalleryHorizontal className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: 'imageGrid', attrs: { cols: 2, images: [] } }).run()}
          active={editor.isActive('imageGrid')}
          title="Sisipkan Grid Gambar"
          className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/30"
        >
          <Grid className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: 'mediaText', attrs: { layout: 'left', imageUrl: '' }, content: [{ type: 'paragraph' }] }).run()}
          active={editor.isActive('mediaText')}
          title="Sisipkan Media + Teks"
          className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
        >
          <Columns className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: 'callout', attrs: { variant: 'info', icon: '💡' }, content: [{ type: 'paragraph' }] }).run()}
          active={editor.isActive('callout')}
          title="Sisipkan Callout Box"
          className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/30"
        >
          <AlertCircle className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Masukkan URL Embed (YouTube, Twitter, dll.):')
            if (url) {
              editor.chain().focus().setEmbed({ src: url }).run()
            }
          }}
          active={editor.isActive('embed')}
          title="Embed Video / URL"
          className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/30"
        >
          <Video className="w-4 h-4" />
        </ToolbarButton>
      </div>
      
      {showMediaLibrary && (
          <MediaLibraryModal
            isOpen={showMediaLibrary}
            onClose={() => setShowMediaLibrary(false)}
            onSelect={handleMediaSelect}
          />
        )}
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  className?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, className, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={`
        p-2 rounded transition-colors duration-200
        ${active
          ? 'bg-brand-red text-white'
          : className || 'hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

export default TiptapEditorToolbar
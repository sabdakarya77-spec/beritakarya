'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Bold, Italic, Underline, Strikethrough, Link2, Highlighter, Palette, Eraser, X } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface InlineToolbarProps {
  editorRef: React.RefObject<HTMLElement | null>
  onFormat?: (command: string, value?: string) => void
  active?: boolean
}

export function InlineToolbar({ editorRef, onFormat, active = false }: InlineToolbarProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  const HIGHLIGHT_COLORS: { label: string; value: string }[] = [
    { label: 'Kuning', value: '#FEF08A' },
    { label: 'Hijau', value: '#BBF7D0' },
    { label: 'Biru Muda', value: '#BAE6FD' },
    { label: 'Pink', value: '#FECDD3' },
    { label: 'Hapus', value: '' },
  ]

  const TEXT_COLORS: { label: string; value: string }[] = [
    { label: 'Merah', value: '#DC2626' },
    { label: 'Biru', value: '#2563EB' },
    { label: 'Abu-abu', value: '#6B7280' },
    { label: 'Hijau Tua', value: '#059669' },
    { label: 'Hapus', value: '' },
  ]

  const hideToolbar = useCallback(() => {
    setVisible(false)
    setShowLinkInput(false)
    setLinkUrl('')
  }, [])

  const handleSelectionChange = useCallback(() => {
    const editor = editorRef.current
    const selection = window.getSelection()

    if (!editor) {
      hideToolbar()
      return
    }

    if (!selection || !selection.rangeCount) {
      if (active) {
        const editorRect = editor.getBoundingClientRect()
        setPosition({ top: -40, left: 8 })
        setVisible(true)
        return
      }
      hideToolbar()
      return
    }

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()
    const selectionInsideEditor = editor.contains(range.commonAncestorContainer)

    if (!selectionInsideEditor) {
      if (active) {
        setPosition({ top: -40, left: 8 })
        setVisible(true)
        return
      }
      hideToolbar()
      return
    }

    if (!text || selection.isCollapsed) {
      if (active) {
        const rect = range.getBoundingClientRect()
        const editorRect = editor.getBoundingClientRect()
        
        // If we have a valid caret position, use it
        if (rect.top !== 0 || rect.left !== 0) {
          const top = rect.top - editorRect.top - 48
          const left = rect.left - editorRect.left - 45 // Center roughly over caret
          setPosition({
            top: top,
            left: Math.max(8, Math.min(left, editorRect.width - 200))
          })
        } else {
          setPosition({ top: -40, left: 8 })
        }
        setVisible(true)
        return
      }
      hideToolbar()
      return
    }

    const rect = range.getBoundingClientRect()
    const editorRect = editor.getBoundingClientRect()

    const top = rect.top - editorRect.top - 48
    const left = rect.left - editorRect.left + (rect.width / 2) - 90

    setPosition({
      top: Math.max(0, top),
      left: Math.max(8, Math.min(left, editorRect.width - 200))
    })
    setVisible(true)
  }, [active, editorRef, hideToolbar])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionChange)
    document.addEventListener('touchend', handleSelectionChange)
    document.addEventListener('selectionchange', handleSelectionChange)
    window.addEventListener('resize', handleSelectionChange)
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('touchend', handleSelectionChange)
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('resize', handleSelectionChange)
    }
  }, [handleSelectionChange])

  useEffect(() => {
    handleSelectionChange()
  }, [active, handleSelectionChange])

  const execCommand = (command: string, value?: string) => {
    if (command === 'createLink') {
      const url = prompt('Masukkan URL:', linkUrl || 'https://')
      if (url) {
        document.execCommand('createLink', false, url)
        onFormat?.('createLink', url)
      }
    } else {
      document.execCommand(command, false, value)
      onFormat?.(command, value)
    }
    setShowLinkInput(false)
    setLinkUrl('')
    requestAnimationFrame(() => handleSelectionChange())
  }

  const handleBold = () => execCommand('bold')
  const handleItalic = () => execCommand('italic')
  const handleUnderline = () => execCommand('underline')
  const handleLink = () => {
    setShowLinkInput(true)
    setTimeout(() => linkInputRef.current?.focus(), 50)
  }

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    execCommand('createLink', linkUrl || 'https://')
  }

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "absolute z-50 flex items-center gap-0.5 rounded-full border border-gray-200/80 bg-white/95 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl",
        "dark:border-white/10 dark:bg-slate-900/95"
      )}
      style={{ top: position.top, left: position.left }}
    >
      {showLinkInput ? (
        <form onSubmit={handleLinkSubmit} className="flex items-center gap-1 px-1">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL..."
            className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-brand-black outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-brand-black dark:hover:text-white"
          >
            <Link2 size={13} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowLinkInput(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500"
          >
            <X size={13} />
          </button>
        </form>
      ) : (
        <>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleBold}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Bold (Ctrl+B)"
          >
            <Bold size={13} strokeWidth={3} />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleItalic}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Italic (Ctrl+I)"
          >
            <Italic size={13} strokeWidth={3} />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUnderline}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Underline (Ctrl+U)"
          >
            <Underline size={13} strokeWidth={3} />
          </button>
          <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-white/10" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLink}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Sisipkan link"
          >
            <Link2 size={13} />
          </button>
          <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-white/10" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('strikeThrough')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Strikethrough"
          >
            <Strikethrough size={13} strokeWidth={3} />
          </button>
          <div className="relative">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker)
                setShowColorPicker(false)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
              title="Highlight (stabilo warna)"
            >
              <Highlighter size={13} />
            </button>
            {showHighlightPicker && (
              <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                {HIGHLIGHT_COLORS.map(({ label, value }) => (
                  <button
                    key={value || 'clear'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (value) {
                        execCommand('backColor', value)
                      } else {
                        execCommand('removeFormat')
                      }
                      setShowHighlightPicker(false)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-medium transition-transform hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: value || '#f3f4f6',
                      color: value ? '#000' : '#6b7280',
                      border: value ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #d1d5db',
                    }}
                    title={label}
                  >
                    {!value ? <Eraser size={10} /> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowColorPicker(!showColorPicker)
                setShowHighlightPicker(false)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
              title="Warna teks"
            >
              <Palette size={13} />
            </button>
            {showColorPicker && (
              <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                {TEXT_COLORS.map(({ label, value }) => (
                  <button
                    key={value || 'clear'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (value) {
                        execCommand('foreColor', value)
                      } else {
                        execCommand('foreColor', '#000000')
                        // On some browsers removeFormat works better for resetting color
                        document.execCommand('removeFormat', false)
                      }
                      setShowColorPicker(false)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-medium transition-transform hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: value || '#f3f4f6',
                      color: value ? '#fff' : '#6b7280',
                      border: value ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #d1d5db',
                    }}
                    title={label}
                  >
                    {!value ? <Eraser size={10} /> : 
                      value === '#DC2626' ? 'A' :
                      value === '#2563EB' ? 'A' :
                      value === '#6B7280' ? 'A' :
                      value === '#059669' ? 'A' : null
                    }
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('removeFormat')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Hapus format"
          >
            <Eraser size={13} />
          </button>
        </>
      )}
    </div>
  )
}

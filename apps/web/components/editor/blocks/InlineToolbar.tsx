'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Bold, Italic, Underline, Link2, X } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface InlineToolbarProps {
  editorRef: React.RefObject<HTMLElement | null>
  onFormat?: (command: string, value?: string) => void
}

export function InlineToolbar({ editorRef, onFormat }: InlineToolbarProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  const hideToolbar = useCallback(() => {
    setVisible(false)
    setShowLinkInput(false)
    setLinkUrl('')
  }, [])

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      hideToolbar()
      return
    }

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()

    if (!text || !editorRef.current?.contains(range.commonAncestorContainer)) {
      hideToolbar()
      return
    }

    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()

    const top = rect.top - editorRect.top - 48
    const left = rect.left - editorRect.left + (rect.width / 2) - 90

    setPosition({
      top: Math.max(0, top),
      left: Math.max(8, Math.min(left, editorRect.width - 200))
    })
    setVisible(true)
  }, [editorRef, hideToolbar])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionChange)
    document.addEventListener('touchend', handleSelectionChange)
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('touchend', handleSelectionChange)
    }
  }, [handleSelectionChange])

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
    hideToolbar()
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
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-brand-black dark:hover:text-white"
          >
            <Link2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500"
          >
            <X size={13} />
          </button>
        </form>
      ) : (
        <>
          <button
            onClick={handleBold}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Bold (Ctrl+B)"
          >
            <Bold size={13} strokeWidth={3} />
          </button>
          <button
            onClick={handleItalic}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Italic (Ctrl+I)"
          >
            <Italic size={13} strokeWidth={3} />
          </button>
          <button
            onClick={handleUnderline}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Underline (Ctrl+U)"
          >
            <Underline size={13} strokeWidth={3} />
          </button>
          <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-white/10" />
          <button
            onClick={handleLink}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Sisipkan link"
          >
            <Link2 size={13} />
          </button>
        </>
      )}
    </div>
  )
}
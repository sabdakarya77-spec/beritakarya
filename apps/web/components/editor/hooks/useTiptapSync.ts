'use client'

import { useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorStore } from '../../../store/editorStore'
import type { Block } from '@beritakarya/types'

/**
 * Hook untuk sinkronisasi Tiptap editor dengan EditorStore
 * 
 * Fungsi:
 * - Ambil blocks dari store → set ke Tiptap
 * - Ambil perubahan dari Tiptap → update store
 * - Handle autosave
 */
export function useTiptapSync(editor: Editor | null) {
  const { blocks, setBlocks, isDirty, saveArticle } = useEditorStore()

  // Convert Tiptap JSON ke Block[]
  const tiptapToBlocks = useCallback((editorInstance: Editor): Block[] => {
    const doc = editorInstance.getJSON()
    const content = doc.content || []
    
    return content.map((node, index) => {
      const baseBlock = {
        id: `block-${Date.now()}-${index}`,
      }

      switch (node.type) {
        case 'paragraph':
          return {
            ...baseBlock,
            type: 'paragraph' as const,
            content: extractTextContent(node),
          }
        case 'heading':
          return {
            ...baseBlock,
            type: 'heading' as const,
            level: (node.attrs?.level || 2) as 1 | 2 | 3 | 4 | 5 | 6,
            content: extractTextContent(node),
            textAlign: node.attrs?.textAlign,
          }
        case 'blockquote':
          return {
            ...baseBlock,
            type: 'quote' as const,
            content: extractTextContent(node),
          }
        case 'image':
          return {
            ...baseBlock,
            type: 'image' as const,
            url: node.attrs?.src || '',
            alt: node.attrs?.alt || '',
            caption: node.attrs?.title || '',
          }
        case 'codeBlock':
          return {
            ...baseBlock,
            type: 'paragraph' as const, // Map code block to paragraph for now
            content: extractTextContent(node),
          }
        default:
          return {
            ...baseBlock,
            type: 'paragraph' as const,
            content: extractTextContent(node),
          }
      }
    })
  }, [])

  // Sync dari Tiptap ke Store saat content berubah
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const newBlocks = tiptapToBlocks(editor)
      setBlocks(newBlocks)
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, setBlocks, tiptapToBlocks])

  // Load content dari Store ke Tiptap saat pertama mount atau blocks berubah
  useEffect(() => {
    if (!editor) return
    if (!blocks || blocks.length === 0) return

    // Hanya update jika blocks berbeda signifikan
    const currentContent = editor.getJSON()
    const hasBlocks = currentContent.content && currentContent.content.length > 0

    if (!hasBlocks) {
      // Initial load dari store
      const html = blocksToHTML(blocks)
      editor.commands.setContent(html)
    }
  }, [editor, blocks])

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveArticle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, saveArticle])

  return {
    isDirty,
    save: saveArticle,
  }
}

/**
 * Helper: Extract text content dari Tiptap node
 */
function extractTextContent(node: any): string {
  if (!node.content) return ''
  
  return node.content
    .map((child: any) => {
      if (child.type === 'text') {
        let text = child.text || ''
        if (child.marks) {
          child.marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`
                break
              case 'italic':
                text = `<em>${text}</em>`
                break
              case 'underline':
                text = `<u>${text}</u>`
                break
              case 'link':
                text = `<a href="${mark.attrs?.href || '#'}">${text}</a>`
                break
            }
          })
        }
        return text
      }
      if (child.type === 'hardBreak') return '<br>'
      return ''
    })
    .join('')
}

/**
 * Convert Block[] ke HTML
 */
function blocksToHTML(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content || ''}</p>`
        case 'heading':
          return `<h${block.level}>${block.content || ''}</h${block.level}>`
        case 'quote':
          return `<blockquote><p>${block.content || ''}</p>${block.attribution ? `<cite>${block.attribution}</cite>` : ''}</blockquote>`
        case 'image':
          return `<img src="${block.url}" alt="${block.alt || ''}" />${block.caption ? `<p>${block.caption}</p>` : ''}`
        case 'list':
          const tag = block.ordered ? 'ol' : 'ul'
          const items = (block.items || []).map((item: string) => `<li>${item}</li>`).join('')
          return `<${tag}>${items}</${tag}>`
        default:
          return `<p>${(block as any).content || ''}</p>`
      }
    })
    .join('')
}

export default useTiptapSync
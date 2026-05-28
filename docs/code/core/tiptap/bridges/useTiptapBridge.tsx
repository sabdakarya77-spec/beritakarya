'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEditorStore } from '../../../../../store/editorStore'
import { sharedExtensions } from '../extensions/editorExtensions'
import type { EditorMode } from '../types'

/**
 * Configuration for useTiptapBridge hook
 */
export interface UseTiptapBridgeConfig {
  blockId: string
  initialContent?: string
  mode?: EditorMode
  placeholder?: string
  autofocus?: boolean
  onUpdate?: (content: string) => void
  onBlur?: (content: string) => void
}

/**
 * Hook that bridges Tiptap editor with the existing editor store
 * 
 * Note: sharedExtensions already includes Placeholder, Link, Underline, TextAlign
 * so we don't need to add them again to avoid duplicate extension errors.
 */
export function useTiptapBridge({
  blockId,
  initialContent = '',
  mode = 'gridblock',
  placeholder,
  autofocus = false,
  onUpdate,
  onBlur,
}: UseTiptapBridgeConfig): Editor | null {
  const { updateBlock } = useEditorStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const lastContentRef = useRef<string>(initialContent)
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Create Tiptap editor instance
   */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      ...sharedExtensions,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        'data-block-id': blockId,
        class: 'outline-none min-h-[1.75em]',
      },
    },
    autofocus: autofocus ? 'end' as const : false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      
      // Debounce updates to avoid excessive store updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        if (html !== lastContentRef.current) {
          lastContentRef.current = html
          updateBlock(blockId, { content: html })
          onUpdate?.(html)
        }
      }, 300)
    },
    onBlur: ({ editor: ed }) => {
      const html = ed.getHTML()
      
      // Flush any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      
      if (html !== lastContentRef.current) {
        lastContentRef.current = html
        updateBlock(blockId, { content: html })
      }
      
      onBlur?.(html)
    },
  })

  /**
   * Sync content when block content changes in store
   */
  useEffect(() => {
    if (editor && !isInitialized) {
      // Initialize editor with content from store
      const storeBlock = useEditorStore.getState().blocks.find(b => b.id === blockId)
      if (storeBlock && 'content' in storeBlock && storeBlock.content !== initialContent) {
        editor.commands.setContent(storeBlock.content as string)
        lastContentRef.current = storeBlock.content as string
      }
      setIsInitialized(true)
    }
  }, [editor, blockId, initialContent, isInitialized])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  return editor
}

/**
 * Component wrapper for Tiptap editor with store bridge
 */
export interface TiptapEditorComponentProps {
  blockId: string
  initialContent?: string
  mode?: EditorMode
  placeholder?: string
  className?: string
}

export function TiptapEditorComponent({
  blockId,
  initialContent = '',
  mode = 'gridblock',
  placeholder,
  className = '',
}: TiptapEditorComponentProps) {
  const editor = useTiptapBridge({
    blockId,
    initialContent,
    mode,
    placeholder,
  })

  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      className={className}
    />
  )
}
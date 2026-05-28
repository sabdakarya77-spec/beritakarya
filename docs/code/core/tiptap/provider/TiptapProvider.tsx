'use client'

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import type { EditorMode, TiptapContextValue } from '../types'

/**
 * Default context value
 */
const defaultContext: TiptapContextValue = {
  editor: null,
  mode: 'gridblock',
  isEditable: true,
  setEditable: () => {},
  updateContent: () => {},
  getContent: () => '',
}

/**
 * Tiptap Context
 */
const TiptapContext = createContext<TiptapContextValue>(defaultContext)

/**
 * TiptapProvider Props
 */
interface TiptapProviderProps {
  children: ReactNode
  editor?: Editor | null
  mode?: EditorMode
  initialEditable?: boolean
}

/**
 * Tiptap Provider Component
 * 
 * Provides Tiptap editor context to child components
 */
export function TiptapProvider({
  children,
  editor = null,
  mode = 'gridblock',
  initialEditable = true,
}: TiptapProviderProps) {
  const [isEditable, setIsEditable] = useState(initialEditable)
  const [contentCache] = useState<Map<string, string>>(new Map())

  /**
   * Set the editable state of the editor
   */
  const handleSetEditable = useCallback((editable: boolean) => {
    setIsEditable(editable)
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor])

  /**
   * Update content for a specific block
   */
  const handleUpdateContent = useCallback((blockId: string, content: string) => {
    contentCache.set(blockId, content)
  }, [contentCache])

  /**
   * Get content for a specific block or the entire editor
   */
  const handleGetContent = useCallback((blockId?: string): string => {
    if (blockId) {
      return contentCache.get(blockId) || ''
    }
    return editor?.getHTML() || ''
  }, [editor, contentCache])

  const value: TiptapContextValue = {
    editor,
    mode,
    isEditable,
    setEditable: handleSetEditable,
    updateContent: handleUpdateContent,
    getContent: handleGetContent,
  }

  return (
    <TiptapContext.Provider value={value}>
      {children}
    </TiptapContext.Provider>
  )
}

/**
 * Hook to access Tiptap context
 */
export function useTiptapContext(): TiptapContextValue {
  const context = useContext(TiptapContext)
  
  if (!context.editor) {
    console.warn('useTiptapContext: No editor found in context. Make sure TiptapProvider is mounted.')
  }
  
  return context
}

/**
 * Hook to access the Tiptap editor instance
 */
export function useTiptapEditor(): Editor | null {
  const { editor } = useTiptapContext()
  return editor
}

/**
 * Hook to check if editor is editable
 */
export function useIsEditable(): boolean {
  const { isEditable } = useTiptapContext()
  return isEditable
}

/**
 * Hook to control editor editability
 */
export function useSetEditable(): (editable: boolean) => void {
  const { setEditable } = useTiptapContext()
  return setEditable
}

/**
 * Export context for advanced usage
 */
export { TiptapContext }
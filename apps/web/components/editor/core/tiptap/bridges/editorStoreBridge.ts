'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import type { Block } from '@beritakarya/types'

/**
 * Configuration for editorStoreBridge hook
 */
export interface EditorStoreBridgeConfig {
  /**
   * Auto-sync enabled (default: true)
   */
  autoSync?: boolean
  
  /**
   * Debounce delay for sync updates (default: 300ms)
   */
  syncDelay?: number
  
  /**
   * Callback when a block is updated
   */
  onBlockUpdate?: (blockId: string, content: string) => void
  
  /**
   * Callback when all blocks are updated
   */
  onBlocksChange?: (blocks: Block[]) => void
}

/**
 * Hook that bridges Tiptap editor with the existing Zustand editor store
 * 
 * This provides a standardized interface for syncing editor content with the store.
 */
export function useEditorStoreBridge(config: EditorStoreBridgeConfig = {}) {
  const {
    autoSync = true,
    syncDelay = 300,
    onBlockUpdate,
    onBlocksChange,
  } = config

  const store = useEditorStore()
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingUpdatesRef = useRef<Map<string, string>>(new Map())

  /**
   * Update a specific block in the store
   */
  const updateBlock = useCallback((blockId: string, content: string) => {
    if (autoSync) {
      // Queue the update for debouncing
      pendingUpdatesRef.current.set(blockId, content)
      
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      
      // Set new timeout for batched update
      syncTimeoutRef.current = setTimeout(() => {
        const updates = pendingUpdatesRef.current
        updates.forEach((content, id) => {
          store.updateBlock(id, { content })
          onBlockUpdate?.(id, content)
        })
        updates.clear()
      }, syncDelay)
    }
  }, [autoSync, syncDelay, store, onBlockUpdate])

  /**
   * Get all blocks from store
   */
  const getBlocks = useCallback((): Block[] => {
    return store.blocks
  }, [store.blocks])

  /**
   * Get a specific block by ID
   */
  const getBlock = useCallback((blockId: string): Block | undefined => {
    return store.blocks.find(b => b.id === blockId)
  }, [store.blocks])

  /**
   * Get content of a specific block
   */
  const getBlockContent = useCallback((blockId: string): string => {
    const block = store.blocks.find(b => b.id === blockId)
    return (block as any)?.content || ''
  }, [store.blocks])

  /**
   * Add a new block after a specific block
   */
  const addBlock = useCallback((type: Block['type'], afterId?: string) => {
    store.addBlock(type, afterId)
  }, [store])

  /**
   * Remove a block by ID
   */
  const removeBlock = useCallback((blockId: string) => {
    store.removeBlock(blockId)
  }, [store])

  /**
   * Move a block up or down
   */
  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    store.moveBlock(blockId, direction)
  }, [store])

  /**
   * Reorder blocks by index
   */
  const reorderBlocks = useCallback((fromIdx: number, toIdx: number) => {
    store.reorderBlocks(fromIdx, toIdx)
  }, [store])

  /**
   * Split a block at a specific position
   */
  const splitBlock = useCallback((blockId: string, contentBefore: string, contentAfter: string) => {
    return store.splitBlock(blockId, contentBefore, contentAfter)
  }, [store])

  /**
   * Merge current block with previous block
   */
  const mergeWithPrevious = useCallback((blockId: string) => {
    return store.mergeWithPrevious(blockId)
  }, [store])

  /**
   * Get index of a block
   */
  const getBlockIndex = useCallback((blockId: string): number => {
    return store.getBlockIndex(blockId)
  }, [store])

  /**
   * Get adjacent block ID (above or below)
   */
  const getAdjacentBlockId = useCallback((blockId: string, direction: 'up' | 'down'): string | null => {
    return store.getAdjacentBlockId(blockId, direction)
  }, [store])

  /**
   * Force sync - flush any pending updates immediately
   */
  const forceSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    const updates = pendingUpdatesRef.current
    updates.forEach((content, id) => {
      store.updateBlock(id, { content })
      onBlockUpdate?.(id, content)
    })
    updates.clear()
    
    onBlocksChange?.(store.blocks)
  }, [store, onBlockUpdate, onBlocksChange])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      
      // Flush any remaining updates
      const updates = pendingUpdatesRef.current
      if (updates.size > 0) {
        updates.forEach((content, id) => {
          store.updateBlock(id, { content })
        })
      }
    }
  }, [store])

  return {
    // Store state
    blocks: store.blocks,
    activeBlockId: store.activeBlockId,
    editorMode: store.editorMode,
    isDirty: store.isDirty,
    saving: store.saving,
    
    // Block operations
    updateBlock,
    getBlock,
    getBlockContent,
    addBlock,
    removeBlock,
    moveBlock,
    reorderBlocks,
    
    // Navigation
    getBlockIndex,
    getAdjacentBlockId,
    splitBlock,
    mergeWithPrevious,
    
    // Utilities
    forceSync,
  }
}

/**
 * Selector hooks for specific store values
 */
export function useActiveBlockId() {
  return useEditorStore(state => state.activeBlockId)
}

export function useEditorMode() {
  return useEditorStore(state => state.editorMode)
}

export function useIsDirty() {
  return useEditorStore(state => state.isDirty)
}

export function useIsSaving() {
  return useEditorStore(state => state.saving)
}

export function useBlocks() {
  return useEditorStore(state => state.blocks)
}

export function useBlockById(blockId: string | null) {
  return useEditorStore(state => 
    blockId ? state.blocks.find(b => b.id === blockId) : undefined
  )
}
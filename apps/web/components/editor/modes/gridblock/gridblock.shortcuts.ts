import type { Block } from '@beritakarya/types'

export interface GridBlockShortcutContext {
  activeBlockId: string | null
  blocks: Block[]
}

export type GridBlockShortcutAction =
  | { type: 'MOVE_BLOCK_UP' }
  | { type: 'MOVE_BLOCK_DOWN' }
  | { type: 'REMOVE_BLOCK' }
  | { type: 'ADD_BLOCK_AFTER'; blockType: Block['type'] }
  | { type: 'UNDO' }
  | { type: 'NONE' }

/**
 * Handle keyboard shortcuts for GridBlock mode.
 *
 * Returns an action descriptor that the calling code can dispatch
 * via the editor store. This keeps shortcut logic separate from
 * store mutations.
 *
 * Supported shortcuts:
 * - Ctrl+Shift+ArrowUp   → move block up
 * - Ctrl+Shift+ArrowDown → move block down
 * - Ctrl+Shift+Backspace → remove block
 * - Ctrl+Shift+Enter     → add paragraph after active block
 * - Ctrl+Z               → undo
 */
export function handleGridBlockShortcut(
  event: KeyboardEvent,
  context: GridBlockShortcutContext
): GridBlockShortcutAction {
  const { activeBlockId, blocks } = context
  const mod = event.ctrlKey || event.metaKey

  // Ctrl+Shift+ArrowUp — Move block up
  if (mod && event.shiftKey && event.key === 'ArrowUp' && activeBlockId) {
    event.preventDefault()
    const idx = blocks.findIndex((b) => b.id === activeBlockId)
    if (idx > 0) return { type: 'MOVE_BLOCK_UP' }
  }

  // Ctrl+Shift+ArrowDown — Move block down
  if (mod && event.shiftKey && event.key === 'ArrowDown' && activeBlockId) {
    event.preventDefault()
    const idx = blocks.findIndex((b) => b.id === activeBlockId)
    if (idx >= 0 && idx < blocks.length - 1) return { type: 'MOVE_BLOCK_DOWN' }
  }

  // Ctrl+Shift+Backspace — Remove block
  if (mod && event.shiftKey && event.key === 'Backspace' && activeBlockId) {
    event.preventDefault()
    return { type: 'REMOVE_BLOCK' }
  }

  // Ctrl+Shift+Enter — Add paragraph after active block
  if (mod && event.shiftKey && event.key === 'Enter' && activeBlockId) {
    event.preventDefault()
    return { type: 'ADD_BLOCK_AFTER', blockType: 'paragraph' }
  }

  // Ctrl+Z — Undo
  if (mod && !event.shiftKey && event.key === 'z') {
    event.preventDefault()
    return { type: 'UNDO' }
  }

  return { type: 'NONE' }
}
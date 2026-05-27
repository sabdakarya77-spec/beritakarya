import type { Block } from '@beritakarya/types'
import type { EditorMode } from './editorMode'
import { supportsMode } from './blockGuards'

/**
 * Capability descriptor per editor mode.
 * Menjadi source of truth untuk decision UI shell & block behavior.
 *
 * Evaluasi per capability:
 *
 * - `supportsContinuousWriting`
 *   gridblock=false → block-based, setiap blok independen
 *   wordpress=true  → Classic/TinyMCE-style aliran teks kontinu
 *
 * - `supportsMixedMediaFlow`
 *   gridblock=true  → media (image/gallery/embed) bisa berada di antara blok teks dalam satu flow
 *   wordpress=false → media dipisah sebagai blok terpisah, tidak bercampur inline
 *
 * - `supportsDirectReorder`
 *   gridblock=true  → drag-and-drop langsung di canvas
 *   wordpress=false → reorder via move up/down buttons atau save & reload
 *
 * - `supportsSlashCommand`
 *   gridblock=true  → ketik "/" di blok teks memicu command palette
 *   wordpress=false → block inserter via "+" button atau toolbar
 */
export interface EditorModeCapabilities {
  mode: EditorMode
  /** true = aliran teks kontinu (seperti Classic Editor / TinyMCE) */
  supportsContinuousWriting: boolean
  /** true = blok media bisa diselipkan di antara teks dalam satu flow */
  supportsMixedMediaFlow: boolean
  /** true = drag-and-drop reorder langsung di canvas */
  supportsDirectReorder: boolean
  /** true = ketik "/" memicu command palette */
  supportsSlashCommand: boolean
}

export const EDITOR_MODE_CAPABILITIES: Record<EditorMode, EditorModeCapabilities> = {
  gridblock: {
    mode: 'gridblock',
    supportsContinuousWriting: false,
    supportsMixedMediaFlow: true,
    supportsDirectReorder: true,
    supportsSlashCommand: true,
  },
  wordpress: {
    mode: 'wordpress',
    supportsContinuousWriting: true,
    supportsMixedMediaFlow: false,
    supportsDirectReorder: false,
    supportsSlashCommand: false,
  },
}

export function canEditBlockInMode(type: Block['type'], mode: EditorMode): boolean {
  return supportsMode(type, mode)
}

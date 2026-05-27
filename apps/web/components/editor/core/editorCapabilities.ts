import type { Block } from '@beritakarya/types'
import type { EditorMode } from './editorMode'

export interface EditorModeCapabilities {
  mode: EditorMode
  supportsContinuousWriting: boolean
  supportsMixedMediaFlow: boolean
  supportsDirectReorder: boolean
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
  if (mode === 'gridblock') return true
  return ['paragraph', 'heading', 'quote', 'list'].includes(type)
}

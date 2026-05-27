export const EDITOR_MODES = ['gridblock', 'wordpress'] as const

export type EditorMode = (typeof EDITOR_MODES)[number]

export const DEFAULT_EDITOR_MODE: EditorMode = 'gridblock'

export const EDITOR_MODE_LABELS: Record<EditorMode, string> = {
  gridblock: 'GridBlock',
  wordpress: 'WordPress',
}

export function isEditorMode(value: string): value is EditorMode {
  return (EDITOR_MODES as readonly string[]).includes(value)
}

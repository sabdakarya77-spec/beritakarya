import type { Editor } from '@tiptap/react'

/**
 * Editor modes available in the editor system
 */
export type EditorMode = 'gridblock' | 'classic'

/**
 * Tiptap editor instance type
 */
export type TiptapEditor = Editor

/**
 * Configuration for creating a new editor instance
 */
export interface EditorConfig {
  mode: EditorMode
  initialContent?: string
  placeholder?: string
  editable?: boolean
  autofocus?: boolean
  onUpdate?: (content: string) => void
  onBlur?: (content: string) => void
  onFocus?: () => void
  onSelectionUpdate?: (selection: SelectionState) => void
}

/**
 * Selection state for tracking cursor position and selection
 */
export interface SelectionState {
  from: number
  to: number
  empty: boolean
  collapsed: boolean
}

/**
 * Block content types
 */
export type BlockContentType = 'html' | 'json' | 'text'

/**
 * Editor context value provided by TiptapProvider
 */
export interface TiptapContextValue {
  editor: TiptapEditor | null
  mode: EditorMode
  isEditable: boolean
  setEditable: (editable: boolean) => void
  updateContent: (blockId: string, content: string) => void
  getContent: (blockId?: string) => string
}

/**
 * Autosave configuration
 */
export interface AutosaveConfig {
  enabled: boolean
  debounceMs: number
  onSave: (content: string) => void | Promise<void>
}

/**
 * Editor capabilities based on mode
 */
export interface EditorCapabilities {
  supportsSlashCommand: boolean
  supportsDragAndDrop: boolean
  supportsBubbleMenu: boolean
  supportsInlineToolbar: boolean
  supportsBlockTypes: BlockType[]
}

/**
 * Available block types in the editor
 */
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'image-grid'
  | 'quote'
  | 'list'
  | 'bullet-list'
  | 'ordered-list'
  | 'code-block'
  | 'embed'
  | 'callout'
  | 'media-text'
  | 'divider'

/**
 * Heading levels
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right' | 'justify'

/**
 * Link attributes
 */
export interface LinkAttributes {
  href: string
  target?: string
  rel?: string
  class?: string
}

/**
 * Image attributes
 */
export interface ImageAttributes {
  src: string
  alt?: string
  title?: string
  width?: number | string
  height?: number | string
  class?: string
}
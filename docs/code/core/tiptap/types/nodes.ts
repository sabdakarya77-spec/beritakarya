import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

/**
 * Custom node view component props
 */
export interface NodeViewProps {
  node: ProseMirrorNode
  updateAttributes: (attrs: Record<string, unknown>) => void
  deleteNode: () => void
  selectNode: () => void
  editor: import('@tiptap/react').Editor
  extension: import('@tiptap/pm/state').PluginKey | undefined
  getPos: (() => number | undefined) | boolean
  view: EditorView
}

/**
 * Base block node attributes
 */
export interface BaseBlockAttrs {
  id?: string
  class?: string
  dataBlockId?: string
}

/**
 * Paragraph node attributes
 */
export interface ParagraphAttrs extends BaseBlockAttrs {
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

/**
 * Heading node attributes
 */
export interface HeadingAttrs extends BaseBlockAttrs {
  level: 1 | 2 | 3 | 4 | 5 | 6
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

/**
 * Quote node attributes
 */
export interface QuoteAttrs extends BaseBlockAttrs {
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  citeAlign?: 'left' | 'center' | 'right'
}

/**
 * Image node attributes
 */
export interface ImageAttrs extends BaseBlockAttrs {
  src: string
  alt?: string
  title?: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
}

/**
 * Image Grid node attributes
 */
export interface ImageGridAttrs extends BaseBlockAttrs {
  layout: 'grid' | 'masonry' | 'carousel'
  columns: number
  gap: number
}

/**
 * Media Text node attributes
 */
export interface MediaTextAttrs extends BaseBlockAttrs {
  mediaPosition: 'left' | 'right'
  mediaWidth: number
}

/**
 * Callout node attributes
 */
export interface CalloutAttrs extends BaseBlockAttrs {
  type: 'info' | 'warning' | 'success' | 'error' | 'tip'
  icon?: string
  dismissible: boolean
}

/**
 * Code block node attributes
 */
export interface CodeBlockAttrs extends BaseBlockAttrs {
  language?: string
  codeBlock: boolean
}

/**
 * List node attributes
 */
export interface ListAttrs extends BaseBlockAttrs {
  ordered: boolean
  start?: number
  tight?: boolean
}

/**
 * Node definition configuration
 */
export interface NodeDefinition {
  name: string
  displayName: string
  group: string
  icon?: string
  shortcut?: string
  attributes?: Record<string, unknown>
  parseHTML?: () => { tag: string }[]
  renderHTML?: (attrs: Record<string, unknown>) => Record<string, string>
}

/**
 * Slash command item for quick block insertion
 */
export interface SlashCommandItem {
  title: string
  description: string
  icon: string | React.ReactNode
  command: (editor: import('@tiptap/react').Editor, range: { from: number; to: number }) => void
  filterString?: string
}

/**
 * Block wrapper component props
 */
export interface BlockWrapperProps {
  blockId: string
  blockType: string
  children: React.ReactNode
  selected?: boolean
  draggable?: boolean
  onDelete?: () => void
  onDuplicate?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}
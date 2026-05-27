import type { BlockType, HeadingLevel, TextAlignment } from '../types'

/**
 * Block type identifiers
 */
export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph' as BlockType,
  HEADING: 'heading' as BlockType,
  IMAGE: 'image' as BlockType,
  IMAGE_GRID: 'image-grid' as BlockType,
  QUOTE: 'quote' as BlockType,
  LIST: 'list' as BlockType,
  BULLET_LIST: 'bullet-list' as BlockType,
  ORDERED_LIST: 'ordered-list' as BlockType,
  CODE_BLOCK: 'code-block' as BlockType,
  EMBED: 'embed' as BlockType,
  CALLOUT: 'callout' as BlockType,
  MEDIA_TEXT: 'media-text' as BlockType,
  DIVIDER: 'divider' as BlockType,
}

/**
 * Heading level options
 */
export const HEADING_LEVELS: { level: HeadingLevel; label: string; shortcut: string }[] = [
  { level: 1, label: 'Heading 1', shortcut: '#' },
  { level: 2, label: 'Heading 2', shortcut: '##' },
  { level: 3, label: 'Heading 3', shortcut: '###' },
  { level: 4, label: 'Heading 4', shortcut: '####' },
  { level: 5, label: 'Heading 5', shortcut: '#####' },
  { level: 6, label: 'Heading 6', shortcut: '######' },
]

/**
 * Text alignment options
 */
export const TEXT_ALIGNMENTS: { value: TextAlignment; label: string; icon: string }[] = [
  { value: 'left', label: 'Align Left', icon: 'align-left' },
  { value: 'center', label: 'Align Center', icon: 'align-center' },
  { value: 'right', label: 'Align Right', icon: 'align-right' },
  { value: 'justify', label: 'Justify', icon: 'align-justify' },
]

/**
 * Callout types
 */
export const CALLOUT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
  TIP: 'tip',
} as const

/**
 * Block type display names
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  image: 'Image',
  'image-grid': 'Image Grid',
  quote: 'Quote',
  list: 'List',
  'bullet-list': 'Bullet List',
  'ordered-list': 'Numbered List',
  'code-block': 'Code Block',
  embed: 'Embed',
  callout: 'Callout',
  'media-text': 'Media & Text',
  divider: 'Divider',
}

/**
 * Default placeholder texts
 */
export const PLACEHOLDERS = {
  paragraph: 'Tulis paragraf...',
  heading: 'Ketik judul...',
  quote: 'Ketik kutipan...',
  codeBlock: 'Tambahkan kode...',
  callout: 'Tambahkan catatan...',
}

/**
 * Slash command prefixes
 */
export const SLASH_COMMAND_PREFIX = '/'

/**
 * Image grid layout options
 */
export const IMAGE_GRID_LAYOUTS = {
  GRID: 'grid',
  MASONRY: 'masonry',
  CAROUSEL: 'carousel',
} as const

/**
 * Media text position options
 */
export const MEDIA_TEXT_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
} as const
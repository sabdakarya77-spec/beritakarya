/**
 * Schema v1 - Initial schema definitions
 * 
 * This file contains type definitions and constants
 * for the editor schema.
 */

/**
 * Block types in the editor
 */
export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  BLOCKQUOTE: 'blockquote',
  CODE_BLOCK: 'codeBlock',
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  LIST_ITEM: 'listItem',
  HORIZONTAL_RULE: 'horizontalRule',
  IMAGE: 'image',
  IMAGE_GRID: 'imageGrid',
  GALLERY: 'gallery',
  EMBED: 'embed',
  MEDIA_TEXT: 'mediaText',
  CALLOUT: 'callout',
} as const

/**
 * Text alignment options
 */
export const TEXT_ALIGNS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  JUSTIFY: 'justify',
} as const

/**
 * Callout variant options
 */
export type CalloutVariant = 'info' | 'warning' | 'error' | 'success' | 'editorial'
export const CALLOUT_VARIANTS: CalloutVariant[] = ['info', 'warning', 'error', 'success', 'editorial']

/**
 * Embed types
 */
export const EMBED_TYPES = {
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  OTHER: 'other',
} as const

/**
 * Image grid column options
 */
export const IMAGE_GRID_COLUMNS = {
  TWO: 2 as const,
  THREE: 3 as const,
}

/**
 * Schema version identifier
 */
export const SCHEMA_VERSION = 'v1' as const

export default {
  BLOCK_TYPES,
  TEXT_ALIGNS,
  CALLOUT_VARIANTS,
  EMBED_TYPES,
  IMAGE_GRID_COLUMNS,
  SCHEMA_VERSION,
}
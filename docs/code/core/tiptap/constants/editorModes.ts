import type { EditorMode, EditorCapabilities, BlockType } from '../types'

/**
 * Editor mode identifiers
 */
export const EDITOR_MODES = {
  GRIDBLOCK: 'gridblock' as EditorMode,
  CLASSIC: 'classic' as EditorMode,
}

/**
 * GridBlock mode capabilities - Full featured block editor
 */
export const GRIDBLOCK_CAPABILITIES: EditorCapabilities = {
  supportsSlashCommand: true,
  supportsDragAndDrop: true,
  supportsBubbleMenu: true,
  supportsInlineToolbar: true,
  supportsBlockTypes: [
    'paragraph',
    'heading',
    'image',
    'image-grid',
    'quote',
    'bullet-list',
    'ordered-list',
    'code-block',
    'embed',
    'callout',
    'media-text',
    'divider',
  ],
}

/**
 * Classic mode capabilities - WordPress-style continuous writing
 */
export const CLASSIC_CAPABILITIES: EditorCapabilities = {
  supportsSlashCommand: false,
  supportsDragAndDrop: false,
  supportsBubbleMenu: true,
  supportsInlineToolbar: true,
  supportsBlockTypes: [
    'paragraph',
    'heading',
    'quote',
    'bullet-list',
    'ordered-list',
  ],
}

/**
 * Get capabilities for a specific editor mode
 */
export function getCapabilitiesForMode(mode: EditorMode): EditorCapabilities {
  return mode === EDITOR_MODES.GRIDBLOCK
    ? GRIDBLOCK_CAPABILITIES
    : CLASSIC_CAPABILITIES
}

/**
 * Check if a block type is supported in a given mode
 */
export function isBlockTypeSupported(mode: EditorMode, blockType: BlockType): boolean {
  const capabilities = getCapabilitiesForMode(mode)
  return capabilities.supportsBlockTypes.includes(blockType)
}
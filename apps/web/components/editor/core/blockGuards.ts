import type { Block } from '@beritakarya/types'
import type { EditorMode } from './editorMode'
import { getBlockCatalogItem } from './blockCatalog'

const TEXT_BLOCKS: Block['type'][] = ['paragraph', 'heading', 'quote', 'list']
const MEDIA_BLOCKS: Block['type'][] = ['image', 'imageGrid', 'gallery', 'embed', 'mediaText']

export function isTextBlock(type: Block['type']): boolean {
  return TEXT_BLOCKS.includes(type)
}

export function isMediaBlock(type: Block['type']): boolean {
  return MEDIA_BLOCKS.includes(type)
}

export function supportsMode(type: Block['type'], mode: EditorMode): boolean {
  return getBlockCatalogItem(type)?.supportedModes.includes(mode) ?? false
}

export function supportsWordPressMode(type: Block['type']): boolean {
  return supportsMode(type, 'wordpress')
}

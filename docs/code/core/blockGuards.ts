import type { Block } from '@beritakarya/types'
import type { EditorMode } from './editorMode'
import { getBlockCatalogItem, getSupportedModesForBlock } from './blockCatalog'

export function isTextBlock(type: Block['type']): boolean {
  return getBlockCatalogItem(type)?.isText ?? false
}

export function isMediaBlock(type: Block['type']): boolean {
  return getBlockCatalogItem(type)?.isMedia ?? false
}

export function supportsMode(type: Block['type'], mode: EditorMode): boolean {
  return getSupportedModesForBlock(type).includes(mode)
}

export function supportsWordPressMode(type: Block['type']): boolean {
  return supportsMode(type, 'wordpress')
}

import type { Block } from '@beritakarya/types'
import { isTextBlock } from './blockGuards'

export function getActiveBlock(blocks: Block[], activeBlockId: string | null) {
  return blocks.find((block) => block.id === activeBlockId) ?? null
}

export function getTextBlocks(blocks: Block[]) {
  return blocks.filter((block) => isTextBlock(block.type))
}

export function getNonTextBlocks(blocks: Block[]) {
  return blocks.filter((block) => !isTextBlock(block.type))
}

export function isDocumentEmpty(blocks: Block[]) {
  return blocks.every((block) => {
    if ('content' in block && typeof block.content === 'string') {
      return !block.content.trim()
    }
    if ('items' in block && Array.isArray(block.items)) {
      return !block.items.some((item) => item.trim())
    }
    if ('images' in block && Array.isArray(block.images)) {
      return block.images.length === 0
    }
    if ('url' in block && typeof block.url === 'string') {
      return !block.url.trim()
    }
    return false
  })
}

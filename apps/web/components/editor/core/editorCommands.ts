import { createDefaultBlock } from '../../../store/editorStore'
import type { Block } from '@beritakarya/types'

export interface EditorDocumentSnapshot {
  title: string
  excerpt: string
  blocks: Block[]
}

export function insertBlock(blocks: Block[], type: Block['type'], afterId?: string): Block[] {
  const newBlock = createDefaultBlock(type)
  if (!blocks.length) return [newBlock]

  if (!afterId) {
    return [...blocks, newBlock]
  }

  const idx = blocks.findIndex((block) => block.id === afterId)
  if (idx === -1) return [...blocks, newBlock]

  const next = [...blocks]
  next.splice(idx + 1, 0, newBlock)
  return next
}

export function replaceBlock(blocks: Block[], id: string, type: Block['type']): Block[] {
  return blocks.map((block) => (block.id === id ? createDefaultBlock(type, id) : block))
}

export function updateBlockData(blocks: Block[], id: string, data: Partial<Block>): Block[] {
  return blocks.map((block) => (block.id === id ? ({ ...block, ...data } as Block) : block))
}

export function splitTextBlock(blocks: Block[], id: string, before: string, after: string): Block[] {
  const idx = blocks.findIndex((block) => block.id === id)
  if (idx === -1) return blocks

  const current = blocks[idx]
  const nextBlock = createDefaultBlock('paragraph') as Extract<Block, { type: 'paragraph' }>
  nextBlock.content = after

  const updatedCurrent = { ...current, content: before } as Block
  const next = [...blocks]
  next[idx] = updatedCurrent
  next.splice(idx + 1, 0, nextBlock)
  return next
}

export function mergeTextBlockWithPrevious(blocks: Block[], id: string): Block[] {
  const idx = blocks.findIndex((block) => block.id === id)
  if (idx <= 0) return blocks

  const previous = blocks[idx - 1] as Block & { content?: string }
  const current = blocks[idx] as Block & { content?: string }
  if (typeof previous.content !== 'string' || typeof current.content !== 'string') {
    return blocks
  }

  const merged = { ...previous, content: `${previous.content}${current.content}` } as Block
  const next = [...blocks]
  next[idx - 1] = merged
  next.splice(idx, 1)
  return next
}

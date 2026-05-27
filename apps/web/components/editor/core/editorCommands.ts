import { v4 as uuidv4 } from 'uuid'
import type { Block } from '@beritakarya/types'

export interface EditorDocumentSnapshot {
  title: string
  excerpt: string
  blocks: Block[]
}

/**
 * Buat default block object berdasarkan type.
 * Fungsi ini adalah satu-satunya factory block — semua entry point harus lewat sini.
 * Tidak berisi parser / DOM logic, murni factory.
 */
export function createDefaultBlock(type: Block['type'], existingId?: string): Block {
  const block = defaultBlock(type)
  if (existingId) block.id = existingId
  return block
}

function defaultBlock(type: Block['type']): Block {
  const id = uuidv4()
  switch (type) {
    case 'paragraph': return { id, type, content: '' }
    case 'heading': return { id, type, level: 2, content: '' }
    case 'quote': return { id, type, content: '', attribution: '' }
    case 'image': return { id, type, url: '', alt: '', caption: '', credit: '' } as any
    case 'imageGrid': return { id, type, columns: 2, images: [] }
    case 'gallery': return { id, type, images: [] }
    case 'list': return { id, type, items: [''], ordered: false }
    case 'callout': return { id, type, content: '', variant: 'editorial', icon: 'zap' }
    case 'embed': return { id, type, url: '', embedType: 'youtube' }
    case 'mediaText': return { id, type, url: '', alt: '', caption: '', content: '', align: 'left' }
    default: return { id, type: 'paragraph', content: '' }
  }
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

import { describe, it, expect } from 'vitest'
import { isStructureSafe } from '../adapter/WordPressSync'
import type { Block } from '@beritakarya/types'

function makeBlock(overrides: Partial<Block> & { type: Block['type'] }): Block {
  return { id: 'test-id', ...overrides } as Block
}

describe('isStructureSafe', () => {
  it('returns true for all-text blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'p1' }),
      makeBlock({ type: 'heading', level: 2, content: 'h2' }),
    ]
    expect(isStructureSafe(blocks)).toBe(true)
  })

  it('returns true for ≤3 non-text blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'p1' }),
      makeBlock({ type: 'image', url: '1.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '2.jpg', alt: '', caption: '', credit: '' }),
    ]
    expect(isStructureSafe(blocks)).toBe(true)
  })

  it('returns false for >3 non-text blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'p1' }),
      makeBlock({ type: 'image', url: '1.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '2.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '3.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '4.jpg', alt: '', caption: '', credit: '' }),
    ]
    expect(isStructureSafe(blocks)).toBe(false)
  })
})
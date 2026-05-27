import { describe, it, expect } from 'vitest'
import { projectBlocksToWordPressFlow, projectParsedToBlocks } from '../adapter/WordPressProjection'
import type { Block } from '@beritakarya/types'

function makeBlock(overrides: Partial<Block> & { type: Block['type'] }): Block {
  return { id: 'test-id', ...overrides } as Block
}

describe('projectBlocksToWordPressFlow', () => {
  it('returns continuous HTML for text blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'Hello' }),
      makeBlock({ type: 'heading', level: 2, content: 'Title' }),
    ]
    const flow = projectBlocksToWordPressFlow(blocks)
    expect(flow.continuousHtml).toContain('<p')
    expect(flow.continuousHtml).toContain('<h2')
    expect(flow.continuousHtml).toContain('Hello')
    expect(flow.continuousHtml).toContain('Title')
  })

  it('separates non-text blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'Text' }),
      makeBlock({ type: 'image', url: 'photo.jpg', alt: '', caption: '', credit: '' }),
    ]
    const flow = projectBlocksToWordPressFlow(blocks)
    expect(flow.textBlocks).toHaveLength(1)
    expect(flow.nonTextBlocks).toHaveLength(1)
  })

  it('flags interleaving media blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'image', url: 'a.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: 'b.jpg', alt: '', caption: '', credit: '' }),
    ]
    const flow = projectBlocksToWordPressFlow(blocks)
    expect(flow.warnings.length).toBeGreaterThan(0)
  })

  it('marks >3 non-text blocks as unsafe', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'p1' }),
      makeBlock({ type: 'image', url: '1.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '2.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '3.jpg', alt: '', caption: '', credit: '' }),
      makeBlock({ type: 'image', url: '4.jpg', alt: '', caption: '', credit: '' }),
    ]
    const flow = projectBlocksToWordPressFlow(blocks)
    expect(flow.isSafe).toBe(false)
  })
})

describe('projectParsedToBlocks', () => {
  it('updates paragraph content', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'old', id: 'b1' }),
    ]
    const result = projectParsedToBlocks(blocks, [
      { tag: 'p', html: 'new content', blockId: 'b1' },
    ])
    expect((result[0] as any).content).toBe('new content')
  })

  it('updates heading level', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'heading', content: 'old', level: 2, id: 'b1' }),
    ]
    const result = projectParsedToBlocks(blocks, [
      { tag: 'h3', html: 'new heading', blockId: 'b1' },
    ])
    expect((result[0] as any).content).toBe('new heading')
    expect((result[0] as any).level).toBe(3)
  })
})
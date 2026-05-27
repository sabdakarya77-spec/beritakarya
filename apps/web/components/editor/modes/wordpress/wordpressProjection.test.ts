import { describe, it, expect } from 'vitest'
import { projectBlocksToWordPressFlow, projectParsedToBlocks } from './WordPressProjection'
import type { Block } from '@beritakarya/types'

const makeBlock = (overrides: Partial<Block> & { type: Block['type'] }): Block => ({
  id: `id-${Math.random().toString(36).slice(2, 8)}`,
  ...overrides,
} as Block)

describe('WordPressProjection', () => {
  describe('projectBlocksToWordPressFlow', () => {
    it('memisahkan text blocks dan non-text blocks', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'paragraph', content: 'Teks' }),
        makeBlock({ type: 'image', url: 'img.jpg', alt: '' }),
        makeBlock({ type: 'heading', content: 'Judul' }),
      ]
      const flow = projectBlocksToWordPressFlow(blocks)
      expect(flow.textBlocks).toHaveLength(2)
      expect(flow.nonTextBlocks).toHaveLength(1)
      expect(flow.nonTextBlocks[0].type).toBe('image')
    })

    it('menghasilkan continuousHtml dari text blocks', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'paragraph', content: 'Paragraf pertama', id: 'b1' }),
        makeBlock({ type: 'heading', content: 'Judul seksi', level: 2, id: 'b2' } as any),
      ]
      const flow = projectBlocksToWordPressFlow(blocks)
      expect(flow.continuousHtml).toContain('data-block-id="b1"')
      expect(flow.continuousHtml).toContain('Paragraf pertama')
      expect(flow.continuousHtml).toContain('h2')
      expect(flow.continuousHtml).toContain('Judul seksi')
    })

    it('menambahkan warning untuk non-text blocks', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'paragraph', content: 'Teks' }),
        makeBlock({ type: 'image', url: 'img.jpg', alt: '' }),
      ]
      const flow = projectBlocksToWordPressFlow(blocks)
      expect(flow.warnings.length).toBeGreaterThan(0)
      expect(flow.isSafe).toBe(true) // ≤ 3 non-text blocks
    })

    it('menandai isSafe=false jika ada banyak non-text blocks', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'paragraph', content: 'Teks' }),
        makeBlock({ type: 'image', url: '1.jpg', alt: '' }),
        makeBlock({ type: 'image', url: '2.jpg', alt: '' }),
        makeBlock({ type: 'image', url: '3.jpg', alt: '' }),
        makeBlock({ type: 'image', url: '4.jpg', alt: '' }),
      ]
      const flow = projectBlocksToWordPressFlow(blocks)
      expect(flow.isSafe).toBe(false)
    })
  })

  describe('projectParsedToBlocks', () => {
    it('meng-update content untuk paragraph node', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'paragraph', content: 'lama', id: 'b1' }),
      ]
      const result = projectParsedToBlocks(blocks, [
        { tag: 'p', html: 'baru', blockId: 'b1' },
      ])
      expect((result[0] as any).content).toBe('baru')
    })

    it('meng-update level untuk heading node', () => {
      const blocks: Block[] = [
        makeBlock({ type: 'heading', content: 'lama', level: 3, id: 'b1' } as any),
      ]
      const result = projectParsedToBlocks(blocks, [
        { tag: 'h2', html: 'baru', blockId: 'b1' },
      ])
      expect((result[0] as any).content).toBe('baru')
      expect((result[0] as any).level).toBe(2)
    })

    it('mengembalikan array asli untuk parsedNodes kosong', () => {
      const blocks: Block[] = [makeBlock({ type: 'paragraph', content: 'test', id: 'b1' })]
      const result = projectParsedToBlocks(blocks, [])
      expect(result).toEqual(blocks)
    })
  })
})
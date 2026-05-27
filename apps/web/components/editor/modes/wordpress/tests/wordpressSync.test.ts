import { describe, it, expect } from 'vitest'
import { syncWordPressEditor, buildEditorHtml } from '../adapter/WordPressSync'
import type { Block } from '@beritakarya/types'

function makeBlock(overrides: Partial<Block> & { type: Block['type'] }): Block {
  return { id: overrides.id || 'test-id', ...overrides } as Block
}

describe('buildEditorHtml', () => {
  it('returns empty string for no blocks', () => {
    expect(buildEditorHtml([])).toBe('')
  })

  it('builds HTML from paragraph blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: 'Hello', id: 'b1' }),
    ]
    const html = buildEditorHtml(blocks)
    expect(html).toContain('Hello')
    expect(html).toContain('data-block-id="b1"')
  })
})

describe('syncWordPressEditor', () => {
  it('parses simple paragraph HTML', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: '', id: 'b1' }),
    ]
    const result = syncWordPressEditor({
      editorHtml: '<p data-block-id="b1">Hello world</p>',
      currentBlocks: blocks,
      allowBlockCreation: false,
    })
    expect(result.blocks[0]).toBeDefined()
    expect((result.blocks[0] as any).content).toBe('Hello world')
  })

  it('returns warnings when parsed nodes exceed blocks', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: '', id: 'b1' }),
    ]
    const result = syncWordPressEditor({
      editorHtml: '<p data-block-id="b1">First</p><p>Second</p><p>Third</p>',
      currentBlocks: blocks,
      allowBlockCreation: false,
    })
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('creates blocks when allowBlockCreation is true', () => {
    const blocks: Block[] = [
      makeBlock({ type: 'paragraph', content: '', id: 'b1' }),
    ]
    const result = syncWordPressEditor({
      editorHtml: '<p data-block-id="b1">First</p><p>Second</p><p>Third</p>',
      currentBlocks: blocks,
      allowBlockCreation: true,
    })
    expect(result.blocks.length).toBeGreaterThan(1)
  })
})
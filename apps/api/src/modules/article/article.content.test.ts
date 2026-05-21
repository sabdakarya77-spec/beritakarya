import { describe, it, expect } from 'vitest'
import {
  extractTextFromBlocks,
  buildMetaDescriptionExcerpt,
  validateArticleContentLimits,
  applySeoDefaults
} from './article.content'

describe('article.content', () => {
  it('extractTextFromBlocks joins paragraph and heading', () => {
    const text = extractTextFromBlocks([
      { type: 'paragraph', content: 'Paragraf satu.' },
      { type: 'heading', content: 'Judul Bagian' }
    ])
    expect(text).toContain('Paragraf satu.')
    expect(text).toContain('Judul Bagian')
  })

  it('buildMetaDescriptionExcerpt truncates long text', () => {
    const long = 'a'.repeat(200)
    const excerpt = buildMetaDescriptionExcerpt([
      { type: 'paragraph', content: long }
    ])
    expect(excerpt.length).toBeLessThanOrEqual(160)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('applySeoDefaults fills empty metaDescription', () => {
    const result = applySeoDefaults({
      title: 'Judul',
      blocks: [{ type: 'paragraph', content: 'Isi artikel untuk SEO.' }]
    })
    expect(result.metaDescription).toBe('Isi artikel untuk SEO.')
  })

  it('validateArticleContentLimits rejects too many blocks', () => {
    const blocks = Array.from({ length: 201 }, (_, i) => ({
      type: 'paragraph' as const,
      content: `block ${i}`
    }))
    expect(() => validateArticleContentLimits(blocks)).toThrow(/200 blok/)
  })
})

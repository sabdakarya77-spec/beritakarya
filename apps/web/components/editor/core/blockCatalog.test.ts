import { describe, it, expect } from 'vitest'
import { BLOCK_CATALOG, getBlockCatalogItem } from './blockCatalog'

describe('blockCatalog', () => {
  it('memiliki semua tipe block yang didukung', () => {
    const types = BLOCK_CATALOG.map((item) => item.type)
    expect(types).toContain('paragraph')
    expect(types).toContain('heading')
    expect(types).toContain('quote')
    expect(types).toContain('list')
    expect(types).toContain('image')
    expect(types).toContain('embed')
    expect(types).toContain('gallery')
    expect(types).toContain('imageGrid')
    expect(types).toContain('mediaText')
    expect(types).toContain('callout')
  })

  it('setiap item memiliki icon', () => {
    BLOCK_CATALOG.forEach((item) => {
      expect(item.icon).toBeDefined()
    })
  })

  it('setiap item memiliki setidaknya satu alias', () => {
    BLOCK_CATALOG.forEach((item) => {
      expect(item.aliases.length).toBeGreaterThan(0)
    })
  })

  it('setiap item memiliki supportedModes yang valid', () => {
    BLOCK_CATALOG.forEach((item) => {
      expect(item.supportedModes.length).toBeGreaterThan(0)
      item.supportedModes.forEach((mode) => {
        expect(['gridblock', 'wordpress']).toContain(mode)
      })
    })
  })

  it('block teks mendukung wordpress mode', () => {
    const textTypes = ['paragraph', 'heading', 'quote', 'list']
    textTypes.forEach((type) => {
      const item = getBlockCatalogItem(type as any)
      expect(item?.supportedModes).toContain('wordpress')
      expect(item?.supportedModes).toContain('gridblock')
    })
  })

  it('block media hanya mendukung gridblock', () => {
    const mediaTypes = ['image', 'imageGrid', 'gallery', 'embed', 'mediaText', 'callout']
    mediaTypes.forEach((type) => {
      const item = getBlockCatalogItem(type as any)
      expect(item?.supportedModes).not.toContain('wordpress')
      expect(item?.supportedModes).toContain('gridblock')
    })
  })

  it('getBlockCatalogItem mengembalikan item yang benar', () => {
    const paragraph = getBlockCatalogItem('paragraph')
    expect(paragraph?.label).toBe('Paragraf')
    expect(paragraph?.family).toBe('text')
  })

  it('getBlockCatalogItem mengembalikan undefined untuk type tidak dikenal', () => {
    const result = getBlockCatalogItem('unknown' as any)
    expect(result).toBeUndefined()
  })
})
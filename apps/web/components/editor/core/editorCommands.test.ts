import { describe, it, expect } from 'vitest'
import { insertBlock, replaceBlock, updateBlockData, splitTextBlock, mergeTextBlockWithPrevious } from './editorCommands'
import type { Block } from '@beritakarya/types'
import { v4 as uuidv4 } from 'uuid'

const makeBlock = (type: Block['type'], overrides: Partial<Block> = {}): Block => ({
  id: uuidv4(),
  type,
  ...overrides,
} as Block)

describe('editorCommands', () => {
  describe('insertBlock', () => {
    it('menambah block ke array kosong', () => {
      const result = insertBlock([], 'paragraph')
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('paragraph')
    })

    it('menambah block di akhir jika tanpa afterId', () => {
      const blocks = [makeBlock('paragraph'), makeBlock('heading')]
      const result = insertBlock(blocks, 'quote')
      expect(result).toHaveLength(3)
      expect(result[2].type).toBe('quote')
    })

    it('menambah block setelah block tertentu', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' }), makeBlock('heading', { id: 'b' })]
      const result = insertBlock(blocks, 'quote', 'a')
      expect(result).toHaveLength(3)
      expect(result[1].type).toBe('quote')
      expect(result[1].id).not.toBe('')
    })

    it('fallback ke akhir jika afterId tidak ditemukan', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' })]
      const result = insertBlock(blocks, 'quote', 'nonexistent')
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('quote')
    })
  })

  describe('replaceBlock', () => {
    it('mengganti type block dengan id yang sesuai', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' }), makeBlock('heading', { id: 'b' })]
      const result = replaceBlock(blocks, 'a', 'quote')
      expect(result[0].type).toBe('quote')
      expect(result[0].id).toBe('a')
      expect(result[1].type).toBe('heading')
    })

    it('tidak mengubah apapun jika id tidak ditemukan', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' })]
      const result = replaceBlock(blocks, 'x', 'quote')
      expect(result).toEqual(blocks)
    })
  })

  describe('updateBlockData', () => {
    it('memperbarui data block tertentu', () => {
      const blocks = [makeBlock('paragraph', { id: 'a', content: 'lama' })]
      const result = updateBlockData(blocks, 'a', { content: 'baru' })
      expect((result[0] as any).content).toBe('baru')
    })

    it('tidak mengubah block lain', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' }), makeBlock('heading', { id: 'b', content: 'judul' })]
      const result = updateBlockData(blocks, 'a', { content: 'baru' })
      expect((result[1] as any).content).toBe('judul')
    })
  })

  describe('splitTextBlock', () => {
    it('membagi block menjadi dua', () => {
      const blocks = [makeBlock('paragraph', { id: 'a', content: 'beforeafter' })]
      const result = splitTextBlock(blocks, 'a', 'before', 'after')
      expect(result).toHaveLength(2)
      expect((result[0] as any).content).toBe('before')
      expect((result[1] as any).content).toBe('after')
      expect(result[1].type).toBe('paragraph')
    })

    it('mengembalikan array asli jika id tidak ditemukan', () => {
      const blocks = [makeBlock('paragraph', { id: 'a' })]
      const result = splitTextBlock(blocks, 'x', 'a', 'b')
      expect(result).toEqual(blocks)
    })
  })

  describe('mergeTextBlockWithPrevious', () => {
    it('menggabungkan block dengan block sebelumnya', () => {
      const blocks = [
        makeBlock('paragraph', { id: 'a', content: 'hello ' }),
        makeBlock('paragraph', { id: 'b', content: 'world' }),
      ]
      const result = mergeTextBlockWithPrevious(blocks, 'b')
      expect(result).toHaveLength(1)
      expect((result[0] as any).content).toBe('hello world')
      expect(result[0].id).toBe('a')
    })

    it('mengembalikan array asli jika block adalah yang pertama', () => {
      const blocks = [makeBlock('paragraph', { id: 'a', content: 'first' })]
      const result = mergeTextBlockWithPrevious(blocks, 'a')
      expect(result).toEqual(blocks)
    })

    it('mengembalikan array asli jika block tidak memiliki content', () => {
      const blocks = [
        makeBlock('paragraph', { id: 'a', content: 'prev' }),
        makeBlock('image', { id: 'b', url: 'img.jpg' } as any),
      ]
      const result = mergeTextBlockWithPrevious(blocks, 'b')
      expect(result).toEqual(blocks)
    })
  })
})
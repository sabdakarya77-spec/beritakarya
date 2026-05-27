import { describe, it, expect } from 'vitest'
import { isTextBlock, isMediaBlock, supportsMode, supportsWordPressMode } from './blockGuards'

describe('blockGuards', () => {
  describe('isTextBlock', () => {
    it('mengembalikan true untuk paragraph', () => {
      expect(isTextBlock('paragraph')).toBe(true)
    })

    it('mengembalikan true untuk heading', () => {
      expect(isTextBlock('heading')).toBe(true)
    })

    it('mengembalikan true untuk quote', () => {
      expect(isTextBlock('quote')).toBe(true)
    })

    it('mengembalikan true untuk list', () => {
      expect(isTextBlock('list')).toBe(true)
    })

    it('mengembalikan false untuk image', () => {
      expect(isTextBlock('image')).toBe(false)
    })

    it('mengembalikan false untuk embed', () => {
      expect(isTextBlock('embed')).toBe(false)
    })
  })

  describe('isMediaBlock', () => {
    it('mengembalikan true untuk image', () => {
      expect(isMediaBlock('image')).toBe(true)
    })

    it('mengembalikan true untuk gallery', () => {
      expect(isMediaBlock('gallery')).toBe(true)
    })

    it('mengembalikan false untuk paragraph', () => {
      expect(isMediaBlock('paragraph')).toBe(false)
    })
  })

  describe('supportsMode', () => {
    it('paragraph mendukung gridblock', () => {
      expect(supportsMode('paragraph', 'gridblock')).toBe(true)
    })

    it('paragraph mendukung wordpress', () => {
      expect(supportsMode('paragraph', 'wordpress')).toBe(true)
    })

    it('image hanya mendukung gridblock', () => {
      expect(supportsMode('image', 'gridblock')).toBe(true)
      expect(supportsMode('image', 'wordpress')).toBe(false)
    })
  })

  describe('supportsWordPressMode', () => {
    it('paragraph mendukung wordpress', () => {
      expect(supportsWordPressMode('paragraph')).toBe(true)
    })

    it('image tidak mendukung wordpress', () => {
      expect(supportsWordPressMode('image')).toBe(false)
    })

    it('callout tidak mendukung wordpress', () => {
      expect(supportsWordPressMode('callout')).toBe(false)
    })
  })
})
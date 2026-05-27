/**
 * WordPressProjection — Project `blocks[]` into WordPress continuous text flow and back.
 *
 * Two primary operations:
 * 1. `projectBlocksToWordPressFlow` — Split blocks into text blocks (continuous)
 *    and non-text blocks (rendered separately).
 * 2. `projectParsedToBlocks` — Convert parsed HTML nodes back into block updates
 *    via the command layer (editorCommands).
 */

import type { Block } from '@beritakarya/types'
import { isTextBlock } from '../../../core/blockGuards'
import { updateBlockData } from '../../../core/editorCommands'
import type { WordPressParsedNode } from './WordPressParser'

export interface WordPressFlow {
  textBlocks: Block[]
  nonTextBlocks: Block[]
  /** HTML string for the continuous editor */
  continuousHtml: string
  /** Whether the article structure is safe for WordPress editing */
  isSafe: boolean
  /** Warning messages if article has mixed/unsupported structure */
  warnings: string[]
}

/**
 * Project blocks[] into a WordPress-friendly flow.
 * Text blocks become one continuous HTML string; non-text blocks
 * are separated out for rendering below the editor.
 */
export function projectBlocksToWordPressFlow(blocks: Block[]): WordPressFlow {
  const textBlocks = blocks.filter((block) => isTextBlock(block.type))
  const nonTextBlocks = blocks.filter((block) => !isTextBlock(block.type))

  // Build continuous HTML from text blocks
  const continuousHtml = textBlocks
    .map((block) => blockToHtml(block))
    .filter(Boolean)
    .join('\n')

  // Detect warnings
  const warnings: string[] = []
  if (nonTextBlocks.length > 0) {
    warnings.push(
      `Artikel mengandung ${nonTextBlocks.length} blok non-teks. ` +
      'Blok ini tidak muncul di editor kontinu tetapi tetap disimpan dalam urutan asli artikel.'
    )
  }

  // Check interleaving: if non-text blocks are interspersed with text blocks
  let interleaveCount = 0
  for (let i = 0; i < blocks.length - 1; i++) {
    if (!isTextBlock(blocks[i].type) && !isTextBlock(blocks[i + 1].type)) {
      interleaveCount++
    }
  }
  if (interleaveCount > 0) {
    warnings.push(
      'Beberapa blok media berurutan. Pertimbangkan menggunakan GridBlock untuk tata letak yang lebih rapi.'
    )
  }

  const isSafe = nonTextBlocks.length <= 3

  return {
    textBlocks,
    nonTextBlocks,
    continuousHtml,
    isSafe,
    warnings,
  }
}

/**
 * Project parsed nodes back into block-level updates.
 * This takes the output of `parseWordPressHtml` and produces
 * updated blocks using the shared command layer.
 *
 * Returns the new blocks array with updates applied.
 */
export function projectParsedToBlocks(
  currentBlocks: Block[],
  parsedNodes: WordPressParsedNode[]
): Block[] {
  if (parsedNodes.length === 0) return currentBlocks

  const textBlockIds = currentBlocks
    .filter((b) => isTextBlock(b.type))
    .map((b) => b.id)

  let textIdx = 0
  let blocks = [...currentBlocks]

  for (const node of parsedNodes) {
    const targetId = node.blockId || textBlockIds[textIdx]

    if (!targetId) {
      textIdx++
      continue
    }

    switch (node.tag) {
      case 'p':
      case 'blockquote':
        blocks = updateBlockData(blocks, targetId, { content: node.html })
        break
      case 'h2':
        blocks = updateBlockData(blocks, targetId, { content: node.html, level: 2 } as any)
        break
      case 'h3':
        blocks = updateBlockData(blocks, targetId, { content: node.html, level: 3 } as any)
        break
      case 'h4':
        blocks = updateBlockData(blocks, targetId, { content: node.html, level: 4 } as any)
        break
      case 'ul':
      case 'ol': {
        const items = extractListItems(node.html)
        blocks = updateBlockData(blocks, targetId, { items, ordered: node.tag === 'ol' } as any)
        break
      }
    }

    textIdx++
  }

  return blocks
}

/**
 * Convert a single block to its HTML representation for the continuous editor.
 */
function blockToHtml(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return `<p data-block-id="${block.id}">${(block as any).content || ''}</p>`
    case 'heading': {
      const level = (block as any).level || 2
      return `<h${level} data-block-id="${block.id}">${(block as any).content || ''}</h${level}>`
    }
    case 'quote':
      return `<blockquote data-block-id="${block.id}">${(block as any).content || ''}</blockquote>`
    case 'list': {
      const items = (block as any).items || ['']
      const tag = (block as any).ordered ? 'ol' : 'ul'
      return `<${tag} data-block-id="${block.id}">${items.map((i: string) => `<li>${i}</li>`).join('')}</${tag}>`
    }
    default:
      return ''
  }
}

/**
 * Extract list item content from HTML string.
 */
function extractListItems(html: string): string[] {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const items = Array.from(doc.querySelectorAll('li'))
  return items.map((li) => li.innerHTML)
}
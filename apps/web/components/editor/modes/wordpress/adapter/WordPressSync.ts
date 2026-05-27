/**
 * WordPressSync — All WordPress mode changes must go through the command layer.
 *
 * This module bridges the continuous contentEditable in WordPress mode
 * with the canonical `blocks[]` via `editorCommands` and `WordPressProjection`.
 *
 * No direct state mutation is allowed — only command layer functions.
 */

import type { Block } from '@beritakarya/types'
import { isTextBlock } from '../../../core/blockGuards'
import { parseWordPressHtml, type WordPressParsedNode } from './WordPressParser'
import { projectParsedToBlocks, projectBlocksToWordPressFlow } from './WordPressProjection'
import { insertBlock } from '../../../core/editorCommands'

export interface WordPressSyncResult {
  blocks: Block[]
  parsedNodeCount: number
  warnings: string[]
  isSafe: boolean
}

export interface WordPressSyncInput {
  /** The raw innerHTML from the contentEditable */
  editorHtml: string
  /** Current blocks from the store */
  currentBlocks: Block[]
  /** Whether to allow block creation when parsed nodes exceed text blocks */
  allowBlockCreation: boolean
}

/**
 * Sync the WordPress continuous editor content back to blocks[].
 *
 * Flow:
 * 1. Parse editor HTML via WordPressParser
 * 2. Project parsed nodes back to block updates via WordPressProjection
 * 3. Handle block count mismatch (create new blocks if needed)
 * 4. Return updated blocks + metadata
 */
export function syncWordPressEditor(input: WordPressSyncInput): WordPressSyncResult {
  const { editorHtml, currentBlocks, allowBlockCreation } = input
  let blocks = [...currentBlocks]
  const textBlocks = blocks.filter((b) => isTextBlock(b.type))

  // Parse the editor HTML
  const parsedNodes = parseWordPressHtml(editorHtml)

  // Project parsed nodes to block updates
  blocks = projectParsedToBlocks(blocks, parsedNodes)

  // Handle mismatch between parsed nodes and existing text blocks
  const parsedNodeCount = parsedNodes.filter((n) =>
    ['p', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol'].includes(n.tag)
  ).length

  const warningMessages: string[] = []
  let isSafe = true

  if (parsedNodeCount > textBlocks.length) {
    if (allowBlockCreation) {
      const extraCount = parsedNodeCount - textBlocks.length
      for (let i = 0; i < extraCount; i++) {
        const lastTextBlock = [...blocks]
          .reverse()
          .find((b) => isTextBlock(b.type))
        if (lastTextBlock) {
          blocks = insertBlock(blocks, 'paragraph', lastTextBlock.id)
        }
      }
    } else {
      warningMessages.push(
        `Editor memiliki ${parsedNodeCount - textBlocks.length} paragraf lebih banyak dari jumlah blok teks. ` +
        'Aktifkan "allowBlockCreation" untuk menyinkronkan sepenuhnya.'
      )
      isSafe = false
    }
  }

  // Get flow warnings
  const flow = projectBlocksToWordPressFlow(blocks)
  warningMessages.push(...flow.warnings)
  if (!flow.isSafe) isSafe = false

  return {
    blocks,
    parsedNodeCount,
    warnings: warningMessages,
    isSafe,
  }
}

/**
 * Build HTML content for the continuous editor from blocks[].
 * This is the reverse direction: store → DOM.
 */
export function buildEditorHtml(blocks: Block[]): string {
  return projectBlocksToWordPressFlow(blocks).continuousHtml
}

/**
 * Detect if the current blocks[] structure is safe for WordPress editing.
 * Unsafe structures (e.g. many non-text blocks) should trigger a warning.
 */
export function isStructureSafe(blocks: Block[]): boolean {
  return projectBlocksToWordPressFlow(blocks).isSafe
}
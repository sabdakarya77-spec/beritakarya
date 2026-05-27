import type { Editor } from '@tiptap/react'

/**
 * Convert HTML content to Tiptap content
 */
export function fromHTML(editor: Editor, html: string): void {
  editor.commands.setContent(html)
}

/**
 * Parse HTML and return JSON
 */
export function parseHTML(html: string): object {
  // This would require a DOMParser implementation
  // For now, return empty object
  return { type: 'doc', content: [] }
}

export default fromHTML
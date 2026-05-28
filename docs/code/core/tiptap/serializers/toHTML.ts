import type { Editor } from '@tiptap/react'

/**
 * Convert Tiptap content to HTML string
 */
export function toHTML(editor: Editor): string {
  return editor.getHTML()
}

/**
 * Get HTML with specific options
 */
export function toHTMLWithOptions(
  editor: Editor,
  options?: {
    preserveWhitespace?: boolean
    transformPastedContent?: boolean
  }
): string {
  // Tiptap handles most of this natively
  return editor.getHTML()
}

/**
 * Generate HTML for a specific node
 */
export function nodeToHTML(
  editor: Editor,
  nodePosition: { from: number; to: number }
): string {
  const { from, to } = nodePosition
  const slice = editor.state.doc.slice(from, to)
  const fragment = editor.state.schema.topNodeType.create(null, slice.content)
  return fragment.toString()
}

export default toHTML
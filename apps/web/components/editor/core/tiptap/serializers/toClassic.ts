import type { Editor } from '@tiptap/react'

/**
 * Convert Tiptap content to Classic/continuous writing format
 */
export function toClassic(editor: Editor): string {
  return editor.getHTML()
}

/**
 * Convert content to Classic format with specific styling
 */
export function toClassicWithStyles(editor: Editor): string {
  const html = editor.getHTML()
  // Add classic styling classes
  return html.replace(/<p>/g, '<p class="font-serif text-lg leading-relaxed">')
}

export default toClassic
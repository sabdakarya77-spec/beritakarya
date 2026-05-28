import type { Editor } from '@tiptap/react'

/**
 * Convert Tiptap content to JSON
 */
export function toJSON(editor: Editor): object {
  return editor.getJSON()
}

/**
 * Get JSON string
 */
export function toJSONString(editor: Editor, pretty = false): string {
  const json = editor.getJSON()
  return pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json)
}

export default toJSON
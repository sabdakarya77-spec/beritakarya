import type { Editor } from '@tiptap/react'

/**
 * Legacy content format types
 */
export interface LegacyBlock {
  id: string
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list' | 'divider'
  content?: string
  attrs?: Record<string, unknown>
}

/**
 * Convert legacy block-based format to Tiptap content
 */
export function fromLegacy(editor: Editor, legacyData: { blocks: LegacyBlock[] }): void {
  const { blocks } = legacyData
  
  // Clear existing content
  editor.commands.clearContent()
  
  // Process each block
  blocks.forEach((block) => {
    switch (block.type) {
      case 'paragraph':
        editor.commands.setParagraph()
        if (block.content) {
          editor.commands.insertContent(block.content)
        }
        break
      case 'heading':
        const level = ((block.attrs?.level as number) || 2) as 1 | 2 | 3 | 4 | 5 | 6
        editor.commands.setHeading({ level })
        if (block.content) {
          editor.commands.insertContent(block.content)
        }
        break
      case 'quote':
        editor.commands.setBlockquote()
        if (block.content) {
          editor.commands.insertContent(block.content)
        }
        break
      case 'divider':
        editor.commands.setHorizontalRule()
        break
    }
    editor.commands.exitCode()
  })
}

export default fromLegacy
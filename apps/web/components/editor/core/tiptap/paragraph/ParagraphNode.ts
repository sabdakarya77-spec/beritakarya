import { Node, mergeAttributes } from '@tiptap/core'
import type { ParagraphAttrs } from '../../types'

/**
 * Custom Paragraph Node for Tiptap
 * 
 * Extends the default Paragraph node with custom attributes support.
 * This node is used for standard text blocks in the editor.
 */
export const TiptapParagraph = Node.create({
  name: 'paragraph',

  priority: 1000,

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      textAlign: {
        default: null,
        parseHTML: element => element.style.textAlign || null,
        renderHTML: attributes => {
          if (!attributes.textAlign) return {}
          return { style: `text-align: ${attributes.textAlign}` }
        },
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
      'data-block-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-block-id'),
        renderHTML: attributes => {
          if (!attributes['data-block-id']) return {}
          return { 'data-block-id': attributes['data-block-id'] }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'p',
      },
      {
        tag: 'div',
        getAttrs: (node) => {
          const element = node as HTMLElement
          return !element.classList.contains('editor-block')
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addNodeView() {
    return null // Use default node view
  },

  addKeyboardShortcuts() {
    return {
      // Enter creates new paragraph
      Enter: () => {
        return false // Let default behavior handle it
      },
      // Backspace at start merges with previous
      Backspace: () => {
        const { selection, editor } = this
        const { $anchor } = selection
        
        if ($anchor.pos === 0) {
          // At the start of the paragraph, check if we should merge
          const $pos = this.resolve($anchor.pos)
          if ($pos.nodeBefore) {
            return false // Let default behavior handle it
          }
        }
        return false
      },
    }
  },
})

/**
 * Paragraph Node Configuration Options
 */
export interface ParagraphNodeOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * Default Paragraph Node Configuration
 */
export const defaultParagraphOptions: ParagraphNodeOptions = {
  HTMLAttributes: {
    class: 'font-serif text-base leading-relaxed my-4',
  },
}

export default TiptapParagraph
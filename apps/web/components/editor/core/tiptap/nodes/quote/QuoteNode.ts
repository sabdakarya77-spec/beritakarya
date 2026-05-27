import { Node, mergeAttributes } from '@tiptap/core'
import type { QuoteAttrs } from '../../types'

/**
 * Custom Quote Node for Tiptap
 * 
 * Extends the default Blockquote node with custom attributes support.
 */
export const TiptapQuote = Node.create({
  name: 'blockquote',

  priority: 1000,

  group: 'block',

  content: 'inline*',

  defining: true,

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
      citeAlign: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-cite-align') || 'left',
        renderHTML: attributes => {
          if (!attributes.citeAlign) return {}
          return { 'data-cite-align': attributes.citeAlign }
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
      { tag: 'blockquote' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'blockquote',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addKeyboardShortcuts() {
    return {
      // Cmd-Shift-. to toggle blockquote
      'Mod-Shift-.': () => this.editor.chain().focus().toggleBlockquote().run(),
    }
  },
})

/**
 * Quote Node Configuration Options
 */
export interface QuoteNodeOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * Default Quote Node Configuration
 */
export const defaultQuoteOptions: QuoteNodeOptions = {
  HTMLAttributes: {
    class: 'border-l-4 border-gray-400 pl-4 my-4 italic text-gray-600',
  },
}

export default TiptapQuote
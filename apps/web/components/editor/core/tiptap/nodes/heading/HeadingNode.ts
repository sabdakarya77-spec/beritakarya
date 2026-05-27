import { Node, mergeAttributes } from '@tiptap/core'
import type { HeadingAttrs } from '../../types'

/**
 * Custom Heading Node for Tiptap
 * 
 * Extends the default Heading node with custom attributes support.
 * Supports levels 1-6.
 */
export const TiptapHeading = Node.create({
  name: 'heading',

  priority: 1000,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: element => {
          const match = element.tagName.match(/^H([1-6])$/)
          return match ? parseInt(match[1], 10) : 1
        },
        renderHTML: attributes => {
          return {}
        },
      },
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
      { tag: 'h1' },
      { tag: 'h2' },
      { tag: 'h3' },
      { tag: 'h4' },
      { tag: 'h5' },
      { tag: 'h6' },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      `h${node.attrs.level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addKeyboardShortcuts() {
    return {
      // Mod-Alt-1-6 to change heading level
      'Mod-Alt-1': () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
      'Mod-Alt-2': () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      'Mod-Alt-3': () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
      'Mod-Alt-4': () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
      'Mod-Alt-5': () => this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
      'Mod-Alt-6': () => this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
    }
  },
})

/**
 * Heading Node Configuration Options
 */
export interface HeadingNodeOptions {
  HTMLAttributes: Record<string, unknown>
  levels: number[]
}

/**
 * Default Heading Node Configuration
 */
export const defaultHeadingOptions: HeadingNodeOptions = {
  HTMLAttributes: {},
  levels: [1, 2, 3, 4, 5, 6],
}

export default TiptapHeading
import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Paragraph node with dropCap support.
 *
 * When `dropCap` is true, the first letter of the paragraph is rendered
 * as a large decorative initial (typographic drop cap). This is a common
 * stylistic device in news/magazine articles.
 *
 * Storage compatibility:
 * - Persisted as `data-drop-cap` attribute on <p> elements
 * - Mirrored into the editor block model as `dropCap: boolean`
 */
export const DropCapParagraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      dropCap: {
        default: false,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute('data-drop-cap')
          return value === 'true' || value === ''
        },
        renderHTML: (attributes) => {
          if (!attributes.dropCap) return {}
          return { 'data-drop-cap': 'true' }
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('text-align') || element.style.textAlign,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {}
          return { style: `text-align: ${attributes.textAlign}` }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleDropCap:
        () =>
        ({ commands, editor }) => {
          if (!editor.isActive('paragraph')) return false
          return commands.updateAttributes('paragraph', {
            dropCap: !editor.getAttributes('paragraph').dropCap,
          })
        },
      setDropCap:
        (value: boolean) =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { dropCap: value })
        },
    } as never
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dropCap: {
      toggleDropCap: () => ReturnType
      setDropCap: (value: boolean) => ReturnType
    }
  }
}

export default DropCapParagraph

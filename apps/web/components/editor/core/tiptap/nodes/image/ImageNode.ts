import { Node, mergeAttributes } from '@tiptap/core'
import type { ImageAttrs } from '../../types'

/**
 * Custom Image Node for Tiptap
 * 
 * Extends the default Image node with custom attributes support.
 */
export const TiptapImage = Node.create({
  name: 'image',

  group: 'block',

  inline: false,

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      loading: {
        default: 'lazy',
      },
      class: {
        default: null,
      },
      'data-block-id': {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ]
  },

  addNodeView() {
    return null // Use default node view
  },
})

export default TiptapImage
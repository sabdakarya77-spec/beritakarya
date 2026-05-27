import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

/**
 * Classic Mode Extensions Configuration
 * 
 * This configuration is for the Classic/WordPress-style continuous writing mode.
 * It has fewer features and a simpler interface.
 */

/**
 * Custom link extension for Classic mode
 */
const ClassicLink = Link.configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    rel: 'noopener noreferrer',
    target: '_blank',
  },
})

/**
 * Custom underline extension for Classic mode
 */
const ClassicUnderline = Underline.configure({
  HTMLAttributes: {
    class: 'underline',
  },
})

/**
 * Custom placeholder for Classic mode
 */
const ClassicPlaceholder = Placeholder.configure({
  placeholder: 'Mulai menulis...',
  showOnlyWhenEditable: true,
})

/**
 * All extensions for Classic mode
 */
export const classicExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bold: true,
    italic: true,
    underline: false, // We use custom Underline
    link: false, // We use custom Link
  }),
  ClassicLink,
  ClassicUnderline,
  ClassicPlaceholder,
]

/**
 * Classic mode default options
 */
export const classicDefaultOptions = {
  editorProps: {
    attributes: {
      class: 'prose focus:outline-none min-h-[300px] font-serif text-lg leading-relaxed',
    },
  },
  autofocus: 'end',
}

export default classicExtensions
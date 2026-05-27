import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import CharacterCount from '@tiptap/extension-character-count'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { Extension } from '@tiptap/core'

/**
 * GridBlock Mode Extensions Configuration
 * 
 * This configuration includes all extensions needed for the GridBlock mode
 * which supports full block-based editing with slash commands, drag handles, etc.
 */

/**
 * Custom link extension for GridBlock mode
 */
const GridBlockLink = Link.configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    rel: 'noopener noreferrer',
    target: '_blank',
    class: 'text-blue-600 underline hover:text-blue-800',
  },
})

/**
 * Custom underline extension for GridBlock mode
 */
const GridBlockUnderline = Underline.configure({
  HTMLAttributes: {
    class: 'underline',
  },
})

/**
 * Custom text align extension for GridBlock mode
 */
const GridBlockTextAlign = TextAlign.configure({
  types: ['heading', 'paragraph', 'blockquote'],
  alignments: ['left', 'center', 'right', 'justify'],
})

/**
 * Custom code extension for GridBlock mode
 */
const GridBlockCode = Code.configure({
  HTMLAttributes: {
    class: 'font-mono bg-gray-100 px-1 py-0.5 rounded text-sm',
  },
})

/**
 * Custom code block extension for GridBlock mode
 */
const GridBlockCodeBlock = CodeBlock.configure({
  HTMLAttributes: {
    class: 'font-mono bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto',
  },
})

/**
 * Custom image extension for GridBlock mode
 */
const GridBlockImage = Image.configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: {
    class: 'max-w-full h-auto rounded-lg',
  },
})

/**
 * Custom placeholder for GridBlock mode
 */
const GridBlockPlaceholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return 'Ketik judul...'
    }
    return 'Tulis paragraf... (ketik / untuk perintah)'
  },
  showOnlyWhenEditable: true,
  showOnlyCurrent: true,
})

/**
 * Character count extension
 */
const GridBlockCharacterCount = CharacterCount

/**
 * Bubble menu extension for inline formatting
 */
const GridBlockBubbleMenu = BubbleMenu.configure({
  element: document.createElement('div'),
})

/**
 * Floating menu extension for slash commands
 */
const GridBlockFloatingMenu = FloatingMenu.configure({
  element: document.createElement('div'),
})

/**
 * GridBlock mode extension - adds block-specific behavior
 */
const GridBlockExtension = Extension.create({
  name: 'gridBlock',

  addOptions() {
    return {
      onSlashCommand: (callback: (command: string) => void) => {
        this.options.onSlashCommand = callback
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Slash command trigger
      '/': () => {
        // This will be handled by the slash menu component
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    return []
  },
})

/**
 * All extensions for GridBlock mode
 */
export const gridblockExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    codeBlock: false, // We use our custom CodeBlock
    link: false, // We use our custom Link
    underline: false, // We use our custom Underline
  }),
  GridBlockLink,
  GridBlockUnderline,
  GridBlockTextAlign,
  GridBlockCode,
  GridBlockCodeBlock,
  GridBlockImage,
  GridBlockPlaceholder,
  GridBlockCharacterCount,
  GridBlockExtension,
]

/**
 * GridBlock mode default options
 */
export const gridblockDefaultOptions = {
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none focus:outline-none',
    },
  },
  autofocus: 'end',
}

export default gridblockExtensions
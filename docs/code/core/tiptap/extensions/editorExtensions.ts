import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import StarterKit from '@tiptap/starter-kit'
import type { TextAlignment } from '../types'

/**
 * Custom link extension with additional attributes
 */
const CustomLink = Link.configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    rel: 'noopener noreferrer',
    target: '_blank',
  },
})

/**
 * Custom underline extension
 */
const CustomUnderline = Underline.configure({
  HTMLAttributes: {
    class: 'underline',
  },
})

/**
 * Custom text align extension with all alignment options
 */
const CustomTextAlign = TextAlign.configure({
  types: ['heading', 'paragraph', 'blockquote'],
  alignments: ['left', 'center', 'right', 'justify'] as TextAlignment[],
})

/**
 * Custom code extension
 */
const CustomCode = Code.configure({
  HTMLAttributes: {
    class: 'font-mono bg-gray-100 px-1 py-0.5 rounded text-sm',
  },
})

/**
 * Custom code block extension
 */
const CustomCodeBlock = CodeBlock.configure({
  HTMLAttributes: {
    class: 'font-mono bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto',
  },
})

/**
 * Custom image extension
 */
const CustomImage = Image.configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: {
    class: 'max-w-full h-auto rounded-lg',
  },
})

/**
 * Custom placeholder extension
 */
const CustomPlaceholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return 'Ketik judul...'
    }
    return 'Tulis paragraf...'
  },
  showOnlyCurrent: true,
})

/**
 * Character count extension
 */
const CustomCharacterCount = CharacterCount

/**
 * All shared extensions for Tiptap editor
 */
export const sharedExtensions = [
  CustomLink,
  CustomUnderline,
  CustomTextAlign,
  CustomCode,
  CustomCodeBlock,
  CustomImage,
  CustomPlaceholder,
  CustomCharacterCount,
]

/**
 * Rich text extensions (for formatting toolbar)
 */
export const richTextExtensions = [
  CustomLink,
  CustomUnderline,
  CustomTextAlign,
  CustomCode,
]

/**
 * Code extensions (code and code block)
 */
export const codeExtensions = [CustomCode, CustomCodeBlock]

/**
 * Media extensions (image)
 */
export const mediaExtensions = [CustomImage]

/**
 * Export all extensions as default
 */
export default sharedExtensions
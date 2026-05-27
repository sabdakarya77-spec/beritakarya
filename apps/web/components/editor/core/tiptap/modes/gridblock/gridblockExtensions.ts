import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

/**
 * GridBlock Mode Extensions Configuration
 */
export const gridblockExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
  }),
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'blockquote'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
  Placeholder.configure({
    placeholder: 'Tulis paragraf... (ketik / untuk perintah)',
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
  }),
]

export default gridblockExtensions
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { type Editor } from '@tiptap/react'

export interface SlashMenuItem {
  title: string
  description: string
  icon: string
  aliases?: string[]
  command: (editor: Editor) => void
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    title: 'Heading 2',
    description: 'Judul seksi besar',
    aliases: ['h2', 'title'],
    icon: 'H2',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Sub-judul',
    aliases: ['h3'],
    icon: 'H3',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Heading 4',
    description: 'Judul kecil',
    aliases: ['h4'],
    icon: 'H4',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
  },
  {
    title: 'Paragraph',
    description: 'Paragraf biasa',
    aliases: ['p', 'text', 'paragraph'],
    icon: 'P',
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Quote',
    description: 'Kutipan',
    aliases: ['blockquote', 'kutipan'],
    icon: '"',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Bullet List',
    description: 'Daftar dengan titik',
    aliases: ['ul', 'list', 'bullets'],
    icon: '•',
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Daftar bernomor',
    aliases: ['ol', 'numbers', 'ordered'],
    icon: '1.',
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Code Block',
    description: 'Blok kode program',
    aliases: ['code', 'pre', 'snippet'],
    icon: '</>',
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
]

export function filterItems(query: string): SlashMenuItem[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) {
    return SLASH_MENU_ITEMS
  }
  
  return SLASH_MENU_ITEMS.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(normalizedQuery)
    const descMatch = item.description.toLowerCase().includes(normalizedQuery)
    const aliasMatch = item.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))
    
    return titleMatch || descMatch || aliasMatch
  })
}

/**
 * SlashMenuExtension - Tiptap extension for slash command menu
 * 
 * Triggered by typing "/" in the editor to show a menu of block types.
 */
export const SlashMenuExtension = Extension.create({
  name: 'slashMenu',

  addProseMirrorPlugins() {
    const extensionThis = this
    
    return [
      Suggestion({
        editor: extensionThis.editor,
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => {
          return filterItems(query)
        },
        render: () => {
          // These will be set when the menu opens
          let component: any = null
          let popup: any = null
          
          return {
            onStart: (props: any) => {
              // Import tippy dynamically to avoid SSR issues
              import('tippy.js').then((tippy) => {
                const { SlashMenuComponent } = require('./SlashMenuComponent')
                
                // Create React renderer
                const ReactRenderer = require('@tiptap/react').ReactRenderer
                component = new ReactRenderer(SlashMenuComponent, {
                  props: {
                    ...props,
                    items: props.items,
                  },
                  editor: props.editor,
                })
                
                // Position popup
                popup = tippy.default('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  theme: 'slash-menu',
                })
              })
            },
            
            onUpdate: (props: any) => {
              if (popup && popup[0]) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              }
              
              if (component && component.ref) {
                component.ref.updateProps(props)
              }
            },
            
            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide()
                return true
              }
              
              if (component?.ref?.onKeyDown) {
                return component.ref.onKeyDown(props)
              }
              
              return false
            },
            
            onExit: () => {
              if (popup && popup[0]) {
                popup[0].destroy()
              }
              if (component) {
                component.destroy()
              }
            },
          }
        },
        
        command: ({ editor, range, props }: any) => {
          props.command(editor)
          editor.chain().focus().deleteRange(range).run()
        },
      }),
    ]
  },
})

export default SlashMenuExtension
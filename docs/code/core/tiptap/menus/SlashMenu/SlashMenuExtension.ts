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
    // Use arrow function to capture editor reference properly
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => {
          return filterItems(query)
        },
        render: () => {
          // These will be set when the menu opens
          let component: unknown = null
          let popup: unknown = null
          
          return {
            onStart: (props: { clientRect?: (() => DOMRect | null) | null; editor: Editor; items: SlashMenuItem[] }) => {
              // Import tippy dynamically to avoid SSR issues
              import('tippy.js').then((tippyModule) => {
                const tippy = tippyModule.default
                const { SlashMenuComponent } = require('./SlashMenuComponent')
                
                // Create React renderer
                const ReactRenderer = require('@tiptap/react').ReactRenderer
                component = new ReactRenderer(SlashMenuComponent, {
                  props: {
                    editor: props.editor,
                    items: props.items,
                    command: (item: SlashMenuItem) => {
                      item.command(props.editor)
                      props.editor.chain().focus().deleteRange({
                        from: props.editor.state.selection.from,
                        to: props.editor.state.selection.to,
                      }).run()
                    },
                  },
                  editor: props.editor,
                })
                
                // Position popup
                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect ?? null,
                  appendTo: () => document.body,
                  content: (component as { element: HTMLElement }).element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              })
            },
            
            onUpdate: (props: { clientRect?: (() => DOMRect | null) | null }) => {
              const popupInstance = popup as { setProps: (args: object) => void } | undefined
              if (popupInstance) {
                popupInstance.setProps({
                  getReferenceClientRect: props.clientRect ?? null,
                })
              }
              
              const comp = component as { ref?: { updateProps: (props: object) => void } } | undefined
              if (comp?.ref) {
                comp.ref.updateProps(props)
              }
            },
            
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                const popupInstance = popup as { hide: () => void } | undefined
                popupInstance?.hide()
                return true
              }
              
              const comp = component as { ref?: { onKeyDown: (props: { event: KeyboardEvent }) => boolean } } | undefined
              if (comp?.ref?.onKeyDown) {
                return comp.ref.onKeyDown(props)
              }
              
              return false
            },
            
            onExit: () => {
              const popupInstance = popup as { destroy: () => void } | undefined
              if (popupInstance) {
                popupInstance.destroy()
              }
              const comp = component as { destroy: () => void } | undefined
              if (comp) {
                comp.destroy()
              }
            },
          }
        },
        
        command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: SlashMenuItem }) => {
          props.command(editor)
          editor.chain().focus().deleteRange(range).run()
        },
      }),
    ]
  },
})

export default SlashMenuExtension
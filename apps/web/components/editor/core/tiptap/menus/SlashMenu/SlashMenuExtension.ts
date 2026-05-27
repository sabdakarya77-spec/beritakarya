import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Slash Menu Extension for Tiptap
 * 
 * Provides slash command functionality - shows a menu of available commands
 * when user types "/" at the start of a line.
 */
export const SlashMenuExtension = Extension.create({
  name: 'slashMenu',

  addOptions() {
    return {
      onActivate: (callback: (active: boolean, coords: { top: number; left: number }) => void) => {
        this.options.onActivate = callback
      },
      onCommand: (callback: (command: string) => void) => {
        this.options.onCommand = callback
      },
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this
    
    return [
      new Plugin({
        key: new PluginKey('slashMenu'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key === '/') {
              const coords = view.coordsAtPos(view.state.selection.from)
              extensionThis.options.onActivate?.(true, {
                top: coords.bottom + 8,
                left: coords.left,
              })
            }
            return false
          },
        },
      }),
    ]
  },
})

export default SlashMenuExtension
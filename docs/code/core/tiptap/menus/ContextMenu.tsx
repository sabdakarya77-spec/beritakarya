'use client'

import React, { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * ContextMenu Props
 */
export interface ContextMenuProps {
  editor: Editor
  onClose: () => void
  position: { x: number; y: number }
}

/**
 * ContextMenu Component
 * 
 * Right-click context menu for editor operations.
 */
export function ContextMenu({ editor, onClose, position }: ContextMenuProps) {
  const [showSubmenu, setShowSubmenu] = useState<string | null>(null)

  const handleAction = useCallback((action: () => void) => {
    action()
    onClose()
  }, [onClose])

  const menuItems = [
    {
      label: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      shortcut: 'Ctrl+Z',
    },
    {
      label: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      shortcut: 'Ctrl+Shift+Z',
    },
    { type: 'divider' },
    {
      label: 'Cut',
      action: () => document.execCommand('cut'),
      disabled: false,
      shortcut: 'Ctrl+X',
    },
    {
      label: 'Copy',
      action: () => document.execCommand('copy'),
      disabled: false,
      shortcut: 'Ctrl+C',
    },
    {
      label: 'Paste',
      action: () => document.execCommand('paste'),
      disabled: false,
      shortcut: 'Ctrl+V',
    },
    { type: 'divider' },
    {
      label: 'Select All',
      action: () => editor.commands.selectAll(),
      disabled: false,
      shortcut: 'Ctrl+A',
    },
  ]

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border py-1 min-w-[200px]"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={index} className="border-t my-1" />
        }
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleAction(item.action)}
            disabled={item.disabled}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ContextMenu
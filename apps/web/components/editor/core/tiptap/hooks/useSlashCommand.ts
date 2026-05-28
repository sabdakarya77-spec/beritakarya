import { useCallback, useState } from 'react'
import { type Editor } from '@tiptap/react'
import type { SlashMenuItem } from '../menus/SlashMenu/SlashMenuExtension'
import { SLASH_MENU_ITEMS, filterItems } from '../menus/SlashMenu/SlashMenuExtension'

export interface UseSlashCommandOptions {
  editor: Editor
  onOpen?: () => void
  onClose?: () => void
}

export interface UseSlashCommandReturn {
  isOpen: boolean
  query: string
  filteredItems: SlashMenuItem[]
  selectedIndex: number
  selectItem: (index: number) => void
  executeCommand: (item: SlashMenuItem) => void
  close: () => void
  updateQuery: (query: string) => void
}

export function useSlashCommand({
  editor,
  onOpen,
  onClose,
}: UseSlashCommandOptions): UseSlashCommandReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const filteredItems = filterItems(query)
  
  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
    onOpen?.()
  }, [onOpen])
  
  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
    onClose?.()
  }, [onClose])
  
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setSelectedIndex(0)
  }, [])
  
  const selectItem = useCallback((index: number) => {
    if (index >= 0 && index < filteredItems.length) {
      setSelectedIndex(index)
    }
  }, [filteredItems.length])
  
  const executeCommand = useCallback((item: SlashMenuItem) => {
    item.command(editor)
    close()
  }, [editor, close])
  
  return {
    isOpen,
    query,
    filteredItems,
    selectedIndex,
    selectItem,
    executeCommand,
    close,
    updateQuery,
  }
}

export default useSlashCommand
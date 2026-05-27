import { create } from 'zustand'
import type { EditorMode } from '../components/editor/core/editorMode'

interface EditorUiState {
  editorMode: EditorMode
  isSidebarOpen: boolean
  isFocusMode: boolean
  activeTab: 'content' | 'settings' | 'seo' | 'history' | 'assist'
  activeBlockId: string | null
  setEditorMode: (mode: EditorMode) => void
  toggleSidebar: (isOpen?: boolean) => void
  toggleFocusMode: (isFocus?: boolean) => void
  setActiveTab: (tab: EditorUiState['activeTab']) => void
  setActiveBlockId: (blockId: string | null) => void
}

export const useEditorUiStore = create<EditorUiState>((set) => ({
  editorMode: 'gridblock',
  isSidebarOpen: false,
  isFocusMode: false,
  activeTab: 'content',
  activeBlockId: null,
  setEditorMode: (editorMode) => set({ editorMode }),
  toggleSidebar: (isSidebarOpen) => set((state) => ({ isSidebarOpen: isSidebarOpen ?? !state.isSidebarOpen })),
  toggleFocusMode: (isFocusMode) => set((state) => ({ isFocusMode: isFocusMode ?? !state.isFocusMode })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveBlockId: (activeBlockId) => set({ activeBlockId }),
}))

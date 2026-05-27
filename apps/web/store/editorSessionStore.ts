import { create } from 'zustand'

interface EditorSessionState {
  lastSelectionOffset: number | null
  warningMessages: string[]
  setLastSelectionOffset: (offset: number | null) => void
  setWarningMessages: (messages: string[]) => void
  clearWarnings: () => void
}

export const useEditorSessionStore = create<EditorSessionState>((set) => ({
  lastSelectionOffset: null,
  warningMessages: [],
  setLastSelectionOffset: (lastSelectionOffset) => set({ lastSelectionOffset }),
  setWarningMessages: (warningMessages) => set({ warningMessages }),
  clearWarnings: () => set({ warningMessages: [] }),
}))

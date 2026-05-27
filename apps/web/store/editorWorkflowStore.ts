import { create } from 'zustand'
import type { ArticleStatus } from '@beritakarya/types'

interface EditorWorkflowState {
  status: ArticleStatus
  saving: boolean
  saveError: string | null
  lastSaved: Date | null
  setStatus: (status: ArticleStatus) => void
  setSaving: (saving: boolean) => void
  setSaveError: (message: string | null) => void
  setLastSaved: (date: Date | null) => void
}

export const useEditorWorkflowStore = create<EditorWorkflowState>((set) => ({
  status: 'draft',
  saving: false,
  saveError: null,
  lastSaved: null,
  setStatus: (status) => set({ status }),
  setSaving: (saving) => set({ saving }),
  setSaveError: (saveError) => set({ saveError }),
  setLastSaved: (lastSaved) => set({ lastSaved }),
}))

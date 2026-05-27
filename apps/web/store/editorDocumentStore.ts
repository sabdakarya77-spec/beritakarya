import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Block } from '@beritakarya/types'

interface EditorDocumentState {
  articleId: string | null
  title: string
  excerpt: string
  blocks: Block[]
  isDirty: boolean
  setTitle: (title: string) => void
  setExcerpt: (excerpt: string) => void
  setBlocks: (blocks: Block[]) => void
  markClean: () => void
  resetDocument: () => void
}

function createInitialBlocks(): Block[] {
  return [{ id: uuidv4(), type: 'paragraph', content: '' }]
}

export const useEditorDocumentStore = create<EditorDocumentState>((set) => ({
  articleId: null,
  title: '',
  excerpt: '',
  blocks: createInitialBlocks(),
  isDirty: false,
  setTitle: (title) => set({ title, isDirty: true }),
  setExcerpt: (excerpt) => set({ excerpt, isDirty: true }),
  setBlocks: (blocks) => set({ blocks, isDirty: true }),
  markClean: () => set({ isDirty: false }),
  resetDocument: () => set({ articleId: null, title: '', excerpt: '', blocks: createInitialBlocks(), isDirty: false }),
}))

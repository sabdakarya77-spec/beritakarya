import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { normalizeArticleBlocks } from '@beritakarya/utils'
import { api } from '../lib/api'
import type { Block, ArticleStatus } from '@beritakarya/types'

export interface EditorState {
  articleId: string | null
  siteId: string | null
  title: string
  blocks: Block[]
  status: ArticleStatus
  saving: boolean
  saveError: string | null
  lastSaved: Date | null
  isDirty: boolean
  isLoading: boolean
  undoStack: Block[][]
  
  // Metadata & Editorial
  metaTitle: string
  metaDescription: string
  categoryId: string | null
  tags: string[]
  featuredImage: string
  isBreaking: boolean
  isExclusive: boolean
  isFeatured: boolean
  
  // UI State
  isSidebarOpen: boolean
  isFocusMode: boolean
  activeTab: 'content' | 'settings' | 'seo' | 'history'
  
  // Actions
  setTitle: (title: string) => void
  setBlocks: (blocks: Block[]) => void
  addBlock: (type: Block['type'], afterId?: string) => void
  updateBlock: (id: string, data: Partial<Block>) => void
  replaceBlock: (id: string, type: Block['type']) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, direction: 'up' | 'down') => void
  reorderBlocks: (fromIdx: number, toIdx: number) => void
  undo: () => void
  setSiteId: (siteId: string) => void
  
  // Data Sync
  loadArticle: (id: string, siteId: string) => Promise<void>
  saveArticle: () => Promise<void>
  updateArticleData: (data: Partial<EditorState>) => void
  
  toggleSidebar: (isOpen?: boolean) => void
  toggleFocusMode: (isFocus?: boolean) => void
  setActiveTab: (tab: EditorState['activeTab']) => void
  publishArticle: () => Promise<void>
  submitForReview: () => Promise<void>
  reset: (siteId?: string) => void
}

export function createDefaultBlock(type: Block['type'], existingId?: string): Block {
  const block = defaultBlock(type)
  if (existingId) block.id = existingId
  return block
}

function defaultBlock(type: Block['type']): Block {
  const id = uuidv4()
  switch (type) {
    case 'paragraph': return { id, type, content: '' }
    case 'heading': return { id, type, level: 2, content: '' }
    case 'quote': return { id, type, content: '', attribution: '' }
    case 'image': return { id, type, url: '', alt: '', caption: '' }
    case 'imageGrid': return { id, type, columns: 2, images: [] }
    case 'gallery': return { id, type, images: [] }
    case 'list': return { id, type, items: [''], ordered: false }
    case 'callout': return { id, type, content: '', variant: 'editorial', icon: 'zap' }
    case 'embed': return { id, type, url: '', embedType: 'youtube' }
    case 'mediaText': return { id, type, url: '', alt: '', caption: '', content: '', align: 'left' }
    default: return { id, type: 'paragraph', content: '' }
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useEditorStore = create<EditorState>((set, get) => ({
  articleId: null,
  siteId: null,
  title: '',
  blocks: [{ id: uuidv4(), type: 'paragraph', content: '' }],
  status: 'draft',
  saving: false,
  saveError: null,
  lastSaved: null,
  isDirty: false,
  isLoading: false,
  undoStack: [],
  
  metaTitle: '',
  metaDescription: '',
  categoryId: null,
  tags: [],
  featuredImage: '',
  isBreaking: false,
  isExclusive: false,
  isFeatured: false,
  
  isSidebarOpen: false,
  isFocusMode: false,
  activeTab: 'content',

  setTitle: (title) => {
    set({ title, isDirty: true })
    scheduleAutoSave(get)
  },
  setSiteId: (siteId) => set({ siteId }),

  setBlocks: (blocks) => {
    set((s) => ({ undoStack: [...s.undoStack.slice(-20), s.blocks], blocks, isDirty: true }))
    scheduleAutoSave(get)
  },

  addBlock: (type, afterId) => {
    const newBlock = defaultBlock(type)
    set((s) => {
      const idx = afterId ? s.blocks.findIndex(b => b.id === afterId) : s.blocks.length - 1
      const next = [...s.blocks]
      next.splice(idx + 1, 0, newBlock)
      return { undoStack: [...s.undoStack.slice(-20), s.blocks], blocks: next, isDirty: true }
    })
    scheduleAutoSave(get)
  },

  updateBlock: (id, data) => {
    set((s) => ({
      blocks: s.blocks.map(b => b.id === id ? { ...b, ...data } as Block : b),
      isDirty: true
    }))
    scheduleAutoSave(get)
  },

  replaceBlock: (id, type) => {
    set((s) => ({
      undoStack: [...s.undoStack.slice(-20), s.blocks],
      blocks: s.blocks.map(b =>
        b.id === id ? createDefaultBlock(type, id) : b
      ),
      isDirty: true
    }))
    scheduleAutoSave(get)
  },

  removeBlock: (id) => {
    set((s) => ({
      undoStack: [...s.undoStack.slice(-20), s.blocks],
      blocks: s.blocks.filter(b => b.id !== id),
      isDirty: true
    }))
  },

  moveBlock: (id, direction) => {
    set((s) => {
      const idx = s.blocks.findIndex(b => b.id === id)
      if (idx === -1) return s
      const next = [...s.blocks]
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return s
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { undoStack: [...s.undoStack.slice(-20), s.blocks], blocks: next, isDirty: true }
    })
  },

  reorderBlocks: (fromIdx, toIdx) => {
    set((s) => {
      const next = [...s.blocks]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return { undoStack: [...s.undoStack.slice(-20), s.blocks], blocks: next, isDirty: true }
    })
  },

  undo: () => {
    set((s) => {
      if (!s.undoStack.length) return s
      const prev = s.undoStack[s.undoStack.length - 1]
      return { blocks: prev, undoStack: s.undoStack.slice(0, -1), isDirty: true }
    })
  },

  loadArticle: async (id, siteId) => {
    set({ isLoading: true, saveError: null, siteId })
    try {
      const { data } = await api.get(`/articles/${id}`, {
        params: siteId ? { site: siteId } : undefined
      })
      const article = data.data
      // [FIX] Guard against null/undefined blocks from DB
      const rawBlocks = article.blocks
      const blocks: Block[] = Array.isArray(rawBlocks) && rawBlocks.length > 0
        ? rawBlocks
        : [{ id: uuidv4(), type: 'paragraph' as const, content: '' }]
      set({
        articleId: article.id,
        title: article.title || '',
        blocks,
        status: article.status,
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
        categoryId: article.categoryId || null,
        tags: article.tags || [],
        featuredImage: article.featuredImage || '',
        isBreaking: article.isBreaking || false,
        isExclusive: article.isExclusive || false,
        isFeatured: article.isFeatured || false,
        isDirty: false,
        isLoading: false,
        undoStack: []
      })
    } catch (err: any) {
      console.error('Failed to load article:', err)
      const message = err?.response?.data?.message || err?.message || 'Gagal memuat artikel'
      set({ isLoading: false, saveError: message })
    }
  },

  saveArticle: async () => {
    const s = get()
    // Don't save if it's a new article with no title and no content in the first block
    const firstBlock = s.blocks[0] as any
    if (!s.articleId && !s.title.trim() && s.blocks.length <= 1 && (!firstBlock || !firstBlock.content)) return

    set({ saving: true, saveError: null })
    try {
      const payload = {
        title: (s.title || 'Tanpa Judul').trim(),
        blocks: normalizeArticleBlocks(s.blocks) as Block[],
        metaTitle: s.metaTitle?.slice(0, 60) || undefined,
        metaDescription: s.metaDescription?.slice(0, 160) || undefined,
        categoryId: s.categoryId || null,
        tags: s.tags,
        featuredImage: s.featuredImage || undefined,
        isBreaking: s.isBreaking,
        isExclusive: s.isExclusive,
        isFeatured: s.isFeatured
      }
      const params = s.siteId ? { params: { site: s.siteId } } : undefined

      if (s.articleId) {
        await api.put(`/articles/${s.articleId}`, payload, params)
        set({ saving: false, lastSaved: new Date(), isDirty: false })
      } else {
        // Create new article
        const { data } = await api.post('/articles', payload, params)
        const newArticle = data.data
        set({ 
          articleId: newArticle.id, 
          saving: false, 
          lastSaved: new Date(), 
          isDirty: false 
        })
        
        // Update URL to reflect new ID without full reload
        const newUrl = window.location.pathname.replace('/new', `/${newArticle.id}`)
        window.history.replaceState(null, '', newUrl)
      }
    } catch (err: any) {
      console.error('Failed to save article:', err)
      const apiError = err?.response?.data?.error
      const details = apiError?.details as { field?: string; message?: string }[] | undefined
      const detailText = details?.length
        ? details.map((d) => d.message || d.field).filter(Boolean).join('; ')
        : ''
      const message =
        detailText ||
        apiError?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Gagal menyimpan artikel'
      set({ saving: false, saveError: message })
    }
  },

  updateArticleData: (data) => {
    set({ ...data, isDirty: true })
    scheduleAutoSave(get)
  },

  toggleSidebar: (isOpen) => set((s) => ({ isSidebarOpen: isOpen ?? !s.isSidebarOpen })),
  toggleFocusMode: (isFocus) => set((s) => ({ 
    isFocusMode: isFocus ?? !s.isFocusMode,
    isSidebarOpen: isFocus ? false : s.isSidebarOpen 
  })),
  setActiveTab: (activeTab) => set({ activeTab }),

  publishArticle: async () => {
    const { articleId, siteId } = get()
    if (!articleId) return
    await get().saveArticle()
    await api.post(`/articles/${articleId}/publish`, undefined, siteId ? { params: { site: siteId } } : undefined)
    set({ status: 'published' })
  },

  submitForReview: async () => {
    const { articleId, siteId } = get()
    if (!articleId) {
      await get().saveArticle()
    }
    const freshId = get().articleId
    if (!freshId) return

    await api.put(`/articles/${freshId}`, { status: 'submitted' }, siteId ? { params: { site: siteId } } : undefined)
    set({ status: 'submitted' })
  },

  reset: (siteId?: string) => set({
    articleId: null, siteId: siteId ?? null, title: '', status: 'draft',
    blocks: [{ id: uuidv4(), type: 'paragraph', content: '' }],
    saving: false, saveError: null, lastSaved: null, isDirty: false, isLoading: false, undoStack: [],
    metaTitle: '', metaDescription: '', categoryId: null, tags: [],
    featuredImage: '', isBreaking: false, isExclusive: false, isFeatured: false,
    isSidebarOpen: false, activeTab: 'content'
  })
}))

function scheduleAutoSave(get: () => EditorState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const state = get()
    if (state.isDirty && state.articleId) {
      state.saveArticle()
    }
  }, 5000)
}
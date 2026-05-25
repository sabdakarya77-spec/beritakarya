'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  History,
  LayoutGrid,
  Sparkles,
  X
} from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useEditorStore } from '../../store/editorStore'
import { useToastStore } from '../../store/toastStore'
import type { Category } from '@beritakarya/types'
import { AISidebar } from './AISidebar'

// Import broken-down sections
import { ReadinessSummary } from './inspector/ReadinessSummary'
import { WorkflowSection } from './inspector/WorkflowSection'
import { FeaturedImageSection } from './inspector/FeaturedImageSection'
import { TaxonomySection } from './inspector/TaxonomySection'
import { SEOSection } from './inspector/SEOSection'
import { HistorySection } from './inspector/HistorySection'

type EditorSidebarTab = 'settings' | 'seo' | 'history' | 'assist'

interface VersionItem {
  id: string
  version: number
  title: string
  createdAt: string
}

const TABS: { id: EditorSidebarTab; label: string; icon: any }[] = [
  { id: 'settings', label: 'Editorial', icon: LayoutGrid },
  { id: 'seo', label: 'SEO & Meta', icon: BarChart3 },
  { id: 'history', label: 'Riwayat', icon: History },
  { id: 'assist', label: 'Assist', icon: Sparkles }
]

const TAB_META: Record<EditorSidebarTab, { title: string; description: string }> = {
  settings: {
    title: 'Pengaturan Post',
    description: 'Metadata, workflow, dan distribusi artikel dalam panel yang lebih cepat dipindai.'
  },
  seo: {
    title: 'SEO & Meta',
    description: 'Optimasi judul, deskripsi, dan preview pencarian tanpa meninggalkan editor.'
  },
  history: {
    title: 'Riwayat Versi',
    description: 'Pantau perubahan penting dan pulihkan versi sebelumnya bila diperlukan.'
  },
  assist: {
    title: 'Assist AI',
    description: 'Gunakan AI sebagai alat bantu langsung di workflow editor, bukan panel yang terpisah.'
  }
}

export function EditorialSidebar() {
  const {
    isSidebarOpen,
    toggleSidebar,
    activeTab,
    setActiveTab,
    categoryId,
    tags,
    featuredImage,
    isBreaking,
    isExclusive,
    isFeatured,
    metaTitle,
    metaDescription,
    updateArticleData,
    title,
    articleId,
    siteId,
    getMissingRequirements,
    getCompletionScore
  } = useEditorStore()

  const params = useParams()
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([])
  const [versions, setVersions] = useState<VersionItem[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [uploadingFeatured, setUploadingFeatured] = useState(false)
  const { addToast } = useToastStore()

  const missingRequirements = getMissingRequirements()
  const completionScore = getCompletionScore()
  const currentTab = (activeTab === 'settings' || activeTab === 'seo' || activeTab === 'history' || activeTab === 'assist')
    ? activeTab
    : 'settings'
  const panelMeta = TAB_META[currentTab]

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories/tree', {
          params: { site: siteId || (params?.site as string) || 'pusat' }
        })
        setCategoriesTree(data.data || [])
      } catch (error) {
        console.error(error)
      }
    }

    if (isSidebarOpen) loadCategories()
  }, [isSidebarOpen, params?.site, siteId])

  const loadVersions = async () => {
    if (!articleId || articleId === 'new') return

    setLoadingVersions(true)
    try {
      const { data } = await api.get(`/articles/${articleId}/versions`)
      setVersions(data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingVersions(false)
    }
  }

  useEffect(() => {
    if (currentTab === 'history' && isSidebarOpen) loadVersions()
  }, [articleId, currentTab, isSidebarOpen])

  const restoreVersion = async (versionId: string) => {
    if (!confirm('Kembalikan konten ke versi ini? Perubahan saat ini yang belum disimpan akan hilang.')) return

    try {
      const { data } = await api.post(`/articles/versions/${versionId}/restore`)
      updateArticleData({
        title: data.data.title,
        excerpt: data.data.excerpt,
        blocks: data.data.blocks
      })
      addToast('Versi artikel berhasil dipulihkan', 'success')
      setActiveTab('settings')
    } catch (error) {
      console.error(error)
      addToast('Gagal memulihkan versi artikel', 'error')
    }
  }

  const categorySlug = resolveCategorySlug(categoriesTree, categoryId)

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleSidebar(false)}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-white/5 dark:bg-slate-900"
          >
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                    Inspector Editor
                  </p>
                  <h3 className="mt-1 text-sm font-black uppercase tracking-tight text-brand-black dark:text-white">
                    {panelMeta.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {panelMeta.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleSidebar(false)}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
                  aria-label="Tutup inspector"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex border-b border-gray-100 dark:border-white/5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex flex-1 flex-col items-center gap-1.5 py-4 transition-colors',
                    currentTab === tab.id
                      ? 'text-brand-red'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                  {currentTab === tab.id && (
                    <motion.div layoutId="editor-sidebar-active-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-red" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 no-scrollbar">
              <ReadinessSummary completionScore={completionScore} missingRequirements={missingRequirements} />

              {currentTab === 'settings' && (
                <>
                  <WorkflowSection
                    isBreaking={isBreaking}
                    isExclusive={isExclusive}
                    isFeatured={isFeatured}
                    updateArticleData={updateArticleData}
                  />

                  <FeaturedImageSection
                    featuredImage={featuredImage}
                    updateArticleData={updateArticleData}
                    uploadingFeatured={uploadingFeatured}
                    setUploadingFeatured={setUploadingFeatured}
                  />

                  <TaxonomySection
                    categoryId={categoryId}
                    tags={tags}
                    categoriesTree={categoriesTree}
                    updateArticleData={updateArticleData}
                  />
                </>
              )}

              {currentTab === 'seo' && (
                <SEOSection
                  metaTitle={metaTitle}
                  metaDescription={metaDescription}
                  title={title}
                  categorySlug={categorySlug}
                  updateArticleData={updateArticleData}
                />
              )}

              {currentTab === 'history' && (
                <HistorySection
                  articleId={articleId}
                  versions={versions}
                  loadingVersions={loadingVersions}
                  loadVersions={loadVersions}
                  restoreVersion={restoreVersion}
                />
              )}

              {currentTab === 'assist' && <AISidebar />}
            </div>

            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5 dark:border-white/5 dark:bg-white/[0.02]">
              <button
                onClick={() => toggleSidebar(false)}
                className="w-full rounded-2xl bg-brand-black py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-slate-900"
              >
                Tutup Panel
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function resolveCategorySlug(categoriesTree: Category[], categoryId: string | null) {
  if (!categoryId) return 'artikel'

  for (const parent of categoriesTree) {
    if (parent.id === categoryId) return parent.slug || parent.name?.toLowerCase() || 'artikel'
    const subCategory = parent.subCategories?.find((item) => item.id === categoryId)
    if (subCategory) return subCategory.slug || subCategory.name?.toLowerCase() || 'artikel'
  }

  return 'artikel'
}

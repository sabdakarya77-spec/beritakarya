'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  ChevronLeft,
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
    <>
      {!isSidebarOpen && (
        <button
          onClick={() => {
            setActiveTab('settings')
            toggleSidebar(true)
          }}
          className="fixed right-0 top-1/2 z-[65] hidden -translate-y-1/2 rounded-l-2xl border border-r-0 border-gray-200/80 bg-white/95 px-3 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition-all hover:px-4 hover:text-brand-red dark:border-white/10 dark:bg-slate-900/95 dark:text-gray-300 lg:flex lg:flex-col lg:items-center lg:gap-2"
          aria-label="Buka pengaturan post"
          title="Buka pengaturan post"
        >
          <ChevronLeft size={16} className="text-brand-red" />
          <span className="[writing-mode:vertical-rl] rotate-180">Inspector</span>
        </button>
      )}

      <AnimatePresence>
        {isSidebarOpen && (
          <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleSidebar(false)}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-[70] flex w-full flex-col rounded-t-[28px] border border-gray-100 bg-white shadow-2xl dark:border-white/5 dark:bg-slate-900 sm:top-[4.75rem] md:top-[5rem] md:left-auto md:rounded-none md:border-y-0 md:border-r-0 md:w-[23rem] md:max-w-[23rem] xl:top-0 xl:w-[22rem] xl:max-w-[22rem] 2xl:w-[23rem] 2xl:max-w-[23rem]"
          >
            <div className="border-b border-gray-100 px-4 py-4 dark:border-white/5 sm:px-5 md:px-6 md:py-5">
              <div className="flex items-start justify-between gap-3 md:gap-4">
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

            <div className="grid grid-cols-4 border-b border-gray-100 dark:border-white/5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex min-w-0 flex-col items-center gap-1 py-3 text-center transition-colors sm:gap-1.5 sm:py-4',
                    currentTab === tab.id
                      ? 'text-brand-red'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon size={16} />
                  <span className="px-1 text-[8px] font-black uppercase tracking-[0.16em] sm:text-[9px] sm:tracking-widest">{tab.label}</span>
                  {currentTab === tab.id && (
                    <motion.div layoutId="editor-sidebar-active-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-red" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 no-scrollbar sm:p-5 md:space-y-6 md:p-6">
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

            <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 dark:border-white/5 dark:bg-white/[0.02] sm:px-5 md:px-6 md:py-5">
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
    </>
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

'use client'

import { useState } from 'react'
import { 
  Save, 
  Send, 
  Globe, 
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Edit3,
  MoreHorizontal,
  PanelRightOpen
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ArticleStatus } from '@beritakarya/types'
import { useEditorStore } from '../../store/editorStore'

interface EditorTopbarProps {
  isLoading?: boolean
  saveError?: string | null
  saving?: boolean
  isDirty?: boolean
  lastSaved?: string
  status?: ArticleStatus
  wordCount?: number
  onSave: () => void
  onSubmit: () => void
  onPublish: () => void
  onStatusChange?: (status: ArticleStatus) => void
}

const STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  revision: { label: 'Revision', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  scheduled: { label: 'Scheduled', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  published: { label: 'Published', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

export function EditorTopbar({
  isLoading,
  saveError,
  saving,
  isDirty,
  lastSaved,
  status = 'draft',
  wordCount = 0,
  onSave,
  onSubmit,
  onPublish,
  onStatusChange,
}: EditorTopbarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const { isSidebarOpen, toggleSidebar, activeTab, setActiveTab } = useEditorStore()
  
  const statusConfig = STATUS_CONFIG[status]
  const handleMobilePanelToggle = () => {
    if (isSidebarOpen && activeTab === 'settings') {
      toggleSidebar(false)
      return
    }

    setActiveTab('settings')
    toggleSidebar(true)
  }
  
  return (
    <div className="editor-topbar relative z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm">
      {/* Left: Status & Save Info */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Status Badge with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
              statusConfig.color
            )}
          >
            <span>{statusConfig.label}</span>
            <ChevronDown size={12} />
          </button>
          
          {showStatusMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowStatusMenu(false)} 
              />
              <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 min-w-[140px]">
                {(Object.keys(STATUS_CONFIG) as ArticleStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (onStatusChange) {
                        onStatusChange(s)
                      }
                      setShowStatusMenu(false)
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2',
                      status === s ? 'text-brand-red' : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {status === s && <Check size={12} />}
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Save Status */}
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
          {saving ? (
            <>
              <Loader2 size={12} className="animate-spin text-gray-400" />
              <span className="text-gray-500">Saving...</span>
            </>
          ) : saveError ? (
            <>
              <AlertCircle size={12} className="text-red-500" />
              <span className="text-red-500">{saveError}</span>
            </>
          ) : isDirty ? (
            <>
              <Edit3 size={12} className="text-amber-500" />
              <span className="text-amber-600 font-medium">Unsaved</span>
            </>
          ) : lastSaved ? (
            <>
              <Clock size={12} className="text-gray-400" />
              <span className="text-gray-500">{lastSaved}</span>
            </>
          ) : null}
        </div>
      </div>
      
      {/* Center: Word Count */}
      <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
        <span>{wordCount.toLocaleString()} words</span>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMobilePanelToggle}
          className={cn(
            'inline-flex lg:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all',
            isSidebarOpen && activeTab === 'settings'
              ? 'bg-brand-red text-white hover:bg-red-700'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
          )}
          aria-label={isSidebarOpen && activeTab === 'settings' ? 'Tutup panel editor' : 'Buka panel editor'}
          title={isSidebarOpen && activeTab === 'settings' ? 'Tutup panel editor' : 'Buka panel editor'}
        >
          <PanelRightOpen size={14} />
          <span className="hidden sm:inline">Panel</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all',
            saving
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
          )}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span className="hidden sm:inline">Save</span>
        </button>
        
        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
        >
          <Send size={14} />
          <span className="hidden sm:inline">Submit</span>
        </button>
        
        {/* Publish Button (dropdown) */}
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-brand-red hover:bg-red-700 text-white transition-all"
        >
          <Globe size={14} />
          <span className="hidden sm:inline">Publish</span>
        </button>
        
        {/* More Options */}
        <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  )
}

export default EditorTopbar

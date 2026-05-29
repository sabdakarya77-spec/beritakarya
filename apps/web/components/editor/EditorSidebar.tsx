'use client'

import { cn } from '../../lib/utils'
import { ChevronRight, FileText, Settings, Search, History, Sparkles } from 'lucide-react'
import { SEOPanel } from './seo/SEOPanel'
import { TabSettings } from './tabs/TabSettings'
import { TabContent } from './tabs/TabContent'
import { AIPanel } from './ai/AIPanel'
import { useEditorStore } from '../../store/editorStore'

interface EditorSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

type TabType = 'content' | 'settings' | 'seo' | 'history' | 'assist'

export function EditorSidebar({ isOpen, onToggle }: EditorSidebarProps) {
  const { activeTab, setActiveTab } = useEditorStore()
  
  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'history', label: 'History', icon: History },
    { id: 'assist', label: 'AI', icon: Sparkles },
  ]
  
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-brand-red text-white rounded-l-lg shadow-lg hover:bg-red-700 transition-all"
        title="Open sidebar"
      >
        <ChevronRight size={16} />
      </button>
    )
  }
  
  return (
    <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
          Panel Editor
        </h3>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-all"
          title="Close sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-3 text-xs font-bold transition-all relative',
                activeTab === tab.id
                  ? 'text-brand-red'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
              title={tab.label}
            >
              <Icon size={14} />
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && <TabContent />}
        {activeTab === 'settings' && <TabSettings />}
        {activeTab === 'seo' && <SEOPanel />}
        {activeTab === 'history' && (
          <div className="p-4 text-center py-8 text-gray-400">
            <History size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Version history coming soon</p>
          </div>
        )}
        {activeTab === 'assist' && <AIPanel />}
      </div>
    </aside>
  )
}

export default EditorSidebar
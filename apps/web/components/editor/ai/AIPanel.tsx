'use client'

import { useState } from 'react'
import { Sparkles, X, Pencil, Lightbulb, ShieldCheck, Image, Search } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { WriteTab } from './tabs/WriteTab'
import { OptimizeTab } from './tabs/OptimizeTab'
import { ValidateTab } from './tabs/ValidateTab'
import { ImageTab } from './tabs/ImageTab'
import { SEOAuditTab } from './tabs/SEOAuditTab'

type TabId = 'write' | 'optimize' | 'validate' | 'image' | 'seo'

const TABS = [
  { id: 'write' as const, label: 'Tulis', icon: Pencil },
  { id: 'optimize' as const, label: 'Optimasi', icon: Lightbulb },
  { id: 'validate' as const, label: 'Validasi', icon: ShieldCheck },
  { id: 'image' as const, label: 'Gambar', icon: Image },
  { id: 'seo' as const, label: 'SEO', icon: Search },
]

interface AIPanelProps {
  isOpen?: boolean
  onClose?: () => void
  editor?: any // Tiptap editor instance
}

/**
 * AI Assistant Panel for Editor
 * 
 * Provides AI-powered writing assistance with tabs:
 * - Write: Rewrite, Expand, Transcript
 * - Optimize: Headlines, SEO
 * - Validate: Grammar, Readability, Fact-check
 * - Image: Alt text & caption generation
 * - SEO: Real-time SEO audit
 */
export function AIPanel({ isOpen = true, onClose, editor }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('write')
  const [model] = useState('gpt-4o')

  if (!isOpen) return null

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-bold text-sm">AI Assistant</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'write' && <WriteTab model={model} />}
        {activeTab === 'optimize' && <OptimizeTab model={model} />}
        {activeTab === 'validate' && <ValidateTab model={model} />}
        {activeTab === 'image' && <ImageTab model={model} />}
        {activeTab === 'seo' && <SEOAuditTab />}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
        <p className="text-[10px] text-gray-400 text-center">
          Model: {model} • Powered by OpenAI
        </p>
      </div>
    </div>
  )
}
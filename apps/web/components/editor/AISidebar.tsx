'use client'
import { useState, useEffect, useRef } from 'react'
import { WriteTab } from './ai/WriteTab'
import { OptimizeTab } from './ai/OptimizeTab'
import { ValidateTab } from './ai/ValidateTab'
import { LayoutTab } from './ai/LayoutTab'
import { ImageTab } from './ai/ImageTab'
import { SEOAuditTab } from './ai/SEOAuditTab'

type Tab = 'write' | 'optimize' | 'validate' | 'seo' | 'layout' | 'image'

const TABS: { id: Tab; label: string }[] = [
  { id: 'write', label: 'Tulis' },
  { id: 'optimize', label: 'Optimasi' },
  { id: 'validate', label: 'Validasi' },
  { id: 'seo', label: 'SEO Audit' },
  { id: 'layout', label: 'Layout' },
  { id: 'image', label: 'Gambar' }
]

import { Sparkles, X, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Best)', price: '$$$' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Balanced)', price: '$$' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast)', price: '$' }
]

export function AISidebar() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('write')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Load saved model preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-model')
    if (saved) setSelectedModel(saved)
  }, [])
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value
    setSelectedModel(model)
    localStorage.setItem('ai-model', model)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-2xl shadow-black/40 flex items-center gap-3 transition-all duration-300 z-40 border border-white/10 hover:bg-brand-red hover:scale-105 active:scale-95 group"
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        <Sparkles size={14} className="text-amber-400 group-hover:text-white" />
        <span className="text-white">Asisten AI</span>
      </button>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-[#090e18] border-l border-gray-100 dark:border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.3)] flex flex-col z-[60] animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-white/5 bg-brand-surface dark:bg-[#0d1525]">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-red" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-black dark:text-white">Asisten AI Redaksi</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Model Selector */}
      <div className="px-6 py-3 border-b border-gray-50 dark:border-white/5 bg-gray-25 dark:bg-[#070b13]">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">Model:</label>
          <div className="relative flex-1">
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full text-xs border border-gray-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 pr-8 outline-none focus:border-amber-400 appearance-none bg-white dark:bg-[#0a0f1d] text-gray-800 dark:text-gray-200"
            >
              {AI_MODELS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} ({m.price})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          {selectedModel === 'gpt-4o' && 'Best quality - Recommended for important articles'}
          {selectedModel === 'gpt-4-turbo' && 'Good balance - Fast and accurate'}
          {selectedModel === 'gpt-3.5-turbo' && 'Fastest & cheapest - Good for drafts'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-50 dark:border-white/5 bg-white dark:bg-[#090e18]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
              tab === t.id
                ? 'border-brand-red text-brand-red bg-brand-red/[0.02] dark:bg-brand-red/[0.01]'
                : 'border-transparent text-gray-400 hover:text-brand-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.01]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin dark:bg-[#090e18]">
        <div style={{ display: tab === 'write' ? 'block' : 'none' }}>
          <WriteTab model={selectedModel} onTrigger={() => { setOpen(true); setTab('write') }} />
        </div>
        <div style={{ display: tab === 'optimize' ? 'block' : 'none' }}>
          <OptimizeTab model={selectedModel} onTrigger={() => { setOpen(true); setTab('optimize') }} />
        </div>
        <div style={{ display: tab === 'validate' ? 'block' : 'none' }}>
          <ValidateTab model={selectedModel} onTrigger={() => { setOpen(true); setTab('validate') }} />
        </div>
        <div style={{ display: tab === 'seo' ? 'block' : 'none' }}>
          <SEOAuditTab />
        </div>
        <div style={{ display: tab === 'layout' ? 'block' : 'none' }}>
          <LayoutTab model={selectedModel} onTrigger={() => { setOpen(true); setTab('layout') }} />
        </div>
        <div style={{ display: tab === 'image' ? 'block' : 'none' }}>
          <ImageTab model={selectedModel} onTrigger={() => { setOpen(true); setTab('image') }} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-50 dark:border-white/5 bg-brand-surface dark:bg-[#0d1525]">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
            AI bersifat asistif — Selalu tinjau konten sebelum dipublikasikan demi menjaga integritas jurnalistik.
          </p>
      </div>
    </div>
  )
}
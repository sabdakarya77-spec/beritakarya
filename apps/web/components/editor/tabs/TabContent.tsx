'use client'

import { useEditorStore } from '../../../store/editorStore'
import { FileText, Hash, Image, Layout } from 'lucide-react'

export function TabContent() {
  const { blocks } = useEditorStore()
  
  // Calculate stats
  const paragraphCount = blocks.filter(b => b.type === 'paragraph').length
  const headingCount = blocks.filter(b => b.type === 'heading').length
  const imageCount = blocks.filter(b => b.type === 'image').length
  
  // Estimate reading time (200 words per minute) - accurate sync including list items
  const wordCount = blocks.reduce((count, block) => {
    const content = (block as any).content || ''
    const items = (block as any).items || []
    
    // Count words in content
    const textContent = content.replace(/<[^>]*>/g, ' ').trim()
    const words = textContent.split(/\s+/).filter(w => w.length > 0)
    
    // Count words in list items
    const listWords = items.reduce((acc: number, item: string) => {
      const clean = item.replace(/<[^>]*>/g, ' ').trim()
      return acc + clean.split(/\s+/).filter(w => w.length > 0).length
    }, 0)
    
    return count + words.length + listWords
  }, 0)
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="space-y-6">
      {/* Word Count Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="text-2xl font-black text-brand-black dark:text-white">
            {wordCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Words</div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="text-2xl font-black text-brand-black dark:text-white">
            {readingTime}
          </div>
          <div className="text-xs text-gray-500">Min read</div>
        </div>
      </div>

      {/* Block Stats */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Block Statistics
        </h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FileText size={14} />
              Paragraphs
            </span>
            <span className="font-bold">{paragraphCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Hash size={14} />
              Headings
            </span>
            <span className="font-bold">{headingCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Image size={14} />
              Images
            </span>
            <span className="font-bold">{imageCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Layout size={14} />
              Total Blocks
            </span>
            <span className="font-bold">{blocks.length}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default TabContent
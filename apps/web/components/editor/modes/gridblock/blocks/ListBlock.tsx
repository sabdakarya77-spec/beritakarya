'use client'
import { useEditorStore } from '../../../../../store/editorStore'
import type { ListBlock as TListBlock } from '@beritakarya/types'
import { Plus, X, List as ListIcon, ListOrdered } from 'lucide-react'

export function ListBlock({ block }: { block: TListBlock }) {
  const { updateBlock } = useEditorStore()

  const handleUpdate = (idx: number, value: string) => {
    const next = [...block.items]
    next[idx] = value
    updateBlock(block.id, { items: next })
  }

  const addItem = () => {
    updateBlock(block.id, { items: [...block.items, ''] })
  }

  const removeItem = (idx: number) => {
    if (block.items.length <= 1) return
    const next = block.items.filter((_, i) => i !== idx)
    updateBlock(block.id, { items: next })
  }

  const toggleOrder = () => {
    updateBlock(block.id, { ordered: !block.ordered })
  }

  return (
    <div className="group/list py-2 lg:py-3">
      <div className="mb-5 flex items-center gap-4 opacity-0 transition-opacity group-hover/list:opacity-100">
        <button 
          onClick={toggleOrder}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-brand-red transition-colors"
        >
          {block.ordered ? <ListOrdered size={14} /> : <ListIcon size={14} />}
          {block.ordered ? 'Numbered' : 'Bulleted'}
        </button>
      </div>

      <div className="space-y-4 lg:space-y-5">
        {block.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 group/item">
            <div className="mt-2.5 flex-shrink-0">
              {block.ordered ? (
                <span className="tabular-nums text-sm font-black text-brand-red lg:text-base">{idx + 1}.</span>
              ) : (
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-red lg:mt-2.5 lg:h-2 lg:w-2" />
              )}
            </div>
            <textarea
              value={item}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              placeholder="Tulis poin..."
              rows={1}
              className="flex-1 resize-none border-none bg-transparent py-1 font-serif text-[1.02rem] leading-8 text-brand-black outline-none dark:text-gray-200 lg:text-[1.08rem] lg:leading-[2rem]"
            />
            <button 
              onClick={() => removeItem(idx)}
              className="mt-2 opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-brand-red transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={addItem}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-brand-red dark:border-white/5"
      >
        <Plus size={14} /> Tambah Poin
      </button>
    </div>
  )
}
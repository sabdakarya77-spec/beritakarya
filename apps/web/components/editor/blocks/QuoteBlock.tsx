'use client'
import { useEditorStore } from '../../../store/editorStore'
import type { QuoteBlock as TQuoteBlock } from '@beritakarya/types'

export function QuoteBlock({ block }: { block: TQuoteBlock }) {
  const { updateBlock } = useEditorStore()
  return (
    <div className="border-l-4 border-blue-400 py-2 pl-5 lg:pl-6">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => updateBlock(block.id, { content: e.currentTarget.innerText })}
        data-placeholder="Tulis kutipan..."
        className="font-serif text-[1.15rem] italic leading-8 text-gray-700 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:not-italic dark:text-gray-100 lg:text-[1.25rem] lg:leading-[2.2rem]"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => updateBlock(block.id, { attribution: e.currentTarget.innerText })}
        data-placeholder="— Nama narasumber"
        className="mt-3 text-sm uppercase tracking-[0.14em] text-gray-400 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
        dangerouslySetInnerHTML={{ __html: block.attribution || '' }}
      />
    </div>
  )
}

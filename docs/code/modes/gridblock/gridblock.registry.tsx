import { ParagraphBlock } from './blocks/ParagraphBlock'
import { HeadingBlock } from './blocks/HeadingBlock'
import { QuoteBlock } from './blocks/QuoteBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { EmbedBlock } from './blocks/EmbedBlock'
import { ImageGridBlock } from './blocks/ImageGridBlock'
import { GalleryBlock } from './blocks/GalleryBlock'
import { ListBlock } from './blocks/ListBlock'
import { CalloutBlock } from './blocks/CalloutBlock'
import { MediaTextBlock } from './blocks/MediaTextBlock'
import type { Block } from '@beritakarya/types'

export const BLOCK_RENDERERS: Record<string, React.ComponentType<{ block: any }>> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  quote: QuoteBlock,
  image: ImageBlock,
  imageGrid: ImageGridBlock,
  gallery: GalleryBlock,
  list: ListBlock,
  callout: CalloutBlock,
  embed: EmbedBlock,
  mediaText: MediaTextBlock,
}

export function BlockRenderer({ block }: { block: Block }) {
  const Component = BLOCK_RENDERERS[block.type]

  if (!Component) {
    return (
      <div className="group relative rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 px-6 py-4 transition-all hover:border-gray-200 hover:bg-gray-50">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="rounded-full bg-gray-100 p-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Blok tidak didukung</p>
            <p className="max-w-[200px] text-xs text-gray-400">
              Tipe blok <span className="font-mono text-amber-600">&quot;{block.type}&quot;</span> belum dapat ditampilkan di editor ini.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <Component block={block} />
}

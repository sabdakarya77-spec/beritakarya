// Tiptap Nodes Index - Public API exports
export { TiptapParagraph } from './section/TiptapParagraph'
export type { TiptapParagraphProps } from './section/TiptapParagraph'

export { TiptapHeading } from './heading/TiptapHeading'
export type { TiptapHeadingProps } from './heading/TiptapHeading'

export { default as ParagraphView } from './section/ParagraphView'
export { default as HeadingView } from './heading/HeadingView'

// Re-export block components from modes/gridblock/blocks for backward compatibility
export { default as ParagraphBlock } from './section/TiptapParagraph'
export { default as HeadingBlock } from './heading/TiptapHeading'
export { default as QuoteView } from './quote/QuoteView'
export { default as ImageView } from './image/ImageView'

// Node definitions (placeholders for now)
export { default as ImageNode } from './image/ImageNode'
export { default as QuoteNode } from './quote/QuoteNode'
export { default as HeadingNode } from './heading/HeadingNode'
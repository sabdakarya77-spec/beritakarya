import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import React from 'react'

/**
 * ParagraphView - Custom NodeView for paragraph blocks
 * 
 * This provides a React wrapper for the paragraph node with editorial styling.
 */
export function ParagraphView({ node, selected }: NodeViewProps) {
  const { textAlign, class: className } = node.attrs

  const classNames = [
    'paragraph-node',
    'my-4',
    'font-serif',
    'text-[1.05rem]',
    'leading-[1.85]',
    'text-slate-800',
    'dark:text-slate-100',
    className,
  ].filter(Boolean).join(' ')

  return (
    <NodeViewWrapper>
      <p
        className={classNames}
        style={textAlign ? { textAlign } : undefined}
        data-selected={selected}
      />
    </NodeViewWrapper>
  )
}

export default ParagraphView
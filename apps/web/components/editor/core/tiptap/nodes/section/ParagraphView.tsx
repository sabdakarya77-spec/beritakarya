'use client'

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react'
import { useCallback, useMemo } from 'react'

/**
 * Custom Paragraph NodeView
 * 
 * React component wrapper for the Paragraph node.
 * Provides consistent styling and behavior.
 */
export function ParagraphView({ node, updateAttributes, selected }: NodeViewProps) {
  const { textAlign, class: className, 'data-block-id': blockId } = node.attrs

  const style = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (textAlign) {
      styles.textAlign = textAlign
    }
    return styles
  }, [textAlign])

  const classNames = useMemo(() => {
    const classes = ['paragraph-node', 'font-serif', 'text-base', 'leading-relaxed', 'my-4']
    if (className) {
      classes.push(className)
    }
    if (selected) {
      classes.push('ring-2', 'ring-blue-500', 'rounded')
    }
    return classes.join(' ')
  }, [className, selected])

  const handleClick = useCallback(() => {
    // Focus the editor when clicking on the paragraph
    const editor = document.querySelector(`[data-block-id="${blockId}"]`)
    if (editor instanceof HTMLElement) {
      editor.focus()
    }
  }, [blockId])

  return (
    <NodeViewWrapper>
      <div
        className={classNames}
        style={style}
        data-block-id={blockId}
        onClick={handleClick}
      >
        <p className="relative group">
          <NodeViewContent className="block" />
          {/* Slash command indicator */}
          <span className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            +
          </span>
        </p>
      </div>
    </NodeViewWrapper>
  )
}

export default ParagraphView
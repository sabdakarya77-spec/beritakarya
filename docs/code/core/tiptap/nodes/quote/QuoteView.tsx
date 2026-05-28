'use client'

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react'
import { useMemo } from 'react'

/**
 * Custom Quote NodeView
 * 
 * React component wrapper for the Blockquote node.
 */
export function QuoteView({ node, selected }: NodeViewProps) {
  const { textAlign, class: className, 'data-block-id': blockId } = node.attrs

  const style = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (textAlign) {
      styles.textAlign = textAlign
    }
    return styles
  }, [textAlign])

  const classNames = useMemo(() => {
    const classes = [
      'quote-node',
      'border-l-4',
      'border-gray-400',
      'pl-4',
      'my-4',
      'italic',
      'text-gray-600',
    ]
    if (className) {
      classes.push(className)
    }
    if (selected) {
      classes.push('ring-2', 'ring-blue-500', 'rounded')
    }
    return classes.join(' ')
  }, [className, selected])

  return (
    <NodeViewWrapper>
      <blockquote
        className={classNames}
        style={style}
        data-block-id={blockId}
      >
        <NodeViewContent className="block" />
      </blockquote>
    </NodeViewWrapper>
  )
}

export default QuoteView
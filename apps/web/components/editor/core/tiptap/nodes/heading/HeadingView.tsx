'use client'

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react'
import { useMemo } from 'react'

/**
 * Heading level styles
 */
const HEADING_STYLES: Record<number, string> = {
  1: 'text-4xl font-bold mb-4 mt-6',
  2: 'text-3xl font-bold mb-3 mt-5',
  3: 'text-2xl font-semibold mb-2 mt-4',
  4: 'text-xl font-semibold mb-2 mt-3',
  5: 'text-lg font-medium mb-1 mt-2',
  6: 'text-base font-medium mb-1 mt-2',
}

/**
 * Custom Heading NodeView
 * 
 * React component wrapper for the Heading node.
 * Provides consistent styling based on heading level.
 */
export function HeadingView({ node, selected }: NodeViewProps) {
  const { level, textAlign, class: className, 'data-block-id': blockId } = node.attrs

  const headingStyle = HEADING_STYLES[level] || HEADING_STYLES[1]

  const style = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (textAlign) {
      styles.textAlign = textAlign
    }
    return styles
  }, [textAlign])

  const classNames = useMemo(() => {
    const classes = ['heading-node', headingStyle]
    if (className) {
      classes.push(className)
    }
    if (selected) {
      classes.push('ring-2', 'ring-blue-500', 'rounded')
    }
    return classes.join(' ')
  }, [className, selected, headingStyle])

  return (
    <NodeViewWrapper>
      <div
        className={classNames}
        style={style}
        data-block-id={blockId}
        data-heading-level={level}
      >
        <NodeViewContent className="block" />
      </div>
    </NodeViewWrapper>
  )
}

export default HeadingView
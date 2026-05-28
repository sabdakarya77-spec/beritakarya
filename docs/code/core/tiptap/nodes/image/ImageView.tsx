'use client'

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useState, useCallback } from 'react'

/**
 * Custom Image NodeView
 * 
 * React component wrapper for the Image node.
 * Provides image preview and selection functionality.
 */
export function ImageView({ node, selected, deleteNode }: NodeViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const { src, alt, title, width, height, loading, class: className, 'data-block-id': blockId } = node.attrs

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
  }, [])

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteNode) {
      deleteNode()
    }
  }, [deleteNode])

  return (
    <NodeViewWrapper>
      <div
        className={`image-node relative group my-4 ${selected ? 'ring-2 ring-blue-500 rounded' : ''}`}
        data-block-id={blockId}
      >
        {isLoading && (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center bg-red-50 rounded-lg p-8">
            <span className="text-red-500 mb-2">Gagal memuat gambar</span>
            <span className="text-sm text-gray-500">{src}</span>
          </div>
        ) : (
          <>
            <img
              src={src}
              alt={alt || ''}
              title={title || ''}
              width={width}
              height={height}
              loading={loading}
              className={`max-w-full h-auto rounded-lg ${className || ''}`}
              onLoad={handleLoadComplete}
              onError={handleError}
            />

            {/* Image toolbar overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1 bg-white shadow-lg rounded-lg border p-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded hover:bg-red-100 text-red-500"
                  title="Hapus gambar"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Image info overlay */}
            {alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {alt}
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageView
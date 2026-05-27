'use client'

import React, { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * ImageToolbar Props
 */
export interface ImageToolbarProps {
  editor: Editor
  onImageUpload?: (file: File) => Promise<string>
}

/**
 * Image Toolbar Component
 * 
 * Provides UI for image manipulation (upload, alt text, alignment, etc.)
 */
export function ImageToolbar({ editor, onImageUpload }: ImageToolbarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle file selection for upload
   */
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImageUpload) return

    setIsUploading(true)
    setError(null)

    try {
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar')
    } finally {
      setIsUploading(false)
    }
  }, [editor, onImageUpload])

  /**
   * Get current image attributes
   */
  const getImageAttributes = useCallback(() => {
    const { nodes } = editor.state.document.content
    const imageNode = nodes.find(n => n.type.name === 'image')
    return imageNode?.attrs || {}
  }, [editor])

  /**
   * Set image alt text
   */
  const handleSetAlt = useCallback((alt: string) => {
    editor.chain().focus().updateAttributes('image', { alt }).run()
  }, [editor])

  /**
   * Set image title
   */
  const handleSetTitle = useCallback((title: string) => {
    editor.chain().focus().updateAttributes('image', { title }).run()
  }, [editor])

  /**
   * Set image width
   */
  const handleSetWidth = useCallback((width: string) => {
    const numWidth = parseInt(width, 10)
    if (!isNaN(numWidth)) {
      editor.chain().focus().updateAttributes('image', { width: numWidth }).run()
    }
  }, [editor])

  return (
    <div className="flex flex-col gap-3 p-3 bg-white rounded-lg shadow-lg border min-w-[280px]">
      <div className="text-sm font-medium text-gray-700">Image Properties</div>
      
      {/* Upload Button */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Upload Gambar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="w-full text-sm border rounded p-1"
        />
        {isUploading && <span className="text-xs text-blue-500">Mengunggah...</span>}
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
        <input
          type="text"
          value={getImageAttributes().alt || ''}
          onChange={(e) => handleSetAlt(e.target.value)}
          placeholder="Deskripsi gambar"
          className="w-full text-sm border rounded p-1.5"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Title</label>
        <input
          type="text"
          value={getImageAttributes().title || ''}
          onChange={(e) => handleSetTitle(e.target.value)}
          placeholder="Judul gambar"
          className="w-full text-sm border rounded p-1.5"
        />
      </div>

      {/* Width */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
        <input
          type="number"
          value={getImageAttributes().width || ''}
          onChange={(e) => handleSetWidth(e.target.value)}
          placeholder="Auto"
          className="w-full text-sm border rounded p-1.5"
        />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteNode('image').run()}
        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
      >
        Hapus Gambar
      </button>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </div>
  )
}

export default ImageToolbar
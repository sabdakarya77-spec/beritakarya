'use client'
import { useEffect, useCallback } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { ArticleEditorShell } from './ArticleEditorShell'
import { EditorTitleStage } from './EditorTitleStage'
import { EditorCanvas } from './EditorCanvas'

interface EditorProps {
  articleId: string
  siteId: string
}

export function Editor({ articleId, siteId }: EditorProps) {
  const {
    loadArticle,
    saveArticle,
    undo,
    isFocusMode,
    reset,
    setSiteId,
    isLoading,
    saveError,
    setActiveTab,
    toggleSidebar
  } = useEditorStore()

  useEffect(() => {
    setSiteId(siteId)
    if (articleId && articleId !== 'new') {
      loadArticle(articleId, siteId)
    } else if (articleId === 'new') {
      reset(siteId)
    }

    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setActiveTab('settings')
      toggleSidebar(true)
    }
  }, [articleId, siteId, loadArticle, reset, setSiteId, setActiveTab, toggleSidebar])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      undo()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveArticle()
    }
  }, [undo, saveArticle])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <ArticleEditorShell 
      isFocusMode={isFocusMode} 
      isLoading={isLoading} 
      saveError={saveError}
    >
      <EditorTitleStage isFocusMode={isFocusMode} />
      <EditorCanvas isFocusMode={isFocusMode} />
    </ArticleEditorShell>
  )
}

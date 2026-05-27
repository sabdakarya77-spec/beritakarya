import { useMemo } from 'react'
import { useEditorDocumentStore } from './editorDocumentStore'
import { useEditorUiStore } from './editorUiStore'
import { useEditorWorkflowStore } from './editorWorkflowStore'
import { useEditorSessionStore } from './editorSessionStore'
import { useEditorStore } from './editorStore'
import {
  getActiveBlock,
  getNonTextBlocks,
  getTextBlocks,
  isDocumentEmpty,
} from '../components/editor/core/editorSelectors'

function mapLegacyEditorMode(mode: 'gridblok' | 'wordpress') {
  return mode === 'gridblok' ? 'gridblock' : 'wordpress'
}

export function getEditorFacadeSnapshot() {
  const documentState = useEditorDocumentStore.getState()
  const uiState = useEditorUiStore.getState()
  const workflowState = useEditorWorkflowStore.getState()
  const sessionState = useEditorSessionStore.getState()
  const legacyState = useEditorStore.getState()

  return {
    ...documentState,
    ...uiState,
    ...workflowState,
    ...sessionState,
    editorMode: mapLegacyEditorMode(legacyState.editorMode),
    activeBlock: getActiveBlock(documentState.blocks, uiState.activeBlockId),
    textBlocks: getTextBlocks(documentState.blocks),
    nonTextBlocks: getNonTextBlocks(documentState.blocks),
    isDocumentEmpty: isDocumentEmpty(documentState.blocks),
    actions: {
      setTitle: legacyState.setTitle,
      setExcerpt: legacyState.setExcerpt,
      setBlocks: legacyState.setBlocks,
      addBlock: legacyState.addBlock,
      updateBlock: legacyState.updateBlock,
      replaceBlock: legacyState.replaceBlock,
      removeBlock: legacyState.removeBlock,
      moveBlock: legacyState.moveBlock,
      reorderBlocks: legacyState.reorderBlocks,
      splitBlock: legacyState.splitBlock,
      mergeWithPrevious: legacyState.mergeWithPrevious,
      saveArticle: legacyState.saveArticle,
      loadArticle: legacyState.loadArticle,
      reset: legacyState.reset,
      setEditorMode: legacyState.setEditorMode,
      toggleSidebar: legacyState.toggleSidebar,
      toggleFocusMode: legacyState.toggleFocusMode,
      setActiveTab: legacyState.setActiveTab,
      setActiveBlockId: legacyState.setActiveBlockId,
    },
  }
}

export function useEditorFacade() {
  const documentState = useEditorDocumentStore()
  const uiState = useEditorUiStore()
  const workflowState = useEditorWorkflowStore()
  const sessionState = useEditorSessionStore()
  const legacyState = useEditorStore()

  return useMemo(() => {
    const editorMode = mapLegacyEditorMode(legacyState.editorMode)

    return {
      ...documentState,
      ...uiState,
      ...workflowState,
      ...sessionState,
      editorMode,
      activeBlock: getActiveBlock(documentState.blocks, uiState.activeBlockId),
      textBlocks: getTextBlocks(documentState.blocks),
      nonTextBlocks: getNonTextBlocks(documentState.blocks),
      isDocumentEmpty: isDocumentEmpty(documentState.blocks),
      actions: {
        setTitle: legacyState.setTitle,
        setExcerpt: legacyState.setExcerpt,
        setBlocks: legacyState.setBlocks,
        addBlock: legacyState.addBlock,
        updateBlock: legacyState.updateBlock,
        replaceBlock: legacyState.replaceBlock,
        removeBlock: legacyState.removeBlock,
        moveBlock: legacyState.moveBlock,
        reorderBlocks: legacyState.reorderBlocks,
        splitBlock: legacyState.splitBlock,
        mergeWithPrevious: legacyState.mergeWithPrevious,
        saveArticle: legacyState.saveArticle,
        loadArticle: legacyState.loadArticle,
        reset: legacyState.reset,
        setEditorMode: legacyState.setEditorMode,
        toggleSidebar: legacyState.toggleSidebar,
        toggleFocusMode: legacyState.toggleFocusMode,
        setActiveTab: legacyState.setActiveTab,
        setActiveBlockId: legacyState.setActiveBlockId,
      },
    }
  }, [documentState, uiState, workflowState, sessionState, legacyState])
}

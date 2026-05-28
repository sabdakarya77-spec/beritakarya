'use client'

import { ReactNode } from 'react'
import { cn } from '../../../lib/utils'
import { useEditorStore } from '../../../store/editorStore'
import { EditorTopbar } from './EditorTopbar'
import { EditorialSidebar } from '../EditorialSidebar'
import { EditorStatusNotice } from '../EditorStatusNotice'

interface ArticleEditorShellProps {
  children: ReactNode
  isFocusMode: boolean
  isLoading?: boolean
  saveError?: string | null
}

/**
 * Shared shell for the article editor, used by both GridBlock and WordPress modes.
 * Controls layout (sidebar space, focus mode padding) and renders topbar + sidebar.
 */
export function ArticleEditorShell({ 
  children, 
  isFocusMode, 
  isLoading, 
  saveError 
}: ArticleEditorShellProps) {
  const { isSidebarOpen } = useEditorStore()

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 [--editor-shell-offset:0px] md:[--editor-shell-offset:16rem]",
      isFocusMode && "md:[--editor-shell-offset:0px]",
      isFocusMode ? "bg-white dark:bg-slate-950" : "bg-gray-50/40 dark:bg-slate-950"
    )}>
      <EditorTopbar />

      <main className={cn(
        "mx-auto w-full max-w-6xl px-4 pb-40 transition-all duration-700 ease-in-out sm:px-6 lg:max-w-7xl lg:px-8 xl:max-w-[92rem] 2xl:max-w-[110rem]",
        !isFocusMode && isSidebarOpen && "lg:max-w-[88rem] lg:px-8 lg:pr-[25rem] xl:max-w-[100rem] xl:pr-[24rem] 2xl:max-w-[122rem] 2xl:pr-[25.5rem]",
        isFocusMode ? "pt-24 opacity-100 scale-100" : "pt-[5.5rem] sm:pt-24 lg:pt-[5.75rem] opacity-100"
      )}>
        <EditorStatusNotice isLoading={isLoading} saveError={saveError} />

        {children}
      </main>

      {!isFocusMode && (
        <EditorialSidebar />
      )}
    </div>
  )
}
'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { useEditorStore } from '../../store/editorStore'
import { EditorTopbar } from './EditorTopbar'
import { EditorialSidebar } from './EditorialSidebar'
import { EditorStatusNotice } from './EditorStatusNotice'

interface ArticleEditorShellProps {
  children: ReactNode
  isFocusMode: boolean
  isLoading?: boolean
  saveError?: string | null
}

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
        "mx-auto w-full max-w-5xl px-4 pb-40 transition-all duration-700 ease-in-out sm:px-6 lg:px-8",
        !isFocusMode && isSidebarOpen && "xl:max-w-7xl xl:pr-[24rem]",
        isFocusMode ? "pt-24 opacity-100 scale-100" : "pt-28 opacity-100"
      )}>
        <EditorStatusNotice isLoading={isLoading} saveError={saveError} />

        {children}
      </main>

      {!isFocusMode && (
        <>
          <EditorialSidebar />
        </>
      )}
    </div>
  )
}

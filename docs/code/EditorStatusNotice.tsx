import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EditorStatusNoticeProps {
  isLoading?: boolean
  saveError?: string | null
}

export function EditorStatusNotice({ isLoading, saveError }: EditorStatusNoticeProps) {
  if (!isLoading && !saveError) return null

  return (
    <div className="mb-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      {isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
            <Loader2 size={16} className="animate-spin" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Memuat artikel</p>
            <p className="text-xs text-gray-400">Menyiapkan kanvas dan metadata untuk Anda...</p>
          </div>
        </div>
      )}
      
      {saveError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm backdrop-blur-md dark:border-red-500/10 dark:bg-red-950/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm dark:bg-slate-900">
            <AlertCircle size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">Gagal menyimpan</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">{saveError}</p>
          </div>
        </div>
      )}
    </div>
  )
}

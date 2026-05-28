import { History, RotateCcw } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { InspectorSection } from './InspectorSection'

interface VersionItem {
  id: string
  version: number
  title: string
  createdAt: string
}

interface HistorySectionProps {
  articleId: string
  versions: VersionItem[]
  loadingVersions: boolean
  loadVersions: () => void
  restoreVersion: (versionId: string) => void
}

export function HistorySection({
  articleId,
  versions,
  loadingVersions,
  loadVersions,
  restoreVersion
}: HistorySectionProps) {
  return (
    <InspectorSection
      eyebrow="Riwayat"
      title="Versi Artikel"
      description="Pantau perubahan penting dan pulihkan versi sebelumnya bila diperlukan."
      action={articleId ? (
        <button
          onClick={loadVersions}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Muat ulang riwayat versi"
        >
          <RotateCcw size={14} className={cn(loadingVersions && 'animate-spin')} />
        </button>
      ) : null}
    >
      {loadingVersions ? (
        <div className="py-16 text-center text-gray-400">
          <RotateCcw size={24} className="mx-auto mb-3 animate-spin opacity-30" />
          <p className="text-xs font-semibold">Memuat riwayat versi...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-white/10">
          <History size={28} className="mx-auto mb-3 text-gray-300 dark:text-white/10" />
          <p className="text-sm font-semibold text-brand-black dark:text-white">Belum ada riwayat versi.</p>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Versi baru biasanya tercatat saat artikel disubmit atau diterbitkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className="rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4 transition-colors hover:border-brand-red/30 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-brand-red/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                    v{version.version}
                  </span>
                  <h4 className="mt-3 text-sm font-semibold text-brand-black dark:text-white">
                    {version.title || 'Tanpa judul'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {new Date(version.createdAt).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <button
                onClick={() => restoreVersion(version.id)}
                className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-red transition-colors hover:border-brand-red/30 dark:border-white/10 dark:bg-slate-900"
              >
                Pulihkan versi ini
              </button>
            </div>
          ))}
        </div>
      )}
    </InspectorSection>
  )
}

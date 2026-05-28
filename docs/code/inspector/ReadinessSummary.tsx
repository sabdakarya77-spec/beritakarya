import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function ReadinessSummary({
  completionScore,
  missingRequirements
}: {
  completionScore: number
  missingRequirements: string[]
}) {
  const isReady = missingRequirements.length === 0

  return (
    <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            Readiness
          </p>
          <h4 className="mt-1 text-sm font-semibold text-brand-black dark:text-white">
            {isReady ? 'Artikel siap masuk workflow berikutnya' : 'Masih ada elemen yang perlu dilengkapi'}
          </h4>
        </div>
        <div className={cn(
          'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]',
          isReady ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
        )}>
          {completionScore}%
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-brand-red transition-all" style={{ width: `${completionScore}%` }} />
      </div>

      <div className="mt-4 space-y-2">
        {missingRequirements.length > 0 ? missingRequirements.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-brand-red" />
            {item}
          </div>
        )) : (
          <div className="flex items-start gap-2 text-xs leading-5 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            Semua syarat dasar editorial sudah terisi.
          </div>
        )}
      </div>
    </section>
  )
}

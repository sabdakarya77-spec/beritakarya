import { Award, ShieldAlert, Star } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { InspectorSection } from './InspectorSection'

interface WorkflowSectionProps {
  isBreaking: boolean
  isExclusive: boolean
  isFeatured: boolean
  updateArticleData: (data: any) => void
}

export function WorkflowSection({
  isBreaking,
  isExclusive,
  isFeatured,
  updateArticleData
}: WorkflowSectionProps) {
  const items = [
    {
      id: 'isBreaking',
      value: isBreaking,
      label: 'Breaking News',
      description: 'Dorong artikel sebagai berita paling mendesak.',
      icon: ShieldAlert,
      tone: 'text-red-500'
    },
    {
      id: 'isExclusive',
      value: isExclusive,
      label: 'Eksklusif',
      description: 'Tandai artikel dengan nilai liputan khusus.',
      icon: Award,
      tone: 'text-violet-500'
    },
    {
      id: 'isFeatured',
      value: isFeatured,
      label: 'Headline',
      description: 'Siapkan artikel untuk slot utama halaman depan.',
      icon: Star,
      tone: 'text-amber-500'
    }
  ]

  return (
    <InspectorSection
      eyebrow="Workflow"
      title="Kelengkapan Editorial"
      description="Lengkapi elemen inti sebelum artikel masuk ke jalur review."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => updateArticleData({ [item.id]: !item.value })}
            className={cn(
              'flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all',
              item.value
                ? 'border-brand-red/20 bg-brand-red/[0.04] dark:border-brand-red/20 dark:bg-brand-red/[0.06]'
                : 'border-gray-200/80 bg-gray-50/70 dark:border-white/10 dark:bg-slate-950/40'
            )}
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                <item.icon size={18} className={cn(item.value ? item.tone : 'text-gray-400')} />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-black dark:text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
            <span
              className={cn(
                'mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em]',
                item.value
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
              )}
            >
              {item.value ? 'Aktif' : 'Nonaktif'}
            </span>
          </button>
        ))}
      </div>
    </InspectorSection>
  )
}

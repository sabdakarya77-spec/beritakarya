import { LEGAL_DOCUMENT_EYEBROW, formatLegalRichContent } from '../../lib/legalPages'
import { legalProseClassName } from './legalStyles'

type LegalDocumentBodyProps = {
  title: string
  content: string | null | undefined
  siteName: string
  emptyMessage?: string
  eyebrow?: string
  /** Smaller prose for nested sections (e.g. ads terms footer) */
  proseSize?: 'default' | 'compact'
}

export function LegalDocumentBody({
  title,
  content,
  siteName,
  emptyMessage,
  eyebrow = LEGAL_DOCUMENT_EYEBROW,
  proseSize = 'default',
}: LegalDocumentBodyProps) {
  const proseClass =
    proseSize === 'compact'
      ? 'prose prose-sm md:prose-base dark:prose-invert max-w-none'
      : legalProseClassName

  const fallbackEmpty =
    emptyMessage ??
    `Konten belum tersedia untuk halaman ini. Silakan hubungi redaksi ${siteName} untuk informasi lebih lanjut.`

  return (
    <section className="border-t border-black/5 dark:border-white/5 pt-10 md:pt-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-brand-red" aria-hidden />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-red">
                {eyebrow}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-black dark:text-white tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        {content ? (
          <div className={proseClass}>
            <div
              className="text-brand-text-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatLegalRichContent(content) }}
            />
          </div>
        ) : (
          <div className="bg-brand-surface dark:bg-white/[0.02] border border-dashed border-black/5 dark:border-white/10 p-12 text-center rounded-2xl">
            <p className="text-brand-text-muted italic text-sm">{fallbackEmpty}</p>
          </div>
        )}
      </div>
    </section>
  )
}

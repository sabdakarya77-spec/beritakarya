import type { PublicSiteConfig } from '../../lib/siteSettings'
import { PublicInfoShell } from '../layout/PublicInfoShell'
import { LegalPageHeader } from './LegalPageHeader'
import { LegalDocumentBody } from './LegalDocumentBody'
import { LegalPageIntro } from './LegalPageIntro'
import { LEGAL_DOCUMENT_EYEBROW } from '../../lib/legalPages'

export type LegalStandardPageProps = {
  siteConfig: PublicSiteConfig
  title: string
  intro: string
  content: string | null | undefined
  emptyMessage?: string
}

/**
 * Shared layout for public legal/information pages (privacy, terms, about, etc.).
 */
export function LegalStandardPage({
  siteConfig,
  title,
  intro,
  content,
  emptyMessage,
}: LegalStandardPageProps) {
  return (
    <PublicInfoShell siteConfig={siteConfig}>
      <div className="space-y-10 md:space-y-12">
        <LegalPageHeader title={title} />
        
        {intro && <LegalPageIntro text={intro} />}

        <div className="border-t border-black/5 dark:border-white/5 pt-10 md:pt-12">
          <LegalDocumentBody
            pageTitle={title}
            eyebrow={LEGAL_DOCUMENT_EYEBROW}
            sectionTitle={title}
            intro={intro}
            content={content}
            siteName={siteConfig.name}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </PublicInfoShell>
  )
}

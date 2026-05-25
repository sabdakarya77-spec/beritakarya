import type { PublicSiteConfig } from '../../lib/siteSettings'
import { PublicInfoShell } from '../layout/PublicInfoShell'
import { LegalPageHeader } from './LegalPageHeader'
import { LegalPageIntro } from './LegalPageIntro'
import { LegalDocumentBody } from './LegalDocumentBody'

export type LegalStandardPageProps = {
  siteConfig: PublicSiteConfig
  title: string
  intro: string
  content: string | null | undefined
  /** Heading inside document section; defaults to `title` */
  documentTitle?: string
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
  documentTitle,
  emptyMessage,
}: LegalStandardPageProps) {
  return (
    <PublicInfoShell siteConfig={siteConfig}>
      <LegalPageHeader title={title} />
      <div className="space-y-10 md:space-y-12">
        <LegalPageIntro text={intro} />
        <LegalDocumentBody
          title={documentTitle ?? title}
          content={content}
          siteName={siteConfig.name}
          emptyMessage={emptyMessage}
        />
      </div>
    </PublicInfoShell>
  )
}

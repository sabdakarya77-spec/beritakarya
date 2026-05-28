import { sanitizeRichText } from './sanitizeRichText'

interface RenderRichTextProps {
  html: string | null | undefined
  className?: string
}

export function RenderRichText({ html, className }: RenderRichTextProps) {
  const safeHtml = sanitizeRichText(html ?? '')
  return <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />
}

import { sanitizeRichText } from './sanitizeRichText'

export function serializeRichText(html: string | null | undefined): string {
  return sanitizeRichText(html ?? '')
}

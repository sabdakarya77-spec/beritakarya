const SCRIPT_TAG_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>/gi
const EVENT_HANDLER_PATTERN = / on\w+="[^"]*"/gi

export function sanitizeRichText(html: string): string {
  return html
    .replace(SCRIPT_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .trim()
}

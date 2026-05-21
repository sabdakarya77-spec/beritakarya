const MAX_BLOCKS = 200
const MAX_WORDS = 100_000

export function extractTextFromBlocks(blocks: any[] | undefined): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((b) => b?.type === 'paragraph' || b?.type === 'heading')
    .map((b) => (typeof b.content === 'string' ? b.content : ''))
    .join(' ')
    .trim()
}

export function countWords(text: string): number {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

export function buildMetaDescriptionExcerpt(blocks: any[] | undefined, maxLen = 160): string {
  const text = extractTextFromBlocks(blocks)
  if (!text) return ''
  return text.length <= maxLen ? text : `${text.slice(0, maxLen - 3).trim()}...`
}

export function validateArticleContentLimits(blocks?: any[]): void {
  if (!blocks) return
  if (blocks.length > MAX_BLOCKS) {
    throw Object.assign(
      new Error(`Maksimal ${MAX_BLOCKS} blok konten per artikel`),
      { statusCode: 400 }
    )
  }
  const words = countWords(extractTextFromBlocks(blocks))
  if (words > MAX_WORDS) {
    throw Object.assign(
      new Error(`Konten melebihi batas ${MAX_WORDS.toLocaleString('id-ID')} kata`),
      { statusCode: 400 }
    )
  }
}

export function applySeoDefaults<T extends { title: string; blocks?: any[]; metaDescription?: string }>(
  input: T
): T & { metaDescription?: string } {
  if (input.metaDescription?.trim()) return input
  const excerpt = buildMetaDescriptionExcerpt(input.blocks)
  if (!excerpt) return input
  return { ...input, metaDescription: excerpt }
}

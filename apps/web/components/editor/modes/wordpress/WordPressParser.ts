/**
 * WordPressParser — Parse DOM/HTML content with a strict whitelist.
 *
 * This parser is used by the WordPress mode to convert raw HTML
 * from the contentEditable into structured instructions for the
 * command layer. It only allows a limited set of tags that map
 * cleanly to canonical block types.
 */

export interface WordPressParsedNode {
  tag: string
  html: string
  blockId?: string
  attributes?: Record<string, string>
}

/** Tags that are legal in WordPress mode output */
const WHITELIST_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li',
  'br', 'b', 'strong', 'i', 'em', 'u', 's', 'a', 'span',
])

/** Tags that map to top-level block containers */
const BLOCK_CONTAINER_TAGS = new Set(['p', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol'])

/**
 * Parse inner HTML of the WordPress continuous editor into
 * an array of parsed nodes. Each top-level block container
 * becomes a separate node.
 *
 * Non-whitelist tags are stripped (contents preserved) for safety.
 */
export function parseWordPressHtml(html: string): WordPressParsedNode[] {
  if (!html.trim()) return []

  const doc = new DOMParser().parseFromString(
    `<div id="wp-root">${html}</div>`,
    'text/html'
  )
  const root = doc.getElementById('wp-root')
  if (!root) return []

  const nodes: WordPressParsedNode[] = []

  for (const child of Array.from(root.children)) {
    const el = child as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (BLOCK_CONTAINER_TAGS.has(tag)) {
      const blockId = el.dataset.blockId
      const attributes: Record<string, string> = {}
      if (tag === 'a') {
        const href = el.getAttribute('href')
        if (href) attributes.href = href
      }

      // Sanitize inner HTML to only whitelist tags
      const sanitized = sanitizeNode(el)

      nodes.push({
        tag,
        html: sanitized,
        blockId,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      })
    } else if (tag === 'div' && child.children.length > 0) {
      // If the browser inserted a <div> wrapper, look for block containers inside
      for (const innerChild of Array.from(child.children)) {
        const innerEl = innerChild as HTMLElement
        const innerTag = innerEl.tagName.toLowerCase()
        if (BLOCK_CONTAINER_TAGS.has(innerTag)) {
          const blockId = innerEl.dataset.blockId
          nodes.push({
            tag: innerTag,
            html: sanitizeNode(innerEl),
            blockId,
          })
        } else {
          // Treat wrapped text as paragraph
          nodes.push({
            tag: 'p',
            html: sanitizeNode(innerEl),
          })
        }
      }
    } else if (tag === 'br') {
      // Standalone <br> → empty paragraph
      nodes.push({ tag: 'p', html: '' })
    } else {
      // Any other element → treat as paragraph
      nodes.push({
        tag: 'p',
        html: sanitizeNode(el),
      })
    }
  }

  // Merge consecutive <p> nodes with the same blockId
  return mergeConsecutiveParagraphs(nodes)
}

/**
 * Recursively sanitize an HTML node, removing non-whitelist tags
 * while preserving their text content.
 */
function sanitizeNode(el: HTMLElement): string {
  const allowedInline = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'a', 'span', 'br'])

  // If it's a text node, return as-is
  // (we use cloning, not walking text nodes directly)
  const clone = el.cloneNode(true) as HTMLElement
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT, null)
  const nodesToUnwrap: Node[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as HTMLElement
    const tag = node.tagName.toLowerCase()

    if (!allowedInline.has(tag) && !BLOCK_CONTAINER_TAGS.has(tag)) {
      nodesToUnwrap.push(node)
    }
  }

  for (const node of nodesToUnwrap) {
    const parent = node.parentNode
    if (parent) {
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node)
      }
      parent.removeChild(node)
    }
  }

  return clone.innerHTML
}

/**
 * Merge consecutive <p> nodes that share the same blockId.
 * This keeps sync stable when a paragraph hasn't been split yet.
 */
function mergeConsecutiveParagraphs(nodes: WordPressParsedNode[]): WordPressParsedNode[] {
  if (nodes.length <= 1) return nodes

  const result: WordPressParsedNode[] = []
  let i = 0

  while (i < nodes.length) {
    const current = nodes[i]

    if (current.tag === 'p' && current.blockId && i + 1 < nodes.length) {
      const next = nodes[i + 1]
      if (next.tag === 'p' && next.blockId === current.blockId) {
        // Merge: concatenate HTML content
        result.push({
          ...current,
          html: `${current.html}\n${next.html}`,
        })
        i += 2
        continue
      }
    }

    result.push(current)
    i++
  }

  return result
}
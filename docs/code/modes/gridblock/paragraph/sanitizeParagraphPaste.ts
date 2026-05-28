/**
 * sanitizeParagraphPaste — Sanitize pasted HTML/text for paragraph block.
 *
 * Hanya mengizinkan inline formatting tags: b, strong, i, em, u, s, a, span, br.
 * Semua tag block-level di-strip (hanya konten teks yang dipertahankan).
 */
export function sanitizeParagraphPaste(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const allowedTags = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'a', 'br', 'span'])
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null)
  const nodesToRemove: Node[] = []

  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement
    const tagName = el.tagName.toLowerCase()

    if (tagName === 'a') {
      const href = el.getAttribute('href')
      while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name)
      if (href) el.setAttribute('href', href)
      continue
    }

    if (tagName === 'span') {
      const style = el.getAttribute('style') || ''
      const allowedStyles = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration']
      const cleanedStyles = style.split(';')
        .map(s => s.trim())
        .filter(s => {
          const prop = s.split(':')[0]?.trim().toLowerCase()
          return prop && allowedStyles.some(allowed => prop.startsWith(allowed))
        })
        .join('; ')
      el.removeAttribute('style')
      if (cleanedStyles) el.setAttribute('style', cleanedStyles)
      const attrsToRemove: string[] = []
      for (let i = 0; i < el.attributes.length; i++) {
        const name = el.attributes[i].name
        if (name !== 'style') attrsToRemove.push(name)
      }
      attrsToRemove.forEach(name => el.removeAttribute(name))
      continue
    }

    if (allowedTags.has(tagName)) {
      while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name)
      continue
    }

    nodesToRemove.push(el)
  }

  for (const node of nodesToRemove) {
    const parent = node.parentNode
    if (parent) {
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node)
      }
      parent.removeChild(node)
    }
  }

  return doc.body.innerHTML
}
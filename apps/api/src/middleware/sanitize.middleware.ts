import { Request, Response, NextFunction } from 'express'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

const { window } = new JSDOM('')
const purify = DOMPurify(window as any)

// Hook: hanya izinkan properti CSS text-align pada atribut style
// Ini mencegah CSS injection (expression(), javascript:, dll) sambil
// tetap mempertahankan perataan teks (center/right/justify) dari editor.
purify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') {
    const raw = data.attrValue || ''
    // Ekstrak hanya nilai text-align yang valid
    const match = raw.match(/text-align\s*:\s*(left|center|right|justify)/i)
    if (match) {
      data.attrValue = `text-align: ${match[1].toLowerCase()}`
    } else {
      data.attrValue = ''
    }
  }
})

// Config: izinkan tag sederhana untuk rich text legal/settings
// 'style' diizinkan tetapi dibatasi hanya text-align via hook di atas
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'a', 'br', 'p', 'div', 'h2', 'h3', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'align', 'style'],
  FORCE_BODY: true
}

function sanitizeValue(value: any, key?: string, parentKey?: string): any {
  // Jangan sanitize field password atau email untuk mencegah kerusakan data kredensial
  if (key === 'password' || key === 'email') {
    return value
  }

  // [FIX] Jangan sanitize field "blocks" — konten blok artikel berisi HTML rich-text
  // yang sudah divalidasi secara ketat oleh Zod schema (article.validator.ts).
  // DOMPurify dengan ALLOWED_TAGS terbatas akan menghapus tag valid seperti
  // <h1>, <h4>-<h6>, <code>, <mark>, <s>, <blockquote>, <cite>, <img>, dll.,
  // serta dapat merusak atribut data-* pada custom block types (embed, callout, dll.),
  // menyebabkan konten paragraf / blok hilang saat disimpan ke database.
  if (key === 'blocks' || parentKey === 'blocks') {
    return value
  }

  if (typeof value === 'string') {
    return purify.sanitize(value, PURIFY_CONFIG)
  }
  if (Array.isArray(value)) {
    return value.map(v => sanitizeValue(v, undefined, key))
  }
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      result[k] = sanitizeValue(v, k, parentKey)
    }
    return result
  }
  return value
}

/**
 * Middleware untuk membersihkan input HTML dari request body
 * Mencegah XSS dengan membatasi tag yang diizinkan
 */
export function sanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.body) {
    req.body = sanitizeValue(req.body)
  }
  next()
}

import { describe, it, expect } from 'vitest'
import { prepareLegalDocumentContent } from './legalPages'

describe('prepareLegalDocumentContent', () => {
  it('menghapus heading CMS yang mengulang judul halaman', () => {
    const html = prepareLegalDocumentContent(
      '<h2>Kebijakan Privasi</h2><p>Isi kebijakan yang sebenarnya.</p>',
      { pageTitle: 'Kebijakan Privasi', intro: 'Penjelasan singkat.' }
    )
    expect(html).not.toMatch(/<h2>\s*Kebijakan Privasi/i)
    expect(html).toContain('Isi kebijakan yang sebenarnya')
  })

  it('menghapus paragraf pembuka yang mengulang intro statis', () => {
    const intro =
      'Penjelasan mengenai bagaimana portal mengumpulkan data pengguna.'
    const html = prepareLegalDocumentContent(
      `<p>${intro}</p><p>Klausul pertama yang unik.</p>`,
      { pageTitle: 'Kebijakan Privasi', intro }
    )
    expect(html).not.toContain(intro)
    expect(html).toContain('Klausul pertama yang unik')
  })
})

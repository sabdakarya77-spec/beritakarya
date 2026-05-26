import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { sanitizeMiddleware } from '../middleware/sanitize.middleware'
import { securityHeadersMiddleware } from '../middleware/security.middleware'
import { errorMiddleware } from '../middleware/error.middleware'

const app = express()
app.use(express.json())
app.use(sanitizeMiddleware)
app.use(securityHeadersMiddleware)

app.post('/test', (req, res) => res.json({ body: req.body }))
app.get('/headers', (_, res) => res.json({ ok: true }))

app.use(errorMiddleware)

describe('sanitizeMiddleware — XSS prevention', () => {
  it('menghapus script tag dari string content', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<script>alert("xss")</script>Teks normal' })
    expect(res.body.body.content).not.toContain('<script>')
    expect(res.body.body.content).toContain('Teks normal')
  })

  it('menghapus event handler dari tag HTML', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<b onclick="steal()">Bold</b>' })
    expect(res.body.body.content).not.toContain('onclick')
    expect(res.body.body.content).toContain('Bold')
  })

  it('membersihkan XSS dalam array nested (blocks)', async () => {
    const res = await request(app)
      .post('/test')
      .send({
        blocks: [
          { type: 'paragraph', content: '<img src=x onerror="xss()">Teks' }
        ]
      })
    expect(JSON.stringify(res.body)).not.toContain('onerror')
  })

  it('mempertahankan tag yang diizinkan (b, i, a)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<b>Tebal</b> dan <i>miring</i>' })
    expect(res.body.body.content).toContain('<b>Tebal</b>')
    expect(res.body.body.content).toContain('<i>miring</i>')
  })

  it('mempertahankan style text-align agar perataan teks di editor tidak hilang saat disimpan', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<p style="text-align: center;">Teks tengah</p>' })
    expect(res.body.body.content).toContain('text-align: center')
    expect(res.body.body.content).toContain('Teks tengah')
  })

  it('memblokir CSS berbahaya (expression, javascript) dalam atribut style', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<p style="background:url(javascript:alert(1))">Teks</p>' })
    expect(res.body.body.content).not.toContain('javascript')
    expect(res.body.body.content).not.toContain('expression')
    expect(res.body.body.content).toContain('Teks')
  })

  it('hanya mempertahankan text-align dan membuang properti CSS lain', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<p style="text-align: right; color: red; font-size: 99px;">Teks</p>' })
    expect(res.body.body.content).toContain('text-align: right')
    expect(res.body.body.content).not.toContain('color')
    expect(res.body.body.content).not.toContain('font-size')
  })
})

describe('securityHeadersMiddleware', () => {
  it('set X-Frame-Options: DENY', async () => {
    const res = await request(app).get('/headers')
    expect(res.headers['x-frame-options']).toBe('DENY')
  })

  it('set X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/headers')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('set Referrer-Policy', async () => {
    const res = await request(app).get('/headers')
    expect(res.headers['referrer-policy']).toBeDefined()
  })
})

# Rencana Implementasi: Peningkatan Canggih Asisten AI BeritaKarya (v3)

Rencana ini memaparkan langkah-langkah teknis untuk meningkatkan kecanggihan modul **Assist AI** di BeritaKarya. Kita akan menambahkan dua fitur jurnalisme tingkat lanjut yang sangat berharga bagi ruang redaksi:
1. **Voice/Transcript to Quote (Wawancara Kasar ke Blok Kutipan)**: Memotong waktu administratif jurnalis dengan memilah transkrip panjang menjadi kutipan bernilai berita tinggi.
2. **Objectivity & Ethics Audit (Audit Objektivitas & Kode Etik)**: Memastikan draf tulisan bebas dari bias subjektif, opini menghakimi, dan mematuhi Kode Etik Jurnalistik (KEJ).

---

## User Review Required

> [!IMPORTANT]
> **Alur Kerja Pengenalan AI & Batasan API**
> Kedua fitur baru ini akan menggunakan API OpenAI melalui model yang dipilih (`gpt-4o` / `gpt-4-turbo`). Kami telah menyesuaikan struktur estimasi token dan penanganan kuota yang sudah ada di sistem agar fitur baru ini tetap aman dari kebocoran anggaran API.

---

## Open Questions

> [!IMPORTANT]
> **Atribusi Narasumber Otomatis**
> AI akan mencoba mengekstrak nama narasumber dan jabatannya langsung dari teks transkrip wawancara. Namun, nama narasumber kadang tidak tertulis eksplisit di transkrip kasar. Apakah kita perlu menyediakan kolom input manual terpisah di samping hasil ekstraksi sebelum dimasukkan ke dalam kanvas?
> Jawab: Tidak perlu membuat kolom input manual

> [!IMPORTANT]
> **Penyorotan Kata Bias (Bias Highlight)**
> Untuk Audit Objektivitas, apakah Anda ingin AI menyajikan daftar kata bias secara terpisah di panel asisten, atau apakah kita perlu menandai/menyoroti kata-kata tersebut langsung di dalam draf tulisan secara visual?
> Jawab: Iya perlu menandai /  disorot secara visual langsung di teks editor kanvas (misalnya dengan garis bawah bergelombang kuning/merah layaknya Microsoft Word)

---

## Proposed Changes

### Komponen 1: Backend API (Express)

#### [MODIFY] [ai.controller.ts](file:///d:/beritakarya/apps/api/src/ai/ai.controller.ts)
Menambahkan endpoint baru di router AI:
* `POST /ai/transcript-to-quote`: Menangani pemilahan transkrip wawancara mentah.
* `POST /ai/objectivity`: Menangani audit objektivitas dan kepatuhan Kode Etik Jurnalistik.

```typescript
aiRouter.post('/transcript-to-quote', asyncHandler(async (req: Request, res: Response) => {
  const { transcript } = z.object({ transcript: z.string().min(20).max(10000) }).parse(req.body)
  const result = await withQuotaAndTracking(req, 'transcript-to-quote', () =>
    writeService.extractQuoteFromTranscript(transcript)
  )
  res.json(result)
}))

aiRouter.post('/objectivity', asyncHandler(async (req: Request, res: Response) => {
  const { text } = z.object({ text: z.string().min(50).max(10000) }).parse(req.body)
  const result = await withQuotaAndTracking(req, 'objectivity', () =>
    validateService.auditObjectivity(text)
  )
  res.json(result)
}))
```

#### [MODIFY] [write.service.ts](file:///d:/beritakarya/apps/api/src/ai/write.service.ts)
Mengimplementasikan fungsi ekstraksi transkrip di service penulisan menggunakan OpenAI:

```typescript
export interface ExtractedQuoteResult {
  quote: string
  attribution: string
  context: string
}

export async function extractQuoteFromTranscript(
  transcript: string
): Promise<AIResult<ExtractedQuoteResult>> {
  return callAI(async () => {
    const raw = await chatComplete(
      `Kamu adalah editor berita senior Indonesia.
Tugasmu adalah menganalisis transkrip wawancara kasar berikut dan mengekstrak SATU kutipan langsung (direct quote) paling menarik, bernilai berita tinggi, dan kuat secara emosi/fakta.
PENTING:
- Ekstrak nama narasumber dan jabatannya sebagai atribusi (misalnya: "Budi, Kepala Dinas Kesehatan"). Jika tidak ditemukan nama, gunakan "Narasumber".
- Tuliskan alasan/konteks mengapa kutipan ini penting dalam bagian 'context'.
Kembalikan HANYA JSON:
{
  "quote": "teks kutipan langsung tanpa tanda kutip",
  "attribution": "Nama Narasumber, Jabatan",
  "context": "konteks kutipan"
}`,
      `Transkrip wawancara:
"${transcript.slice(0, 8000)}"`
    )
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  })
}
```

#### [MODIFY] [validate.service.ts](file:///d:/beritakarya/apps/api/src/ai/validate.service.ts)
Mengimplementasikan fungsi audit objektivitas di service validasi:

```typescript
export interface BiasIssue {
  original: string
  suggested: string
  reason: string
  severity: 'low' | 'medium' | 'high'
}

export interface ObjectivityResult {
  score: number // 0-100 (100 = sangat objektif)
  issues: BiasIssue[]
  ethicalCompliance: string // Kepatuhan KEJ
  suggestions: string[]
}

export async function auditObjectivity(
  text: string
): Promise<AIResult<ObjectivityResult>> {
  return callAI(async () => {
    const raw = await chatComplete(
      `Kamu adalah Dewan Pers Indonesia dan Ombudsman media profesional.
Tugasmu adalah menganalisis draf berita dari segi objektivitas, netralitas, dan kepatuhan Kode Etik Jurnalistik (KEJ).
- Cari kata-kata bias, opini menghakimi, klaim tanpa atribusi, atau istilah emosional yang melanggar objektivitas.
- Berikan skor objektivitas (0-100).
- Berikan rekomendasi perbaikan kalimat alternatif.
Kembalikan HANYA JSON:
{
  "score": 85,
  "issues": [
    {
      "original": "kata/kalimat bias",
      "suggested": "kalimat objektif pengganti",
      "reason": "mengapa ini bias/melanggar aturan",
      "severity": "low"|"medium"|"high"
    }
  ],
  "ethicalCompliance": "Analisis singkat kepatuhan terhadap Kode Etik Jurnalistik (misal Pasal 1 atau Pasal 3).",
  "suggestions": ["Saran umum 1", "Saran umum 2"]
}`,
      `Teks berita:
"${text.slice(0, 3000)}"`,
      { temperature: 0.2 }
    )
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  })
}
```

---

### Komponen 2: Frontend Hooks & UI

#### [MODIFY] [useAI.ts](file:///d:/beritakarya/apps/web/hooks/useAI.ts)
Menambahkan dua hook baru untuk memanggil API backend di atas:

```typescript
export function useTranscriptToQuote(model?: string) {
  return useAIAction<
    { transcript: string },
    { quote: string; attribution: string; context: string }
  >('transcript-to-quote', { model })
}

export function useObjectivity(model?: string) {
  return useAIAction<
    { text: string },
    {
      score: number
      issues: { original: string; suggested: string; reason: string; severity: 'low' | 'medium' | 'high' }[]
      ethicalCompliance: string
      suggestions: string[]
    }
  >('objectivity', { model })
}
```

#### [MODIFY] [WriteTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/WriteTab.tsx)
Menambahkan bagian **"Voice/Transcript to Quote"** di bawah tombol bawaan. Penulis dapat menempel transkrip panjang, lalu mengklik tombol "Ekstrak Kutipan". Setelah diekstrak, terdapat tombol instan **"Terapkan Sebagai Blok Kutipan Baru"** yang secara otomatis menyisipkan blok `quote` ke kanvas editor melalui store.

#### [MODIFY] [ValidateTab.tsx](file:///d:/beritakarya/apps/web/components/editor/ai/ValidateTab.tsx)
Menambahkan modul **"Audit Objektivitas & Kode Etik"** di bawah modul Readability. Modul ini menyajikan visual dial/skor netralitas, kartu analisis Kode Etik Jurnalistik, dan pelabelan tingkat keparahan (*low, medium, high*) untuk setiap bias/opini yang terdeteksi.

---

## Verification Plan

### Manual Verification
1. **Pengujian Ekstraksi Transkrip**:
   - Buka tab **Tulis**, salin transkrip wawancara sepanjang 5 paragraf.
   - Klik **Ekstrak Kutipan** -> pastikan kutipan langsung dan nama tokoh terpisah dengan rapi.
   - Klik **Terapkan Sebagai Blok Baru** -> pastikan blok `quote` baru berhasil disisipkan di kanvas artikel pada posisi yang benar.
2. **Pengujian Audit Objektivitas**:
   - Salin draf artikel yang dipenuhi kata emosional (misal: "tersangka luar biasa bejat diduga kuat mencuri").
   - Jalankan **Cek Objektivitas** di tab **Validasi**.
   - Pastikan skor menurun (di bawah 50%) dan sistem memberikan label keparahan *High* pada klaim-klaim bias tersebut beserta alternatif penulisan netralnya.

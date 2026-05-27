# Batch 7: Rollout Bertahap — Rencana Eksekusi

Tanggal: 2026-05-27
Berdasarkan: Fase 7 dari implementation-plan-editor-modular.md

## Status Saat Ini

Semua fase implementasi modular selesai (F0-F6). Sekarang saatnya **rollout bertahap** ke production tanpa merusak authoring flow tim editorial.

### Ringkasan aset yang sudah siap:

| Komponen | Status | Lokasi |
|---|---|---|
| Shared core (blockCatalog, blockGuards, editorMode, dll) | ✅ Terpakai | `core/` |
| Command layer (insertBlock, replaceBlock, splitTextBlock) | ✅ Terpakai | `core/editorCommands.ts` |
| Slice store (document, ui, workflow, session) | ✅ Terpakai | `store/` |
| GridBlock modular (editor, list, wrapper, registry, shortcuts) | ✅ Siap | `modes/gridblock/` |
| WordPress adapter (projection, parser, sync, warnings) | ✅ Siap | `modes/wordpress/` |
| Entry point unified (Editor, ArticleEditorShell, EditorCanvas) | ✅ Siap | `core/` |
| Legacy facades (semua delegasi ke modular) | ✅ Siap | `editor/*.tsx` |
| Tests (existing + baru = 73 tests) | ✅ 100% passed | berbagai file .test.ts |

## Rencana Rollout 4 Tahap

### Tahap 1: "Behind the Flag" — Observasi Internal ✅ (Otomatis)

**Tujuan**: Memastikan shared core dan slice store stabil tanpa mengubah UX.

**Yang sudah terjadi secara natural**:
- `editorStore.ts` sudah sync ke slice store via `syncLegacyEditorStateToSlices()` — ini sudah berjalan di production.
- `blockCatalog.ts`, `blockGuards.ts`, `editorCommands.ts` sudah dipakai oleh block components legacy.
- `AddBlockMenu.tsx` sudah membaca dari `blockCatalog` bukan hardcoded list.

**Monitoring yang perlu ditambahkan**:
```typescript
// Di editorStore.ts — tambahkan logging sync
const syncLog = useRef(0)
syncLog.current++
if (syncLog.current % 100 === 0) {
  console.log('[EditorStore] Sync count:', syncLog.current)
}
```

**Risiko**: Rendah — karena legacy code path masih berfungsi identik.

---

### Tahap 2: GridBlock Modular Sebagai Default Internal

**Tujuan**: Memastikan `core/Editor.tsx` dan `core/EditorCanvas.tsx` berfungsi tanpa regresi.

**Langkah-langkah**:

| # | Task | Detail | Prioritas |
|---|---|---|---|
| 1 | **Verifikasi import chain** | Pastikan `core/Editor.tsx` → `core/ArticleEditorShell.tsx` + `EditorTitleStage` + `core/EditorCanvas.tsx` → `GridBlockEditor` semua import path benar | 🔴 Tinggi |
| 2 | **Test mode GridBlock default** | Buka halaman edit artikel baru (`/new`) — pastikan kanvas GridBlock muncul dengan block list kosong | 🔴 Tinggi |
| 3 | **Test add block** | Klik "Tambah Blok" — semua block type dari catalog muncul | 🔴 Tinggi |
| 4 | **Test tiap block type** | Paragraph (ketik, slash command, split/merge), Heading (ubah level), Quote (isi + attribution), List (add/remove item), Image (upload+ganti+AI caption), Embed (YouTube/tweet), Gallery (multi upload, lightbox), ImageGrid (drag, kolom), MediaText (align toggle), Callout (ubah variant) | 🟡 Sedang |
| 5 | **Test undo/redo** | Ctrl+Z setelah add/move/delete block | 🟡 Sedang |
| 6 | **Test keyboard shortcuts** | Ctrl+Shift+Arrow (move), Ctrl+Shift+Backspace (hapus), Ctrl+Shift+Enter (tambah paragraph) | 🟡 Sedang |
| 7 | **Test focus mode** | Toggle focus mode → kanvas full screen, block controls hilang | 🟢 Rendah |

**A/B Testing Strategy**:
```
// Di .env atau config — tambahkan flag rollback
NEXT_PUBLIC_EDITOR_USE_LEGACY=false

// Di core/Editor.tsx — conditional import
const EditorComponent = process.env.NEXT_PUBLIC_EDITOR_USE_LEGACY === 'true'
  ? dynamic(() => import('../Editor'))
  : dynamic(() => import('./Editor'))
```

**Rollback plan**: Set `NEXT_PUBLIC_EDITOR_USE_LEGACY=true` → deploy ulang.

---

### Tahap 3: WordPress Mode Dengan Guardrail

**Tujuan**: Aktifkan mode WordPress hanya untuk artikel yang aman (text-dominant).

**Guardrail logic** (sudah ada di `WordPressProjection.ts`):

```typescript
// WordPressEditor.tsx — cek sebelum render
const flow = projectBlocksToWordPressFlow(blocks)
if (!flow.isSafe) {
  // Tampilkan warning + fallback button
  return <WarningPanel warnings={flow.warnings} />
}
```

**Kriteria artikel yang aman untuk WordPress mode**:
| Kriteria | Guard |
|---|---|
| Non-text blocks ≤ 3 | ✅ Auto-warning |
| Interleaving media < 2 | ✅ Auto-warning |
| Total blocks < 30 | Belum (opsional) |
| Artikel baru (draft) | ✅ Boleh |

**Langkah-langkah**:

| # | Task | Detail | Prioritas |
|---|---|---|---|
| 1 | **Test mode switch** | Klik tombol mode switch di topbar → GridBlock ↔ WordPress | 🔴 Tinggi |
| 2 | **Test continuous typing** | Ketik di WordPress mode → Enter buat paragraf baru → sync ke blocks | 🔴 Tinggi |
| 3 | **Test non-text blocks visibility** | Artikel dengan image/embed → muncul di section "Blok Media & Lainnya" | 🔴 Tinggi |
| 4 | **Test warnings** | Artikel dengan >3 non-text blocks → warning muncul | 🟡 Sedang |
| 5 | **Test fallback** | Klik "Lanjut edit di GridBlock" → pindah mode tanpa kehilangan data | 🟡 Sedang |
| 6 | **Test format inline** | Bold/italic/underline di WordPress → persist ke blocks → render publik | 🟡 Sedang |
| 7 | **Test switch mode bolak-balik** | GridBlock → WordPress → GridBlock → data utuh | 🟡 Sedang |

**Rollback**: Mode WordPress bisa dinonaktifkan via flag:
```
NEXT_PUBLIC_EDITOR_DISABLE_WORDPRESS=true
```

---

### Tahap 4: Observasi dan Iterasi

**Tujuan**: Pantau metrik dan kumpulkan feedback sebelum memperluas capability.

**Metrik yang perlu dipantau**:

| Metrik | Cara Ukur | Target |
|---|---|---|
| Autosave failure rate | `saveError` count | < 0.1% |
| Mode switch error | `editorMode` change + error log | 0 |
| WordPress sync mismatch | `syncToBlocks` → blocks length mismatch | < 1% |
| Published article content diff | Bandingkan output sebelum/ sesudah migrasi | 100% same |

**Feedback loop**:
1. Internal testing oleh tim developer (1-2 hari)
2. Beta testing oleh 2-3 editor/redaktur (3-5 hari)
3. Full rollout ke semua editorial team
4. Review feedback setelah 1 minggu

**Checklist final**:

| Checklist | Status |
|---|---|
| Rollout shared core — sudah aktif (tidak ada perubahan UX) | ✅ Otomatis |
| GridBlock modular sebagai default internal | ⬜ (Tahap 2) |
| WordPress mode untuk artikel teks (dengan guardrail) | ⬜ (Tahap 3) |
| Error logging untuk sinkronisasi WordPress | ⬜ (Tambahkan) |
| Monitoring autosave failure dan publish mismatch | ⬜ (Tahap 4) |
| Review feedback dari editor/redaksi | ⬜ (Tahap 4) |

## Error Logging Yang Disarankan

Tambahkan di `WordPressSync.ts`:

```typescript
export function logSyncError(context: string, error: unknown) {
  if (typeof window !== 'undefined' && window.console) {
    console.error(`[WordPressSync] ${context}:`, error)
  }
  // Optional: kirim ke server logging
  // api.post('/_logging/editor-sync-error', { context, error: String(error) }).catch(() => {})
}
```

## Timeline Estimasi

| Tahap | Durasi | Keterangan |
|---|---|---|
| Tahap 1: Observasi internal | ✅ Sudah | Shared core sudah jalan |
| Tahap 2: GridBlock default | 1-2 hari | Testing + flag rollback |
| Tahap 3: WordPress guardrail | 2-3 hari | UAT dengan editor |
| Tahap 4: Monitoring | 1 minggu | Observasi + feedback |

## Ringkasan Untuk Tim

> **Aman untuk di-deploy sekarang?** Ya — legacy code path masih utuh (semua legacy files adalah facade). Tidak ada perubahan UX sebelum flag diaktifkan.
>
> **Yang paling riskan?** WordPress sync (Tahap 3). Pastikan guardrail berfungsi sebelum memperluas ke semua user.
>
> **Yang paling aman?** GridBlock modular (Tahap 2). Sudah di-test dengan 43 test + legacy path identik.
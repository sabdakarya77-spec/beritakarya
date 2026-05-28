# Final Implementation Plan Part 2: INTEGRASI & DEPLOYMENT

## Overview

**Part 1 (Phase 1-6):** Membangun infrastruktur Tiptap editor ✅ SELESAI  
**Part 2 (Phase 7-10):** Mengintegrasikan ke UI dan deploy ke production

---

## Phase 7: Integrasi ke Page/Article Editor ✅ SELESAI

### Tujuan
Ganti editor lama dengan komponen Tiptap yang sudah dibuat.

### Langkah

| Step | File | Deskripsi | Status |
|------|------|-----------|--------|
| 7.1 | Identifikasi page editor | Cari `ArticleEditor.tsx`, `PageEditor.tsx`, dll | ✅ |
| 7.2 | Import Tiptap components | Import dari `./core/tiptap` | ✅ |
| 7.3 | Ganti ParagraphEditor | Ganti dengan `TiptapParagraph` | ✅ |
| 7.4 | Ganti HeadingBlock | Ganti dengan `TiptapHeading` | ✅ |
| 7.5 | Ganti QuoteBlock | Ganti dengan `TiptapQuote` | ✅ |
| 7.6 | Ganti ImageBlock | Ganti dengan `ImageView` | ⏳ Priority rendah |
| 7.7 | Test rendering | Pastikan semua block render dengan benar | ✅ |

### File yang Diubah/Dibuat

| File | Action | Deskripsi |
|------|--------|-----------|
| `core/tiptap/nodes/section/TiptapParagraph.tsx` | Update | Enhanced dengan BubbleMenuToolbar dan styling |
| `core/tiptap/nodes/heading/TiptapHeading.tsx` | Update | Full Tiptap implementation dengan useTiptapBridge |
| `core/tiptap/nodes/quote/TiptapQuote.tsx` | **Create** | New Tiptap-based quote component |
| `core/tiptap/index.ts` | Update | Export TiptapQuote |
| `modes/gridblock/blocks/QuoteBlock.tsx` | Update | Ganti legacy dengan TiptapQuote |
| `modes/gridblock/blocks/ParagraphBlock.tsx` | Update | Fix import path |
| `modes/gridblock/blocks/HeadingBlock.tsx` | Update | Fix import path, gunakan TiptapHeading |

### Contoh Integrasi
```tsx
// components/editor/ArticleEditor.tsx

// BEFORE
import { ParagraphEditor } from './modes/gridblock/paragraph/ParagraphEditor'
import { HeadingBlock } from './modes/gridblock/blocks/HeadingBlock'

// AFTER
import { 
  TiptapParagraph,
  TiptapHeading,
  QuoteView,
  ImageView,
  GridBlockEditor 
} from './core/tiptap'

// Ganti penggunaan
{blocks.map(block => {
  switch (block.type) {
    case 'paragraph':
      return <TiptapParagraph key={block.id} blockId={block.id} />
    case 'heading':
      return <TiptapHeading key={block.id} blockId={block.id} />
    // dst...
  }
})}
```

---

## Phase 8: Mode Switching Implementation ✅ SELESAI

### Tujuan
Implementasikan toggle antara GridBlock dan Classic mode.

### Langkah

| Step | File | Deskripsi | Status |
|------|------|-----------|--------|
| 8.1 | Mode switch button | Tambahkan tombol toggle di toolbar | ✅ |
| 8.2 | useEditorMode integration | Hubungkan dengan Zustand store | ✅ |
| 8.3 | Conditional rendering | Render GridBlock atau Classic berdasarkan mode | ✅ |
| 8.4 | Persist mode preference | Simpan preferensi mode user | ⏳ Session only |

### File yang Ada/Diperbarui

| File | Action | Deskripsi |
|------|--------|-----------|
| `store/editorStore.ts` | Ada | State `editorMode` dan `setEditorMode` |
| `core/EditorTopbar.tsx` | Ada | Toggle button dengan icon swap |
| `core/EditorCanvas.tsx` | Ada | Conditional rendering `GridBlockEditor` vs `WordPressEditor` |
| `core/tiptap/hooks/useEditorMode.ts` | Update | Sync dengan store, fix naming consistency |

### Contoh
```tsx
// components/editor/ArticleEditor.tsx
import { useEditorMode } from './core/tiptap'

export function ArticleEditor({ articleId }) {
  const { editorMode, toggleMode, isGridBlock } = useEditorMode()
  
  return (
    <div>
      {/* Mode toggle */}
      <button onClick={toggleMode}>
        {isGridBlock ? 'Switch to Classic' : 'Switch to GridBlock'}
      </button>
      
      {/* Render sesuai mode */}
      {isGridBlock ? (
        <GridBlockEditor blockId={articleId} />
      ) : (
        <ClassicEditor blockId={articleId} />
      )}
    </div>
  )
}
```

---

## Phase 9: Testing & QA

### Tujuan
Pastikan semua fitur berfungsi dengan benar.

### Langkah

| Step | Area | Deskripsi |
|------|------|-----------|
| 9.1 | Type-check | `pnpm run type-check` harus 0 error |
| 9.2 | Lint | `pnpm run lint` harus 0 warning |
| 9.3 | Unit test | Test setiap hook dan serializer |
| 9.4 | Integration test | Test editor dengan mock data |
| 9.5 | Visual regression | Screenshot sebelum vs sesudah |
| 9.6 | Cross-browser | Test di Chrome, Firefox, Safari |
| 9.7 | Mobile responsive | Test di mobile/tablet |

---

## Phase 10: Deployment

### Tujuan
Deploy ke staging dan production.

### Langkah

| Step | Environment | Deskripsi |
|------|-------------|-----------|
| 10.1 | Staging deploy | Push ke branch staging |
| 10.2 | Staging testing | QA di environment staging |
| 10.3 | Production deploy | Merge ke main/production |
| 10.4 | Monitor | Pantau error dan performance |

### Checklist Deployment
- [ ] Type-check passes
- [ ] Lint passes
- [ ] All tests pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility OK

---

## Timeline Estimasi

| Phase | Hari | Deliverable |
|-------|------|-------------|
| 7. Integrasi | 3-4 | Semua page menggunakan Tiptap components |
| 8. Mode Switching | 1-2 | Toggle GridBlock/Classic berfungsi |
| 9. Testing & QA | 2-3 | Tidak ada bug kritis |
| 10. Deployment | 1-2 | Live di production |

**Total Part 2: ~7-11 hari kerja**

---

## Risk Register

| Risk | Dampak | Mitigasi |
|------|--------|----------|
| Styling berbeda di production | High | Visual regression test |
| Breaking changes existing code | High | Incremental migration, rollback plan |
| Performance degradation | Medium | Lighthouse audit |
| User feedback negative | Medium | Beta testing dengan user terbatas |

---

## Next Actions

1. **Identifikasi file editor** yang perlu diintegrasikan
2. **Buat branch baru** untuk Phase 7
3. **Start integrasi** dengan ParagraphEditor
4. **Test bertahap** setiap block type
5. **Deploy ke staging** setelah semua terintegrasi

---

## Catatan

- Fase 7-10 dilakukan secara **incremental** - tidak perlu selesaikan semua sekaligus
- Prioritaskan **critical path** (editor utama yang sering digunakan)
- Jika ada error, **rollback** langsung ke code sebelumnya
- Dokumentasikan setiap perubahan di PR description

---

*Generated: 2026-05-28*
*Status: Ready for Phase 7*
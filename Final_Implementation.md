# Final Implementation Plan: Migrasi Editor ke Tiptap

## 1. Kesimpulan & Keputusan

**Pilihan Editor:** **Tiptap** ✅

### Kenapa Tiptap?

| Kriteria | Tiptap | Editor.js | Gutenberg |
|----------|--------|-----------|-----------|
| Cocok dengan block-based architecture existing | ✅ Ya | ❌ Data model fixed | ❌ Terlalu WP-centric |
| Incremental migration (per-blok) | ✅ Bisa | ❌ Harus rewrite | ❌ Total rewrite |
| Block-based mode (GridBlock) | ✅ Native ProseMirror nodes | ⚠️ Terbatas | ⚠️ WP-specific |
| Continuous writing mode (Classic/WP) | ✅ Native StarterKit | ❌ Tidak didesain untuk ini | ❌ Tidak didesain untuk ini |
| Custom blocks (imageGrid, mediaText, callout) | ✅ Custom Node extension | ❌ Schema rigid | ❌ React-specific |
| Bundle size | ~80KB | ~100KB | ~500KB+ |
| Komunitas mature & aktif | ✅ Sangat aktif | ⚠️ Kurang update | ⚠️ WP-specific |
| Menyelesaikan masalah contentEditable | ✅ Ya, ProseMirror handle semua | ❌ Masih manual | ✅ |

### Memahami 2 Mode Editor

| Aspek | GridBlock Mode | Classic Mode (d/h "WordPress") |
|-------|---------------|-------------------------------|
| Target user | User BeritaKarya | User yang nyaman continuous writing |
| UX Style | Block-based, drag-drop, slash command | Continuous writing, familiar seperti Classic Editor |
| Block types lengkap | ✅ Paragraph, Heading, Image, Gallery, ImageGrid, Embed, Callout, MediaText, Quote, List | ✅ Paragraph, Heading, Quote, List (lebih sederhana) |
| Rich text feature | ✅ Bold, italic, underline, link, text-align, code | ✅ Bold, italic, underline, link |
| Spesial feature | Slash command, drag handle, bubble menu, inline toolbar | Minimal toolbar |
| Keduanya pakai Tiptap | ✅ Ya | ✅ Ya |

---

## 2. Struktur Folder Final (Disepakati)

```
apps/web/components/editor/core/tiptap/
|
+-- provider/
|   +-- TiptapProvider.tsx          # Context provider Tiptap + shared state
|
+-- modes/
|   +-- gridblock/
|   |   +-- gridblockExtensions.ts     # Daftar extension untuk GridBlock mode
|   |   +-- GridBlockEditor.tsx        # Editor shell untuk GridBlock
|   |   +-- GridBlockToolbar.tsx       # Toolbar spesifik GridBlock
|   |   +-- GridBlockSlashMenu.tsx     # Slash command UI
|   |
|   +-- classic/
|       +-- classicExtensions.ts       # Daftar extension untuk Classic mode
|       +-- ClassicEditor.tsx          # Editor shell untuk Classic
|       +-- ClassicToolbar.tsx         # Toolbar minimal Classic
|
+-- nodes/                         # Custom Tiptap Node definitions
|   +-- paragraph/
|   |   +-- TiptapParagraph.tsx       # React component wrapper
|   |   +-- ParagraphNode.ts          # Tiptap Node definition
|   |   +-- ParagraphView.tsx         # Custom NodeView
|   |
|   +-- heading/
|   |   +-- TiptapHeading.tsx
|   |   +-- HeadingNode.ts
|   |   +-- HeadingView.tsx
|   |
|   +-- image/
|   |   +-- ImageNode.ts
|   |   +-- ImageView.tsx
|   |   +-- ImageToolbar.tsx
|   |
|   +-- image-grid/                   # PRIORITAS RENDAH (Fase 2)
|   |   +-- ImageGridNode.ts
|   |   +-- ImageGridView.tsx
|   |   +-- ImageGridToolbar.tsx
|   |
|   +-- media-text/                   # PRIORITAS RENDAH (Fase 2)
|   |   +-- MediaTextNode.ts
|   |   +-- MediaTextView.tsx
|   |   +-- MediaTextToolbar.tsx
|   |
|   +-- callout/                      # PRIORITAS RENDAH (Fase 2)
|   |   +-- CalloutNode.ts
|   |   +-- CalloutView.tsx
|   |   +-- CalloutToolbar.tsx
|   |
|   +-- quote/
|       +-- QuoteNode.ts
|       +-- QuoteView.tsx
|
+-- menus/                         # Menu components + extension definition (disatukan)
|   +-- SlashMenu/
|   |   +-- SlashMenuExtension.ts     # Extension definition
|   |   +-- SlashMenuComponent.tsx    # UI Component
|   +-- BubbleMenu.tsx                # Bubble menu component
|   +-- ContextMenu.tsx               # Context menu (right-click)
|
+-- extensions/                    # Extension-level murni (shared)
|   +-- editorExtensions.ts           # Shared extensions (Link, Underline, TextAlign, dll)
|   +-- DragHandleExtension.ts        # Drag handle untuk reorder block
|   +-- PlaceholderExtension.ts       # Custom placeholder
|
+-- serializers/
|   +-- toHTML.ts                     # Tiptap → HTML
|   +-- toClassic.ts                  # Tiptap → format continuous writing / classic style
|   +-- toJSON.ts                     # Tiptap → JSON
|   +-- fromLegacy.ts                 # Legacy format → Tiptap
|   +-- fromHTML.ts                   # HTML → Tiptap
|
+-- schemas/
|   +-- schema-v1.ts                  # Schema version 1
|   +-- schema-v2.ts                  # Schema version 2
|   +-- migrations/
|       +-- v1-to-v2.ts              # Migration logic
|       +-- normalizeDocument.ts     # Normalisasi dokumen
|
+-- bridges/                       # Integrasi dengan layer existing
|   +-- useTiptapBridge.ts            # Bridge Tiptap ↔ React component
|   +-- editorStoreBridge.ts          # Bridge Tiptap ↔ editorStore (Zustand)
|   +-- autosaveBridge.ts             # Bridge autosave
|
+-- hooks/                         # Custom hooks
|   +-- useEditorMode.ts              # Hook untuk akses mode editor aktif
|   +-- useSlashCommand.ts            # Hook slash command logic
|   +-- useSelection.ts               # Hook selection state
|   +-- useBlockNavigation.ts         # Hook navigasi antar block
|
+-- types/                         # Type definitions
|   +-- editor.ts
|   +-- nodes.ts
|   +-- serializer.ts
|
+-- constants/                     # Konstanta
|   +-- editorModes.ts
|   +-- blockTypes.ts
|
+-- index.ts                       # Public API exports
```

### Catatan Penyesuaian

| Perubahan | Alasan |
|-----------|--------|
| ❌ **Folder `plugins/` dihapus** | Behavior keyboard, paste, history sudah di-handle Tiptap StarterKit built-in |
| ✅ **Folder `menus/` & `extensions/` digabung overlap-nya** | SlashMenu punya extension definition + UI component yang lebih baik disatukan |
| ⏳ **Priority nodes dibagi fase** | Fase 1: paragraph, heading, quote, image. Fase 2: image-grid, media-text, callout |

---

## 3. Dependencies yang Dibutuhkan

```bash
# Core
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/pm

# Rich text extensions
pnpm add @tiptap/extension-link
pnpm add @tiptap/extension-underline
pnpm add @tiptap/extension-text-align
pnpm add @tiptap/extension-code
pnpm add @tiptap/extension-code-block
pnpm add @tiptap/extension-image
pnpm add @tiptap/extension-placeholder

# UI extensions
pnpm add @tiptap/extension-bubble-menu
pnpm add @tiptap/extension-floating-menu

# Utility
pnpm add @tiptap/extension-character-count
```

**Estimasi bundle size addition:** ~80KB (minified)

---

## 4. Phase Implementasi

### Phase 1: Foundation (2-3 hari) ✅ SELESAI

| Step | File | Deskripsi | Status |
|------|------|-----------|--------|
| 1.1 | Install dependencies | `pnpm add` semua package Tiptap | ✅ |
| 1.2 | `types/editor.ts`, `types/nodes.ts`, `types/serializer.ts` | Type definitions untuk ekosistem Tiptap | ✅ |
| 1.3 | `constants/editorModes.ts`, `constants/blockTypes.ts` | Konstanta mode dan block types | ✅ |
| 1.4 | `extensions/editorExtensions.ts` | Shared extensions (Link, Underline, TextAlign) | ✅ |
| 1.5 | `provider/TiptapProvider.tsx` | Provider untuk shared Tiptap context | ✅ |
| 1.6 | `bridges/useTiptapBridge.ts` | Hook bridge: inisialisasi editor, sync content, update store | ✅ |
| 1.7 | `bridges/editorStoreBridge.ts` | Bridge spesifik ke Zustand editorStore yang sudah ada | ✅ |

### Phase 2: Migrasi Rich Text Nodes (3-4 hari) ✅ SELESAI

| Step | File | Deskripsi | Status |
|------|------|-----------|--------|
| 2.1 | `nodes/section/ParagraphNode.ts` | Tiptap Node definition untuk paragraph | ✅ |
| 2.2 | `nodes/section/ParagraphView.tsx` | Custom NodeView React | ✅ |
| 2.3 | `nodes/section/TiptapParagraph.tsx` | Component wrapper (pengganti ParagraphEditor.tsx) | ✅ |
| 2.4 | `nodes/heading/HeadingNode.ts` | Heading node definition (h1-h6) | ✅ |
| 2.5 | `nodes/heading/HeadingView.tsx` | Heading NodeView | ✅ |
| 2.6 | `nodes/heading/TiptapHeading.tsx` | Component wrapper (pengganti HeadingBlock.tsx existing) | ✅ |
| 2.7 | `nodes/quote/QuoteNode.ts` | Quote node definition | ✅ |
| 2.8 | `nodes/quote/QuoteView.tsx` | Quote NodeView | ✅ |
| 2.9 | `nodes/image/ImageNode.ts` | Image node definition | ✅ |
| 2.10 | `nodes/image/ImageView.tsx` | Image NodeView | ✅ |
| 2.11 | `nodes/image/ImageToolbar.tsx` | Image-specific toolbar | ✅ |

### Phase 3: Mode System (2-3 hari) ✅ SELESAI

| Step | File | Deskripsi | Status |
|------|------|-----------|--------|
| 3.1 | `modes/gridblock/gridblockExtensions.ts` | Komposisi extension untuk GridBlock mode | ✅ |
| 3.2 | `modes/gridblock/GridBlockEditor.tsx` | Editor shell GridBlock | ✅ |
| 3.3 | `modes/gridblock/GridBlockToolbar.tsx` | Toolbar GridBlock | ✅ |
| 3.4 | `modes/gridblock/GridBlockSlashMenu.tsx` | Slash command GridBlock | ✅ |
| 3.5 | `modes/classic/classicExtensions.ts` | Komposisi extension untuk Classic mode | ✅ |
| 3.6 | `modes/classic/ClassicEditor.tsx` | Editor shell Classic | ✅ |
| 3.7 | `modes/classic/ClassicToolbar.tsx` | Toolbar minimal Classic | ✅ |
| 3.8 | `hooks/useEditorMode.ts` | Hook akses mode aktif | ✅ |
| 3.9 | `menus/SlashMenu/SlashMenuExtension.ts` | Extension definition slash command | ✅ |
| 3.10 | `menus/SlashMenu/SlashMenuComponent.tsx` | UI komponen slash menu | ✅ |
| 3.11 | `menus/BubbleMenu.tsx` | Bubble menu component | ✅ |
| 3.12 | `extensions/DragHandleExtension.ts` | Drag handle extension | ⏳ |
| 3.13 | `extensions/PlaceholderExtension.ts` | Custom placeholder | ⏳ |

### Phase 4: Bridging & Testing (2-3 hari)

| Step | File | Deskripsi |
|------|------|-----------|
| 4.1 | `bridges/autosaveBridge.ts` | Autosave integration |
| 4.2 | `hooks/useBlockNavigation.ts` | Navigasi antar block (prev/next) |
| 4.3 | `hooks/useSelection.ts` | Selection management |
| 4.4 | `serializers/toHTML.ts` | Tiptap → HTML serialization |
| 4.5 | `serializers/toClassic.ts` | Tiptap → continuous writing format |
| 4.6 | `serializers/toJSON.ts` | Tiptap → JSON |
| 4.7 | `serializers/fromLegacy.ts` | Legacy data → Tiptap |
| 4.8 | `serializers/fromHTML.ts` | HTML → Tiptap |

### Phase 5: Custom Nodes & Advanced (3-4 hari) — PRIORITAS RENDAH

| Step | File | Deskripsi |
|------|------|-----------|
| 5.1 | `nodes/image-grid/*` | ImageGrid custom node |
| 5.2 | `nodes/media-text/*` | MediaText custom node |
| 5.3 | `nodes/callout/*` | Callout custom node |
| 5.4 | `schemas/schema-v1.ts`, `schema-v2.ts` | Schema definitions |
| 5.5 | `schemas/migrations/*` | Migration logic antar schema version |
| 5.6 | `menus/ContextMenu.tsx` | Right-click context menu |

### Phase 6: Cleanup Legacy (1-2 hari)

| Step | File/Hapus | Deskripsi |
|------|------------|-----------|
| 6.1 | `✗ modes/gridblock/paragraph/ParagraphEditor.tsx` | Ganti dengan TiptapParagraph |
| 6.2 | `✗ modes/gridblock/paragraph/useParagraphBehavior.ts` | Tidak perlu lagi |
| 6.3 | `✗ modes/gridblock/paragraph/sanitizeParagraphPaste.ts` | Tidak perlu lagi |
| 6.4 | `✗ modes/gridblock/paragraph/ParagraphSlashMenu.tsx` | Ganti dengan SlashMenu Tiptap |
| 6.5 | `✗ modes/gridblock/blocks/ParagraphBlock.tsx` | Re-export ke TiptapParagraph |
| 6.6 | `✗ modes/gridblock/blocks/HeadingBlock.tsx` | Re-export ke TiptapHeading |
| 6.7 | `✗ modes/gridblock/blocks/QuoteBlock.tsx` | Re-export ke QuoteView |
| 6.8 | Update `blocks/` re-export | Arahkan semua ke Tiptap |
| 6.9 | Update `BlockRegistry.tsx` | Register Tiptap nodes |
| 6.10 | Update `editorCapabilities.ts` | Sesuaikan dengan realitas Tiptap |
| 6.11 | Update test files | Sesuaikan test dengan implementasi baru |
| 6.12 | Visual regression test | Pastikan styling identik |

---

## 5. Total Timeline

| Phase | Hari | Deliverable |
|-------|------|-------------|
| **1. Foundation** | 2-3 | Tiptap setup, types, provider, bridge ke store |
| **2. Migrasi Text** | 3-4 | Paragraph, Heading, Quote, Image nodes |
| **3. Mode System** | 2-3 | GridBlock vs Classic config + toolbar |
| **4. Bridging & Test** | 2-3 | Serializer, hooks, autosave |
| **5. Custom Nodes** | 3-4 | ImageGrid, MediaText, Callout (prioritas rendah) |
| **6. Cleanup** | 1-2 | Hapus legacy, update imports, testing final |

**Total estimated: ~12-17 hari kerja**

---

## 6. Contoh Implementasi: TiptapParagraph (Pengganti ParagraphEditor.tsx)

### Sekarang (manual contentEditable — 104 baris)
```tsx
// ParagraphEditor.tsx
export function ParagraphEditor({ block }) {
  // Manual handle contentEditable
  // useParagraphBehavior → handleKeyDown, handlePaste, handleFormat
  // useEffect sync DOM content
  // InlineToolbar manual
  // SlashMenu manual
  // 100+ baris
}
```

### Nanti (Tiptap — ~25 baris)
```tsx
// TiptapParagraph.tsx
export function TiptapParagraph({ block }: { block: ParagraphBlock }) {
  const editor = useTiptapBridge(block.id, block.content)

  return (
    <div className="relative group/p" data-block-wrapper>
      <BubbleMenu editor={editor}>
        <InlineToolbar editor={editor} />
      </BubbleMenu>
      <EditorContent
        editor={editor}
        className="min-h-[1.75em] outline-none font-serif ..."
      />
    </div>
  )
}
```

### useTiptapBridge (core bridge)
```tsx
// useTiptapBridge.ts
export function useTiptapBridge(blockId: string, initialContent: string) {
  const { updateBlock } = useEditorStore()

  return useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Placeholder.configure({ placeholder: 'Tulis paragraf...' }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { 'data-block-id': blockId },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== initialContent) {
        updateBlock(blockId, { content: html })
      }
    },
    onBlur: ({ editor }) => {
      updateBlock(blockId, { content: editor.getHTML() })
    },
  })
}
```

### Keuntungan
| Sebelum | Sesudah |
|---------|---------|
| Manual handle enter, backspace, delete | Tiptap handle otomatis |
| Manual paste sanitization | Tiptap handle paste dari mana pun |
| Manual IME/composition handling | ProseMirror handle native |
| useEffect sync DOM content | Tiptap reactive content |
| 100+ baris kode rawan bug | ~25 baris declarative |
| Custom hooks complex | Standard Tiptap API |

---

## 7. Risk Register

| Risk | Dampak | Mitigasi |
|------|--------|----------|
| Styling berbeda setelah migrasi | Medium | Visual regression test di Phase 6 |
| Backward compatibility legacy data | High | `fromLegacy.ts` serializer + simpan kedua format selama transisi |
| Custom node complex (ImageGrid) | Medium | Prototype 1 node dulu sebelum migrasi massal |
| Performance pada dokumen besar | Low | ProseMirror sudah optimized untuk dokumen besar |
| Slash command tidak sama persis | Low | Custom extension bisa dibuat untuk match exact UX |
| Learning curve tim | Medium | Karena incremental per-blok, tim bisa adaptasi bertahap |

---

## 8. Catatan Tambahan

- **Tidak perlu folder `plugins/`** — keyboard, paste, history behavior sudah built-in di Tiptap StarterKit
- **Folder `menus/` dan `extensions/` dipisah** — `menus/` berisi komponen UI + extension definition yang spesifik per menu type; `extensions/` berisi extension murni yang di-share antar mode
- **Priority nodes** — Mulai dari paragraph & heading dulu (paling sering dipakai), lanjut ke quote & image, baru custom nodes di fase terakhir
- **Pertahankan folder strukture existing** — Semua file baru masuk ke `core/tiptap/`, tidak perlu mengubah struktur existing sampai Phase 6 cleanup
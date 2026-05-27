# Task List Implementasi Per File: Modular Editor

Tanggal: 2026-05-27

## Tujuan

Dokumen ini memecah implementation plan modular editor menjadi task list yang langsung bisa dikerjakan per file.

## Status Fase

| Fase | Nama Fase | Checklist |
|---|---|---|
| F0 | Freeze kontrak data | [x] |
| F1 | Bangun shared core | [x] |
| F2 | Pecah store menjadi slice | [x] |
| F3 | Migrasi GridBlock | [x] |
| F4 | Bangun adapter WordPress | [x] |
| F5 | Satukan entry point editor | [x] |
| F6 | Test dan quality gate | [ ] |
| F7 | Rollout bertahap | [ ] |

## Ringkasan Batch 5

| Task | Checklist |
|---|---|
| `core/Editor.tsx` — Entry point utama (loading/saving/shortcuts) | [x] |
| `core/ArticleEditorShell.tsx` — Shell bersama (layout, sidebar, topbar) | [x] |
| `core/EditorCanvas.tsx` — Mode switcher (GridBlockEditor / WordPressEditor) | [x] |
| `core/EditorTopbar.tsx` — Topbar bersama (save, mode switch, focus, publish) | [x] |
| Legacy files (`Editor.tsx`, `ArticleEditorShell.tsx`, `EditorCanvas.tsx`, `EditorTopbar.tsx`) | [x] |
| Semua legacy files jadi facade → delegasi ke `core/` | [x] |

## Arsitektur Sekarang

```
editor/
  core/                    ← Entry point utama (Batch 5)
    Editor.tsx             ← Main editor (loading/saving artile, undo/redo)
    ArticleEditorShell.tsx ← Layout shell (topbar, sidebar, status notice)
    EditorCanvas.tsx       ← Mode switcher (GridBlock ↔ WordPress)
    EditorTopbar.tsx       ← Topbar (save, mode switch, focus, publish workflow)
    blockCatalog.ts        ← Single source of truth block list
    blockGuards.ts         ← Block type helpers
    editorMode.ts          ← Mode definitions
    editorCapabilities.ts  ← Capability matrix
    editorCommands.ts      ← Command layer
    editorSelectors.ts     ← Selectors
    richText/              ← Rich text utilities
    
  modes/
    gridblock/             ← GridBlock mode (Batch 3)
      GridBlockEditor.tsx  ← Entry point
      GridBlockList.tsx    ← Block list renderer
      GridBlockWrapper.tsx ← Block boundary wrapper
      gridblock.registry.tsx ← Block renderers
      gridblock.shortcuts.ts ← Keyboard shortcuts
      blocks/              ← 10 block components
    
    wordpress/             ← WordPress mode (Batch 4)
      WordPressEditor.tsx  ← Entry point
      WordPressParser.ts   ← DOM parser
      WordPressProjection.ts ← blocks ↔ text projection
      WordPressSync.ts     ← Command-layer sync
      WordPressWarnings.tsx ← Warnings UI
      WordPressToolbar.tsx ← Toolbar
  
  Editor.tsx (legacy)      → facade ke core/Editor.tsx
  EditorCanvas.tsx (legacy)→ facade ke core/EditorCanvas.tsx
  EditorTopbar.tsx (legacy)→ facade ke core/EditorTopbar.tsx
  ArticleEditorShell.tsx (legacy)→ facade ke core/ArticleEditorShell.tsx
  BlockRegistry.tsx (legacy)→ facade ke gridblock.registry
  BlockWrapper.tsx (legacy)→ GridBlockWrapper + WordPress minimal wrapper
  WordPressEditor.tsx (legacy)→ facade ke modes/wordpress/WordPressEditor
```

## Yang masih perlu dikerjakan

- **Batch 6**: Test dan quality gate
- **Batch 7**: Rollout bertahap
# Editor Layout Design - BeritaKarya

## Overview
Dokumen ini menjelaskan desain layout untuk Editor Dashboard yang menggunakan Tiptap sebagai rich text editor.

---

## Current Dashboard Layout Analysis

### Existing Structure
Dashboard layout (`apps/web/app/[site]/dashboard/layout.tsx`) memiliki 2 mode:

1. **Article Editor Mode** (`articles/new`, `articles/[id]`)
   - Simplified sidebar dengan fokus pada penulisan
   - Route detection: `isArticleEditorRoute`

2. **Regular Dashboard Mode** (semua route lain)
   - Full navigation sidebar
   - Role-based menu items

---

## Target Editor Layout

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIMPLIFIED SIDEBAR (Fixed 256px)    │  MAIN CONTENT                  │
│  ───────────────────────────────      │  ─────────────────────────────  │
│                                       │                                │
│  ┌─────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [Logo: Ruang Editor]           │  │  │ TOPBAR                   │  │
│  │ BK                               │  │  │ Status │ Save │ Publish │  │
│  └─────────────────────────────────┘  │  └──────────────────────────┘  │
│                                       │                                │
│  ┌─────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [← Kembali ke Daftar Post]    │  │  │                          │  │
│  └─────────────────────────────────┘  │  │  TITLE INPUT             │  │
│                                       │  │  "Ketik judul di sini..." │  │
│  ┌─────────────────────────────────┐  │  └──────────────────────────┘  │
│  │ Portal Aktif                    │  │                                │
│  │ ────────────────────────────    │  │  ┌──────────────────────────┐  │
│  │ [Bandung / Surabaya / Pusat]   │  │  │  EDITOR TOOLBAR            │  │
│  │                                 │  │  │  B I U │ H1 H2 │ ≡ • │ ❝ │  │
│  │ Mode menulis dipangkas agar    │  │  └──────────────────────────┘  │
│  │ fokus tetap pada judul,        │  │                                │
│  │ konten, dan workflow editorial. │  │  ┌──────────────────────────┐  │
│  └─────────────────────────────────┘  │  │                          │  │
│                                       │  │  TIPTAP CONTENT AREA     │  │
│  ┌─────────────────────────────────┐  │  │                          │  │
│  │ Akses Cepat                    │  │  │  [Block: Paragraph]       │  │
│  │ ────────────────────────────    │  │  │  Tulis paragraf pertama.. │  │
│  │ 📄 Daftar Post                 │  │  │                          │  │
│  │ 🔗 Lihat Portal                 │  │  │  [Block: Heading]          │  │
│  └─────────────────────────────────┘  │  │  Heading 2                │  │
│                                       │  │                          │  │
│  ┌─────────────────────────────────┐  │  │  [Block: Quote]           │  │
│  │ [User Avatar] [Name]           │  │  │  "Quote text here..."      │  │
│  │ WAPIMRED                        │  │  │  — Sumber Attribution      │  │
│  │                                 │  │  │                          │  │
│  │ [🌙] [Logout]                  │  │  │  [Block: Callout]          │  │
│  └─────────────────────────────────┘  │  │  ⚠️ Info message...       │  │
│                                       │  │                          │  │
│                                       │  │  [Block: Embed]           │  │
│                                       │  │  📺 YouTube preview       │  │
│                                       │  │                          │  │
│                                       │  └──────────────────────────┘  │
│                                       │                                │
│                                       │  ┌──────────────────────────┐  │
│                                       │  │  SIDEBAR (Collapsible)   │  │
│                                       │  │  [Content] [Settings]   │  │
│                                       │  │  [SEO] [History]        │  │
│                                       │  │  ───────────────────────  │  │
│                                       │  │  Category: [Dropdown]    │  │
│                                       │  │  Tags: [Input]           │  │
│                                       │  │  Featured Image: [Upload]│  │
│                                       │  └──────────────────────────┘  │
└───────────────────────────────────────┴────────────────────────────────┘
```

---

## Component Structure

### File Structure

```
apps/web/components/editor/
├── index.ts                      # Exports semua komponen
│
├── Editor.tsx                    # Main wrapper (UPDATE)
│   # Menggunakan useEditorStore
│   # Render EditorTopbar + EditorContent + EditorSidebar
│
├── EditorTopbar.tsx             # Status bar & actions
│   # Props: { isLoading, saveError, lastSaved }
│   # - Status badge (draft/published/etc)
│   # - Save indicator (Saving... / Saved)
│   # - Word count
│   # - Publish/Submit button
│
├── EditorTitleStage.tsx          # Title input area
│   # Props: { title, onChange }
│   # - Large title input
│   # - Auto-slug generation
│   # - Character count
│
├── EditorContent.tsx             # Main content area
│   # Props: { children }
│   # - Wraps TiptapEditor + sidebar
│   # - Responsive layout
│
├── TiptapEditor.tsx              # Core Tiptap (UPDATE)
│   # Props: { content, onChange, editable }
│   # - useEditor hook
│   # - Extensions: StarterKit, Link, Image, Placeholder, TextAlign, Underline
│   # - Custom extensions: Quote, Callout, Embed
│
├── TiptapEditorToolbar.tsx       # Formatting toolbar
│   # Props: { editor }
│   # - Bold, Italic, Underline
│   # - Heading (H1, H2, H3)
│   # - Lists (bullet, numbered)
│   # - Alignment
│   # - Link, Image
│   # - Insert: Quote, Callout, Embed
│
├── EditorSidebar.tsx             # Right sidebar
│   # Props: { isOpen, onToggle }
│   # - Tabs: Content, Settings, SEO, History
│   # - Collapsible panel
│
├── tabs/
│   ├── TabContent.tsx            # Content tab
│   │   # - Word/character count
│   │   # - Block overview
│   │
│   ├── TabSettings.tsx          # Settings tab
│   │   # - Category dropdown
│   │   # - Tags input
│   │   # - Featured image upload
│   │   # - Editorial badges (Breaking, Exclusive)
│   │
│   ├── TabSEO.tsx               # SEO tab
│   │   # Props: SEOPanel component
│   │   # - Meta title (60 char limit)
│   │   # - Meta description (160 char limit)
│   │   # - SEO preview
│   │
│   └── TabHistory.tsx           # History tab
│       # - Version list
│       # - Restore version
│
├── extensions/                    # (SUDAH ADA)
│   ├── QuoteExtension.ts
│   ├── QuoteView.tsx
│   ├── CalloutExtension.ts
│   ├── CalloutView.tsx
│   ├── EmbedExtension.ts
│   └── EmbedView.tsx
│
└── hooks/
    └── useTiptapSync.ts          # (SUDAH ADA)
        # Sync Tiptap ↔ EditorStore
```

---

## Component Details

### 1. Editor.tsx (Main Wrapper)

```typescript
interface EditorProps {
  articleId: string
  siteId: string
}

// Fungsi:
// 1. Load article dari API via useEditorStore.loadArticle()
// 2. Initialize TiptapEditor dengan content dari store
// 3. Render EditorTopbar + EditorContent + EditorSidebar
// 4. Handle keyboard shortcuts (Ctrl+S save, Ctrl+Z undo)

// State:
// - isLoading: dari useEditorStore
// - saveError: dari useEditorStore
// - lastSaved: dari useEditorStore
```

### 2. EditorTopbar.tsx

```typescript
interface EditorTopbarProps {
  isLoading?: boolean
  saveError?: string | null
  lastSaved?: Date | null
}

// Fungsi:
// - Display article status (draft/submitted/published)
// - Show save status (Saving... / Saved at HH:MM)
// - Word count
// - Action buttons (Save Draft, Submit for Review, Publish)

// Actions:
// - saveArticle() dari useEditorStore
// - submitForReview() dari useEditorStore
// - publishArticle() dari useEditorStore
```

### 3. EditorTitleStage.tsx

```typescript
interface EditorTitleStageProps {
  isFocusMode?: boolean
}

// Fungsi:
// - Large title input field
// - Auto-generate slug dari title
// - Show character count
// - Placeholder: "Ketik judul di sini..."

// Styling:
// - Focus mode: Full width, centered
// - Normal mode: Constrained width
```

### 4. TiptapEditor.tsx

```typescript
interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  editable?: boolean
}

// Extensions:
// - StarterKit (paragraph, heading, lists, etc)
// - Placeholder
// - Link (autolink, openOnClick: false)
// - Image
// - TextAlign (heading, paragraph, blockquote)
// - Underline
// - Quote (custom - dari extensions/)
// - Callout (custom - dari extensions/)
// - Embed (custom - dari extensions/)

// Events:
// - onUpdate: sync ke useTiptapSync hook
```

### 5. TiptapEditorToolbar.tsx

```typescript
interface TiptapEditorToolbarProps {
  editor: Editor // dari useEditor
}

// Button Groups:

// Group 1: History
// - Undo, Redo

// Group 2: Text Formatting
// - Bold, Italic, Underline, Strike, Code

// Group 3: Headings
// - H1, H2, H3

// Group 4: Lists
// - Bullet List, Numbered List

// Group 5: Blocks
// - Blockquote
// - Code Block
// - Horizontal Rule

// Group 6: Alignment
// - Left, Center, Right, Justify

// Group 7: Media
// - Insert Link
// - Insert Image
// - Insert Embed (YouTube, Twitter, Instagram)
```

### 6. EditorSidebar.tsx

```typescript
interface EditorSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Tabs:
// - content: Overview, word count
// - settings: Category, tags, featured image
// - seo: Meta title, description, preview
// - history: Version history

// Styling:
// - Collapsible dengan animation
// - Tab indicators
```

---

## Integration with Store

### useEditorStore Usage

```typescript
// Editor.tsx
const {
  articleId,
  title,
  blocks,
  status,
  saving,
  saveError,
  lastSaved,
  isDirty,
  loadArticle,
  saveArticle,
  submitForReview,
  publishArticle,
  setTitle,
  setBlocks,
} = useEditorStore()

// Sync dengan Tiptap via useTiptapSync hook
useTiptapSync(editor, {
  blocks,
  setBlocks,
  saveArticle,
})
```

---

## Responsive Design

### Desktop (≥1024px)
```
┌──────────────┬────────────────────────────────────────┐
│   Sidebar    │  Editor Content  │  Editor Sidebar    │
│   (256px)    │   (flex-1)       │    (320px)          │
└──────────────┴────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────┬────────────────────────────────┐
│   Sidebar    │     Editor Content           │
│   (256px)    │     (flex-1)                 │
└──────────────┴────────────────────────────────┘
Sidebar editor collapse ke icon-only
```

### Mobile (<768px)
```
┌────────────────────────────────┐
│     Editor Content             │
│     (full width)               │
│                                │
│  [Toggle Sidebar Button]       │
└────────────────────────────────┘
Sidebar jadi floating panel
```

---

## Styling Guidelines

### Color Palette
```css
/* Primary */
--brand-red: #B91C1C
--brand-black: #0F172A

/* Status Colors */
--status-draft: #F59E0B
--status-submitted: #3B82F6
--status-review: #8B5CF6
--status-approved: #10B981
--status-published: #059669

/* Editor */
--editor-bg: #FFFFFF
--editor-border: #E2E8F0
--editor-toolbar-bg: #F8FAFC
--editor-content-bg: #FFFFFF
```

### Typography
```css
/* Title */
font-size: 2rem
font-weight: 800
line-height: 1.2

/* Paragraph */
font-size: 1rem
line-height: 1.8

/* Quote */
font-size: 1.125rem
font-style: italic
```

---

## Future Enhancements

1. **Focus Mode**
   - Minimalist UI
   - Distraction-free writing
   - Toggle dengan keyboard shortcut

2. **Collaboration**
   - Real-time cursor indicators
   - Comments/annotations

3. **Version History**
   - Auto-save versions
   - Compare versions
   - Restore previous version

4. **AI Integration**
   - Inline AI suggestions
   - Slash commands: `/ai:summary`, `/ai:rewrite`

---

## Implementation Notes

1. **TypeScript Strict Mode**: Semua props dan state harus typed
2. **Error Handling**: Try-catch untuk API calls
3. **Loading States**: Skeleton/shimmer untuk async operations
4. **Accessibility**: Focus management, keyboard navigation
5. **Performance**: Lazy load extensions, optimize re-renders

---

**Last Updated:** 2026-05-29  
**Author:** AI Assistant  
**Status:** Ready for Implementation
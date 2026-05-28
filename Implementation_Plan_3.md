# Implementation Plan 3: Remaining Improvements

## Overview

Based on the audit findings, this document outlines the implementation plan for the remaining improvements to the BeritaKarya News Development System.

---

## Item 1: Implement @tiptap/suggestion for Full Slash Menu

### Objective
Complete the slash command menu functionality using @tiptap/suggestion package.

### Steps

| Step | File | Deskripsi | Priority | Status |
|------|------|-----------|----------|--------|
| 1.1 | Install package | `pnpm add @tiptap/suggestion` | HIGH | ✅ DONE |
| 1.2 | Update SlashMenuExtension.ts | Implement full suggestion logic | HIGH | ✅ DONE |
| 1.3 | Update SlashMenuComponent.tsx | Add selection keyboard navigation | MEDIUM | ✅ DONE |
| 1.4 | Integrate with TiptapParagraph | Trigger slash menu on "/" | HIGH | ✅ DONE |
| 1.5 | Test slash menu | Verify all block types work | MEDIUM | ⏳ PENDING |

### Block Types for Slash Menu
```
- Paragraph (default)
- Heading 2 (H2)
- Heading 3 (H3)
- Heading 4 (H4)
- Blockquote (Quote)
- Bullet List
- Ordered List
- Code Block
- Image (priority rendah - Phase 2)
- Image Grid (priority rendah - Phase 2)
- Callout (priority rendah - Phase 2)
```

### Example Implementation
```tsx
// SlashMenuExtension.ts - Full Implementation
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { SlashMenuComponent } from './SlashMenuComponent'

export const SlashMenuExtension = Extension.create({
  name: 'slashMenu',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command(editor)
          editor.chain().focus().deleteRange(range).run()
        },
        items: ({ query }) => {
          return SLASH_MENU_ITEMS.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: any
          let popup: any

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashMenuComponent, {
                props,
                editor: props.editor,
              })

              // Position popup
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
              })
            },
            onUpdate(props: any) {
              component.updateProps(props)
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }
              return component.ref?.onKeyDown(props)
            },
            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})
```

### Timeline: 2-3 days

---

## Item 2: Complete Image-Grid, Callout, Media-Text Nodes

### Objective
Implement custom block types for advanced content formatting.

### 2A. Callout Block

| Step | File | Deskripsi |
|------|------|-----------|
| 2A.1 | `nodes/callout/CalloutNode.ts` | Tiptap Node definition |
| 2A.2 | `nodes/callout/CalloutView.tsx` | React component |
| 2A.3 | `nodes/callout/CalloutToolbar.tsx` | Variant selector |

### Callout Variants
```typescript
const CALLOUT_VARIANTS = {
  info: { icon: 'ℹ️', color: 'blue', bg: 'bg-blue-50' },
  warning: { icon: '⚠️', color: 'amber', bg: 'bg-amber-50' },
  error: { icon: '❌', color: 'red', bg: 'bg-red-50' },
  success: { icon: '✅', color: 'green', bg: 'bg-green-50' },
  editorial: { icon: '📝', color: 'violet', bg: 'bg-violet-50' },
}
```

### 2B. Image-Grid Block

| Step | File | Deskripsi |
|------|------|-----------|
| 2B.1 | `nodes/image-grid/ImageGridNode.ts` | Tiptap Node definition |
| 2B.2 | `nodes/image-grid/ImageGridView.tsx` | React component with gallery UI |
| 2B.3 | `nodes/image-grid/ImageGridToolbar.tsx` | Column selector + add images |

### Image Grid Features
- 2 or 3 column layouts
- Add/remove images
- Reorder images
- Lightbox preview
- Caption support

### 2C. Media-Text Block

| Step | File | Deskripsi |
|------|------|-----------|
| 2C.1 | `nodes/media-text/MediaTextNode.ts` | Tiptap Node definition |
| 2C.2 | `nodes/media-text/MediaTextView.tsx` | React component |
| 2C.3 | `nodes/media-text/MediaTextToolbar.tsx` | Layout selector |

### Media-Text Variants
- Left: Media | Text
- Right: Text | Media
- Full-width media above text

### Timeline: 5-7 days

---

## Item 3: Add Schema-v2 and Migrations

### Objective
Introduce versioned schema with proper migration system.

### Schema v2 Changes
```typescript
// schema-v2.ts
export const schemaV2 = {
  version: 'v2',
  blocks: {
    paragraph: {
      content: 'inline*',
      marks: ['bold', 'italic', 'underline', 'link', 'code'],
    },
    heading: {
      levels: [2, 3, 4], // Editorial constraint
    },
    quote: {
      content: 'inline*',
      attrs: {
        attribution: { default: null },
        source: { default: null },
      },
    },
  },
  metadata: {
    title: { maxLength: 200 },
    excerpt: { maxLength: 280 },
    tags: { maxCount: 10 },
  },
}
```

### Migration Structure
```
schemas/
├── schema-v1.ts        # Current schema
├── schema-v2.ts        # New schema
└── migrations/
    ├── index.ts        # Migration runner
    ├── v1-to-v2.ts      # Migration logic
    └── normalizeDocument.ts  # Normalization utilities
```

### Migration Logic
```typescript
// migrations/v1-to-v2.ts
export function migrateToV2(blocks: Block[]): Block[] {
  return blocks.map(block => {
    // 1. Normalize paragraph content
    if (block.type === 'paragraph') {
      block.content = sanitizeHTML(block.content)
    }
    
    // 2. Constrain heading levels to 2-4
    if (block.type === 'heading') {
      block.level = Math.max(2, Math.min(4, block.level))
    }
    
    // 3. Add missing metadata fields
    if (!block.id) {
      block.id = generateId()
    }
    
    return block
  })
}
```

### Timeline: 3-4 days

---

## Item 4: Add E2E Tests for Critical Flows

### Objective
Ensure critical user flows work correctly with Playwright tests.

### Test Coverage

#### 4.1 Article Creation Flow
```typescript
// e2e/articles.spec.ts
test.describe('Article Creation', () => {
  test('should create and save new article', async ({ page }) => {
    // 1. Login
    await page.goto('/pusat/dashboard/articles/new')
    await page.fill('[data-testid="title"]', 'Test Article Title')
    
    // 2. Write content
    await page.click('[data-testid="paragraph-block"]')
    await page.type('Hello world article content')
    
    // 3. Add category
    await page.selectOption('[data-testid="category"]', 'News')
    
    // 4. Save
    await page.click('[data-testid="save-button"]')
    await expect(page.locator('.toast-success')).toBeVisible()
    
    // 5. Verify article appears in list
    await page.goto('/pusat/dashboard/articles')
    await expect(page.locator('text=Test Article Title')).toBeVisible()
  })
  
  test('should submit article for review', async ({ page }) => {
    // Login as reporter
    await page.goto('/pusat/dashboard/articles/new')
    await createArticleWithContent(page)
    
    // Submit for review
    await page.click('[data-testid="submit-review"]')
    await expect(page.locator('.toast-success')).toContainText('dikirim')
  })
})
```

#### 4.2 Review Workflow
```typescript
test.describe('Review Workflow', () => {
  test('wapimred can approve article', async ({ page }) => {
    // Login as wapimred
    await page.goto('/pusat/dashboard/review')
    
    // Find submitted article
    await page.click('[data-testid="tab-submitted"]')
    
    // Approve
    await page.click('[data-testid="approve-btn"]')
    await page.click('[data-testid="confirm-approve"]')
    
    // Verify in approved tab
    await page.click('[data-testid="tab-approved"]')
    await expect(page.locator('text=Approved')).toBeVisible()
  })
  
  test('wapimred can request revision', async ({ page }) => {
    await page.goto('/pusat/dashboard/review')
    await page.click('[data-testid="tab-submitted"]')
    
    // Request revision
    await page.click('[data-testid="request-revision"]')
    await page.fill('[data-testid="revision-notes"]', 'Please add more sources')
    await page.click('[data-testid="submit-revision"]')
    
    // Verify in revision tab
    await page.click('[data-testid="tab-revision"]')
    await expect(page.locator('text=Please add more sources')).toBeVisible()
  })
})
```

#### 4.3 KYC Flow
```typescript
test.describe('KYC Workflow', () => {
  test('reporter must complete KYC', async ({ page }) => {
    // Login as unverified reporter
    await page.goto('/pusat/dashboard/articles')
    
    // Should redirect to KYC page
    await expect(page).toHaveURL(/.*\/dashboard\/kyc/)
    
    // Complete KYC
    await page.uploadFile('[data-testid="id-card"]', 'id-card.jpg')
    await page.uploadFile('[data-testid="family-card"]', 'family-card.jpg')
    await page.click('[data-testid="submit-kyc"]')
    
    // Verify KYC pending
    await expect(page.locator('.kyc-status')).toContainText('PENDING')
  })
})
```

### Playwright Config
```typescript
// playwright.config.ts
export default {
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
}
```

### Timeline: 5-7 days

---

## Item 5: Add Unit Tests for Services

### Objective
Ensure core business logic is well-tested.

### Test Coverage

#### 5.1 Article Service Tests
```typescript
// article.service.test.ts
describe('Article Service', () => {
  describe('createArticle', () => {
    it('should create article with normalized blocks', async () => {
      const input = {
        title: 'Test',
        blocks: [{ type: 'paragraph', content: '<p>Test</p>' }],
      }
      
      const result = await createArticle(input, user, site)
      
      expect(result.title).toBe('Test')
      expect(result.blocks).toHaveLength(1)
    })
    
    it('should reject title exceeding max length', async () => {
      const input = {
        title: 'A'.repeat(201), // 201 chars
      }
      
      await expect(createArticle(input, user, site))
        .rejects.toThrow('max 200')
    })
  })
  
  describe('publishArticle', () => {
    it('should publish approved article', async () => {
      const article = await createArticle({...})
      await updateArticle(article.id, { status: 'approved' })
      
      const result = await publishArticle(article.id, site, user)
      
      expect(result.status).toBe('published')
      expect(result.publishedAt).toBeDefined()
    })
    
    it('should reject publishing draft article', async () => {
      const article = await createArticle({...})
      
      await expect(publishArticle(article.id, site, user))
        .rejects.toThrow('must be approved')
    })
  })
})
```

#### 5.2 KYC Service Tests
```typescript
// kyc.service.test.ts
describe('KYC Service', () => {
  describe('submitKYC', () => {
    it('should reject if documents missing', async () => {
      await expect(submitKYC(user.id, {})).rejects.toThrow('ID card required')
    })
    
    it('should increment kycAttempts on failure', async () => {
      const before = user.kycAttempts
      await submitKYC(user.id, { idCardPath: null })
      expect(user.kycAttempts).toBe(before + 1)
    })
    
    it('should lock account after 3 failed attempts', async () => {
      // Set attempts to 2
      await prisma.user.update({
        where: { id: user.id },
        data: { kycAttempts: 2 }
      })
      
      await submitKYC(user.id, { idCardPath: null })
      
      const updated = await prisma.user.findUnique({ where: { id: user.id }})
      expect(updated.kycLockedUntil).toBeDefined()
    })
  })
})
```

#### 5.3 AI Quota Service Tests
```typescript
// aiQuota.service.test.ts
describe('AI Quota Service', () => {
  describe('checkQuota', () => {
    it('should allow request within daily limit', async () => {
      const result = await checkQuota(user.id)
      expect(result.allowed).toBe(true)
    })
    
    it('should reject when daily limit exceeded', async () => {
      // Set daily count to 50
      await prisma.aiUsage.updateMany({
        where: { userId: user.id },
        data: { count: 50 }
      })
      
      const result = await checkQuota(user.id)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('DAILY_LIMIT_EXCEEDED')
    })
  })
})
```

### Vitest Config
```typescript
// vitest.config.mts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'dist'],
    },
  },
})
```

### Timeline: 5-7 days

---

## Total Timeline

| Item | Days | Priority |
|------|------|----------|
| 1. Slash Menu (@tiptap/suggestion) | 2-3 | HIGH |
| 2. Custom Nodes (ImageGrid, Callout, MediaText) | 5-7 | MEDIUM |
| 3. Schema v2 & Migrations | 3-4 | MEDIUM |
| 4. E2E Tests | 5-7 | HIGH |
| 5. Unit Tests | 5-7 | HIGH |

**Total: ~20-28 days**

---

## Recommended Order

1. **Phase 1 (Week 1)**: Slash Menu + E2E Tests
2. **Phase 2 (Week 2)**: Unit Tests + Custom Nodes
3. **Phase 3 (Week 3)**: Schema v2 + Final Testing

---

## Success Criteria

- [ ] Slash menu works with keyboard navigation
- [ ] All 3 custom nodes implemented (Callout, ImageGrid, MediaText)
- [ ] Schema v2 with backward compatibility
- [ ] E2E tests covering critical paths (>80% coverage)
- [ ] Unit tests for all services (>70% coverage)

---

*Generated: 2026-05-28*
*Status: Ready for Implementation*
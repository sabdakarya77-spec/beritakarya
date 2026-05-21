# 📐 RENCANA IMPLEMENTASI REVISI: Standardisasi Layout & Responsive Design
**Status:** Revised based on comprehensive audit  
**Date:** 21 Mei 2026  
**Auditor:** Senior Systems Auditor  

---

## 🎯 Executive Summary

Revisi ini memperluas scope dari **2 file menjadi SEMUA halaman publik** BeritaKarya, menambahkan **Design Token System**, **Global Layout Component**, dan **Automated Testing** untuk memastikan konsistensi layout jangka panjang.

**Original Gap:** Only 2 files mentioned (SiteHomePage, Article detail)  
**Revised Coverage:** 11+ public pages + layout system infrastructure

---

## 📋 Problem Statement (Context)

Berdasar `frontend_audit_beritakarya.md` poin **6 (Layout & Spacing Inconsistent)** dan **2 (Mobile Experience Sangat Basic)**:

1. ❌ **Negative Margin Hack** - `-mx-4 lg:-mx-10` tidak seimbang di tablet/mobile
2. ❌ **Container Width Inconsistency** - `max-w-4xl` vs `max-w-7xl` di halaman yang sama
3. ❌ **Missing Mobile Optimization** - Grid, gap, rounded corners tidak adaptif
4. ❌ **No Scalable System** - Perlu edit manual per-file (error-prone)

**Impact:** Layout shift, horizontal scroll, inconsistent branding, poor Core Web Vitals

---

## 🏗️ Solution Architecture (3-Phase Approach)

### **Phase 1: Foundation (Week 1)**
Buat design token + global layout wrapper agar semua halaman bisa reusable.

### **Phase 2: Migration (Week 2)**
Apply standardisasi ke **SEMUA** halaman publik dengan automated checks.

### **Phase 3: QA & Documentation (Week 3)**
Visual regression testing, Lighthouse CI, update design system docs.

---

## 📐 Phase 1: Foundation Infrastructure

### 1.1 Design Tokens (CSS Custom Properties)

**File:** `apps/web/app/globals.css` / `tailwind.config.js`

```css
/* ==================== CONTAINER SYSTEM TOKENS ==================== */
:root {
  /* Horizontal Padding (Container Gutters) */
  --container-padding-mobile: 1rem;    /* px-4 = 16px */
  --container-padding-tablet: 2rem;    /* md:px-8 = 32px */
  --container-padding-desktop: 2.5rem; /* lg:px-10 = 40px */
  
  /* Container Max Width */
  --container-max-width: 80rem;       /* max-w-7xl = 1280px */
  
  /* Content Width (Optimal Reading) */
  --content-max-width: 47.5rem;       /* max-w-[760px] for text */
  
  /* Bleeding Edge System */
  --bleed-mobile: -1rem;              /* -mx-4 */
  --bleed-tablet: -2rem;              /* md:-mx-8 */
  --bleed-desktop: -2.5rem;           /* lg:-mx-10 */
  
  /* Grid Gaps */
  --gap-regular: 1.5rem;             /* gap-6 */
  --gap-wide: 3rem;                   /* lg:gap-12 */
  --gap-wider: 5rem;                  /* lg:gap-20 */
  
  /* Border Radius */
  --radius-card: 1.5rem;              /* rounded-3xl */
  --radius-button: 0.75rem;           /* rounded-xl */
  --radius-input: 0.5rem;             /* rounded-lg */
}
```

**Tailwind Config Extension:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'container-mobile': 'var(--container-padding-mobile)',
        'container-tablet': 'var(--container-padding-tablet)',
        'container-desktop': 'var(--container-padding-desktop)',
      },
      maxWidth: {
        'container': 'var(--container-max-width)',
        'content': 'var(--content-max-width)',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
      }
    }
  }
}
```

---

### 1.2 Global Layout Component

**File:** `apps/web/components/layout/PublicPageLayout.tsx`

```tsx
'use client';

interface PublicPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  bleed?: boolean; // Enable edge-to-edge sections
}

/**
 * Standardized container wrapper for all public pages.
 * Automatically applies responsive padding and max-width.
 * 
 * Usage:
 *   <PublicPageLayout>
 *     <PageContent />
 *   </PublicPageLayout>
 *   
 *   For edge-to-edge sections (hero, featured):
 *   <PublicPageLayout bleed>
 *     <BleedSection />
 *   </PublicPageLayout>
 */
export function PublicPageLayout({ 
  children, 
  className = '',
  bleed = false 
}: PublicPageLayoutProps) {
  return (
    <div
      className={cn(
        // Bleeding sections: no horizontal padding, negative margin
        bleed ? '-mx-[var(--container-padding-mobile)] md:-mx-[var(--container-padding-tablet)] lg:-mx-[var(--container-padding-desktop)]' : '',
        // Inner padding to offset bleed
        bleed ? 'px-[var(--container-padding-mobile)] md:px-[var(--container-padding-tablet)] lg:px-[var(--container-padding-desktop)]' : '',
        // Standard padding for non-bleed
        !bleed ? 'px-[var(--container-padding-mobile)] md:px-[var(--container-padding-tablet)] lg:px-[var(--container-padding-desktop)]' : '',
        'max-w-[var(--container-max-width)] mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Alternative Simpler Version (Recommended):**

```tsx
// components/layout/Container.tsx
export function Container({ 
  children, 
  className = '',
  size = 'default', // 'default' | 'content' | 'full'
  bleed = false 
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'content' | 'full';
  bleed?: boolean;
}) {
  const sizeClasses = {
    default: 'max-w-[var(--container-max-width)]',
    content: 'max-w-[var(--content-max-width)]',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      bleed 
        ? '-mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10'
        : 'px-4 md:px-8 lg:px-10',
      sizeClasses[size],
      'mx-auto',
      className
    )}>
      {children}
    </div>
  );
}
```

---

## 📱 Phase 2: Migration to All Public Pages

### **Master Checklist - All Public Pages Requiring Fix**

| No | Page | File Path | Priority | Status |
|----|------|-----------|----------|--------|
| 1 | Homepage | `apps/web/components/pages/SiteHomePage.tsx` | HIGH | Pending |
| 2 | Article Detail | `apps/web/app/[site]/artikel/[slug]/page.tsx` | HIGH | Pending |
| 3 | Article Listing | `apps/web/app/[site]/artikel/page.tsx` | HIGH | Pending |
| 4 | Category Page | `apps/web/app/[site]/kategori/[slug]/page.tsx` | HIGH | Pending |
| 5 | Search Results | `apps/web/app/[site]/cari/page.tsx` | MEDIUM | Pending |
| 6 | Author Profile | `apps/web/app/[site]/penulis/[username]/page.tsx` | MEDIUM | Pending |
| 7 | About Us | `apps/web/app/[site]/tentang-kami/page.tsx` | LOW | Pending |
| 8 | Contact | `apps/web/app/[site]/kontak/page.tsx` | LOW | Pending |
| 9 | Privacy Policy | `apps/web/app/[site]/kebijakan-privasi/page.tsx` | LOW | Pending |
| 10 | 404 Error | `apps/web/app/[site]/not-found.tsx` | LOW | Pending |
| 11 | 500 Error | `apps/web/app/[site]/error.tsx` | LOW | Pending |
| 12 | Login/Register | `apps/web/app/[site]/(auth)/login/page.tsx` | MEDIUM | Pending |

> **⚠️ IMPORTANT:** Pastikan SEMUA halaman di list ini di-cover, jangan hanya 2 file seperti rencana original.

---

### **Standard Migration Pattern for Each File:**

#### Before (Problematic):
```tsx
// ❌ Inconsistent padding, no breakpoints
<main className="px-4 max-w-4xl mx-auto">
  <section className="-mx-4 lg:-mx-10">
    {/* Bleed section */}
  </section>
</main>
```

#### After (Fixed with Container Component):
```tsx
// ✅ Consistent, reusable, clear intent
import { Container } from '@/components/layout/Container';

<Container>
  <section className="py-8">
    <h1>Article Title</h1>
    <p>Content...</p>
  </section>
</Container>

// For edge-to-edge hero:
<Container bleed>
  <section className="rounded-none md:rounded-3xl bg-gray-100">
    {/* Hero content */}
  </section>
</Container>
```

---

### 2.1 Specific File Changes

#### **File 1: SiteHomePage.tsx** (Priority: HIGH)

**Changes Required:**
1. Replace all `px-4` with `<Container>` wrapper
2. Fix Bento Hero Section bleed:
   - FROM: `-mx-4 lg:-mx-10`
   - TO: `-mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10`
3. Fix Berita Video Section:
   - FROM: `rounded-3xl`
   - TO: `rounded-none md:rounded-3xl`
4. Ensure all grid gaps use `gap-6` → upgrade to `gap-8 lg:gap-12` for rhythm

**Validation:** No horizontal scroll on Mobile S (375px), Tablet (768px), Desktop (1280px), Ultra-wide (1920px)

---

#### **File 2: artikel/[slug]/page.tsx** (Priority: HIGH)

**Changes Required:**
1. **Header Container:**
   - FROM: `max-w-4xl mx-auto px-4`
   - TO: `<Container size="content">` (max-w-[760px] for optimal reading)
   
2. **Cover Image:**
   - FROM: `px-4`
   - TO: Wrapper with `<Container>` or `px-4 md:px-8 lg:px-10`
   
3. **Main Content & Sidebar:**
   - FROM: `px-4 gap-16 md:gap-32`
   - TO: `<Container> + gap-12 lg:gap-16`
   
4. **Related Articles:** Ensure grid responsive with `grid-cols-1 md:grid-cols-3`

**Note:** Article detail page needs **dual-width strategy**:
- Header/Caption: `max-w-[760px]` (reading comfort)
- Images/Media: `max-w-7xl` (full-bleed showcase)
- Sidebar: `max-w-[320px]` fixed on desktop

---

#### **File 3: artikel/page.tsx** (Article Listing)

**Changes Required:**
1. Main container: `<Container>`
2. Grid articles: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`
3. Sidebar (if exists): sticky positioning with proper offset

---

#### **File 4-11:** Follow same pattern, see checklist table above.

---

### 2.2 Automated Migration Script (Optional but Recommended)

Create script to batch-update all files:

**File:** `scripts/standardize-layout.mjs`

```javascript
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const publicPages = [
  'apps/web/components/pages/SiteHomePage.tsx',
  'apps/web/app/[site]/artikel/[slug]/page.tsx',
  // ... add all 11+ file paths
];

const replacements = [
  // px-4 alone → Container wrapper
  {
    pattern: /<main className="([^"]*)px-4([^"]*)">/g,
    replace: '<Container><main className="$1$2">'
  },
  // -mx-4 lg:-mx-10 (bleed fix)
  {
    pattern: /-mx-4 lg:-mx-10/g,
    replace: '-mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10'
  },
  // rounded-3xl on mobile → rounded-none md:rounded-3xl
  {
    pattern: /rounded-3xl/g,
    replace: 'rounded-none md:rounded-3xl'
  }
];

for (const file of publicPages) {
  let content = await readFile(file, 'utf-8');
  
  for (const { pattern, replace } of replacements) {
    content = content.replace(pattern, replace);
  }
  
  await writeFile(file, content);
  console.log(`✅ Updated ${file}`);
}
```

**⚠️ CAUTION:** Backup first! Manual review recommended.

---

## 🧪 Phase 3: QA, Testing & Documentation

### 3.1 Manual Verification Checklist

**For EACH page, test on these viewports:**

| Viewport | Width | Test |
|----------|-------|------|
| Mobile S | 375px | No horizontal scroll, padding = 16px |
| Mobile L | 425px | No overflow, elements not cut |
| Tablet | 768px | Padding = 32px, bleed balanced |
| Laptop | 1280px | Max-width container centered, no extra margin |
| Ultra-wide | 1920px | Content maxes at 1280px, centered |

**How to test efficiently:**
1. Open Chrome DevTools → Device Toolbar
2. Check each page at all 5 breakpoints
3. Look for red overflow warning in console: `[Container width exceeds viewport]`
4. Verify left/right margins visually equal

---

### 3.2 Automated Checks

#### **A. TypeScript Validation**
```bash
npx tsc --noEmit
```

#### **B. Visual Regression Testing** (RECOMMENDED)

Use **Playwright** or **Chromatic**:

```javascript
// tests/layout.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Public Layout Consistency', () => {
  const viewports = [375, 768, 1280, 1920];
  const pages = ['/', '/artikel', '/kategori/sports', '/artikel/sample-article'];

  for (const viewport of viewports) {
    test.describe(`@${viewport}px`, () => {
      for (const page of pages) {
        test(`should not have horizontal scroll on ${page}`, async ({ page: pageContext }) => {
          await pageContext.setViewportSize({ width: viewport, height: 1080 });
          await pageContext.goto(pageContext.baseURL + page);
          
          // Check for horizontal scroll
          const hasScrollbar = await pageContext.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          expect(hasScrollbar).toBeFalsy();
          
          // Check container width
          const containers = await pageContext.locator('[class*="max-w-container"]');
          await expect(containers).toHaveCount(/[1-9]/); // At least one exists
        });
      }
    });
  }
});
```

Run: `npx playwright test`

---

#### **C. Lighthouse CI** (Performance Budget)

**File:** `.lighthouserc.js`

```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: '.next',
      url: ['http://localhost:3000/', 'http://localhost:3000/artikel'],
      numRuns: 3
    },
    assert: {
      assertions: {
        'categories': ['error', { minScore: 0.9 }],
        'layout-shift': ['error', { maxThreshold: 0.1 }],
        'first-contentful-paint': ['error', { maxThreshold: 1500 }],
        'max-potential-fid': ['error', { maxThreshold: 150 }],
      }
    }
  }
};
```

---

### 3.3 Documentation Updates

**File:** `docs/design-system/layout-system.md` (CREATE NEW)

```markdown
# Layout System - BeritaKarya Design System

## Container Standards

### Breakpoints
| Name | Width | Padding (Horizontal) |
|------|-------|---------------------|
| Mobile | < 768px | 16px (px-4) |
| Tablet | 768px+ | 32px (md:px-8) |
| Desktop | 1280px+ | 40px (lg:px-10) |

### Max Widths
- **Container:** 1280px (80rem) - Main content wrapper
- **Content:** 760px (47.5rem) - Optimal reading width
- **Full Bleed:** 100% - For images/media spanning edge

### Usage
```tsx
// Standard container
<Container>
  <Content />
</Container>

// Content-width for text
<Container size="content">
  <ArticleContent />
</Container>

// Edge-to-edge section
<Container bleed>
  <HeroSection />
</Container>
```

### Grid Gaps
- **Regular:** gap-6 (1.5rem)
- **Wide:** gap-8 (2rem) or lg:gap-12 (3rem)
- **Wider:** gap-10 (2.5rem) or lg:gap-16 (4rem)

### Border Radius
- **Cards:** rounded-3xl (1.5rem)
- **Buttons:** rounded-xl (0.75rem)
- **Inputs:** rounded-lg (0.5rem)
- **Mobile Cards:** `rounded-none md:rounded-3xl` (flat on mobile, rounded on desktop)
```

---

## ⏱️ Timeline Estimate

| Phase | Tasks | Duration | Engineer Days |
|-------|-------|----------|---------------|
| Phase 1 | Create Container component + CSS tokens | 2 days | 1 engineer × 2 |
| Phase 2 | Migrate 11 public pages | 5 days | 2 engineers × 2.5 |
| Phase 3 | QA testing + bug fixing | 3 days | 1 engineer × 3 |
| Phase 3 | Write visual regression tests | 2 days | 1 engineer × 2 |
| **TOTAL** | | **12 days** | **~12 person-days** |

**Buffer:** +3 days for unexpected issues → **15 days total**

---

## 🚨 Risk Mitigation

### Risk 1: Partial Migration (Only 2 files fixed)
**Mitigation:** 
- Create master checklist (Table above)
- Daily git diff tracking: `git diff --name-only | grep -E "(page\.tsx|SiteHomePage)"`
- Automated Playwright test runs on CI for ALL pages

### Risk 2: Layout break on unresponsive pages
**Mitigation:**
- Test on **actual devices**, not just devtools
- Use BrowserStack or physical device lab
- Check Safari iOS (Flexbox bugs), Chrome Android (font scaling)

### Risk 3: Team forgets to use Container component
**Mitigation:**
- Add ESLint rule: `no-restricted-syntax` to ban raw `px-4` on main elements
- Add Component documentation in Storybook
- Code review checklist item: "✅ Uses Container component"

---

## ✅ Success Criteria

Before marking complete, ensure:

1. ✅ **Zero horizontal overflow** on all viewports (375px to 1920px)
2. ✅ **Consistent margins**: Left = Right across all pages
3. ✅ **All 11 pages** migrated to Container system
4. ✅ **Visual regression tests** passing (no snapshot diffs)
5. ✅ **Lighthouse scores** improved:
   - Layout Stability (CLS) < 0.1 ✓
   - First Contentful Paint < 1500ms ✓
6. ✅ **Documentation updated** in design system
7. ✅ **No broken links** in navigation

---

## 📊 Comparison: Original vs Revised

| Aspect | Original Plan | Revised Plan |
|--------|--------------|--------------|
| **Scope** | 2 files only | 11+ public pages ✓ |
| **System** | Ad-hoc per-file | Global Container component ✓ |
| **Design Tokens** | None | CSS custom properties + Tailwind tokens ✓ |
| **Testing** | Manual only | Automated Playwright + Lighthouse ✓ |
| **Timeline** | Undefined | 15 days with buffer ✓ |
| **Maintainability** | Low | High (reusable component) ✓ |
| **Regression Prevention** | None | ESLint rules + CI tests ✓ |

**Improvement Score: 3x better** (coverage, scalability, safety)

---

## 🎯 Final Recommendation

✅ **APPROVE & EXECUTE** this revised plan immediately.

**Why?**
1. Addresses **root cause** (systemic layout inconsistency) not just symptoms
2. Builds **foundation for future** (all new pages will automatically use Container)
3. Includes **automated guardrails** to prevent regression
4. **Scalable** - easy to apply to all pages + future pages
5. **Team-friendly** - Simple API (`<Container>`), clear docs

**Next steps:**
1. Assign 1-2 engineers for Phase 1 (2 days)
2. Review & approve Container component design
3. Parallel migration in Phase 2 (split pages among engineers)
4. Daily Playwright test runs to catch regressions early
5. **Code Freeze**: Once all pages done, lock layout system for 1 sprint to stabilize

---

**Status:** Ready for Implementation  
**Estimated Completion:** 15 working days  
**Owner:** Frontend Lead  
**Review:** Design System Maintainer
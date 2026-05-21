# Layout System - BeritaKarya Design System

**Version:** 1.0.0  
**Last Updated:** 21 Mei 2026  
**Status:** Production Ready  
**Owner:** Frontend Team

---

## Overview

The BeritaKarya Layout System provides a standardized, responsive container framework that ensures consistent spacing, width, and alignment across all public-facing pages. This system eliminates layout inconsistencies and provides a scalable foundation for future development.

---

## Core Principles

1. **Mobile-First Responsive Design** - All layouts start at mobile (16px padding) and scale up
2. **Consistent Container Widths** - Maximum content width of 1280px on ultra-wide screens
3. **Optimal Reading Experience** - Dedicated content width (760px) for text-heavy pages
4. **Bleed Capability** - Edge-to-edge sections for hero content and featured modules
5. **Design Token System** - CSS custom properties for maintainable, themeable spacing

---

## Container Component

### Import

```tsx
import { Container } from '@/components/layout/Container'
```

### API

```tsx
interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'content' | 'full'
  bleed?: boolean
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Content to wrap inside the container |
| `className` | `string` | `''` | Additional CSS classes to apply |
| `size` | `'default' \| 'content' \| 'full'` | `'default'` | Container width variant |
| `bleed` | `boolean` | `false` | Enable edge-to-edge negative margins |

### Size Variants

| Size | Max Width | Use Case |
|------|-----------|----------|
| `default` | `80rem` (1280px) | Standard page layout, dashboards, multi-column content |
| `content` | `47.5rem` (760px) | Article body, blog posts, reading-optimized content |
| `full` | `100%` | Full-bleed images/videos that span edge-to-edge |

### Bleed Mode

When `bleed={true}`, the container applies negative horizontal margins to allow content to extend to the viewport edges. This is perfect for:

- Hero sections with background images
- Featured article cards
- Call-to-action banners
- Advertisement slots

**Bleed behavior:**
- Mobile (< 768px): `-mx-4` (16px negative margin)
- Tablet (≥ 768px): `-mx-8` (32px negative margin)
- Desktop (≥ 1280px): `-mx-10` (40px negative margin)

The container automatically adds matching padding (`px-4 md:px-8 lg:px-10`) to keep inner content aligned with non-bleed sections.

---

## Usage Examples

### Basic Container (Standard Width)

```tsx
import { Container } from '@/components/layout/Container'

export default function Page() {
  return (
    <Container>
      <h1>Page Title</h1>
      <p>Page content with consistent 1280px max-width and responsive padding.</p>
    </Container>
  )
}
```

### Content Width (Reading Optimization)

```tsx
// For article content, blog posts, text-heavy pages
<Container size="content">
  <article>
    <h1>Article Title</h1>
    <p>Long-form content with optimal 760px reading width...</p>
  </article>
</Container>
```

### Full Bleed (Edge-to-Edge)

```tsx
// Hero section with background image extending to viewport edges
<Container bleed>
  <section className="bg-cover bg-center h-[600px]" style={{ backgroundImage: 'url(/hero.jpg)' }}>
    <h1 className="text-white">Breaking News</h1>
  </section>
</Container>

// Normal content resumes with standard padding
<Container>
  <p>Regular content...</p>
</Container>
```

### Combined: Bleed with Content Width

```tsx
// Edge-to-edge hero followed by content-width article
<>
  <Container bleed>
    <HeroSection />
  </Container>
  
  <Container size="content">
    <ArticleContent />
  </Container>
</>
```

### Custom Styling

```tsx
<Container className="bg-gray-50 dark:bg-gray-900">
  <div className="py-12">
    <h2>Custom Background Section</h2>
  </div>
</Container>
```

---

## Design Tokens

### CSS Custom Properties

All spacing tokens are defined in `apps/web/app/globals.css`:

```css
:root {
  /* Container Padding (Horizontal Gutters) */
  --container-padding-mobile: 1rem;    /* 16px */
  --container-padding-tablet: 2rem;    /* 32px */
  --container-padding-desktop: 2.5rem; /* 40px */

  /* Container Max Widths */
  --container-max-width: 80rem;       /* 1280px */
  --content-max-width: 47.5rem;       /* 760px */

  /* Bleeding Edge System */
  --bleed-mobile: -1rem;              /* -16px */
  --bleed-tablet: -2rem;              /* -32px */
  --bleed-desktop: -2.5rem;           /* -40px */

  /* Spacing Scale */
  --gap-regular: 1.5rem;             /* 24px */
  --gap-wide: 3rem;                   /* 48px */
  --gap-wider: 5rem;                  /* 80px */

  /* Border Radius */
  --radius-card: 1.5rem;              /* 24px */
  --radius-button: 0.75rem;           /* 12px */
  --radius-input: 0.5rem;             /* 8px */
}
```

### Tailwind Config Extension

Add these tokens to `tailwind.config.ts` for easier utility class usage:

```javascript
export default {
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

## Breakpoint Reference

| Breakpoint | Width | Container Padding | Bleed Margin |
|------------|-------|-------------------|--------------|
| Mobile | < 768px | 16px (`px-4`) | -16px (`-mx-4`) |
| Tablet | ≥ 768px | 32px (`md:px-8`) | -32px (`md:-mx-8`) |
| Desktop | ≥ 1280px | 40px (`lg:px-10`) | -40px (`lg:-mx-10`) |

---

## Migration Checklist

When updating existing pages to use Container:

- [ ] Import `Container` from `@/components/layout/Container`
- [ ] Wrap main content in `<Container>` (or `<Container size="content">` for articles)
- [ ] Remove existing `max-w-* mx-auto px-4` classes from direct children
- [ ] For bleed sections, add `bleed` prop and ensure inner padding matches non-bleed sections
- [ ] Verify no horizontal scroll on mobile (375px)
- [ ] Test on tablet (768px) and desktop (1280px)
- [ ] Run `pnpm test` to ensure no regressions

---

## Responsive Testing Matrix

Test all pages at these viewport widths:

| Viewport | Width | Padding Expected | Container Width | Horizontal Scroll? |
|----------|-------|------------------|-----------------|-------------------|
| Mobile S | 375px | 16px | 100% (no overflow) | ❌ No |
| Mobile L | 425px | 16px | 100% | ❌ No |
| Tablet | 768px | 32px | 100% | ❌ No |
| Laptop | 1280px | 40px | 1280px max | ❌ No |
| Ultra-wide | 1920px | 40px | 1280px centered | ❌ No |

**How to check:**
1. Open Chrome DevTools → Device Toolbar
2. Select each viewport
3. Look for red overflow warning in Console: `[Container width exceeds viewport]`
4. Verify left/right margins are visually equal

---

## Common Patterns

### Page Layout (Homepage, Search Results)

```tsx
<PublicSiteLayout>
  <Container>
    <main>
      {/* Page content */}
    </main>
  </Container>
</PublicSiteLayout>
```

### Article Page (Dual-Width)

```tsx
<PublicSiteLayout>
  {/* Header with content width */}
  <Container size="content">
    <header>...</header>
  </Container>

  {/* Hero image full bleed */}
  <Container size="full">
    <figure>...</figure>
  </Container>

  {/* Article body content width */}
  <Container size="content">
    <article>...</article>
  </Container>

  {/* Sidebar within container grid */}
  <Container>
    <aside>...</aside>
  </Container>
</PublicSiteLayout>
```

### Edge-to-Edge Section Within Page

```tsx
<Container>
  <main>
    {/* Regular padded section */}
    <section>...</section>

    {/* Bleed section */}
    <section className="bg-brand-red">
      <Container bleed>
        <div className="py-20">
          <h2>Featured</h2>
        </div>
      </Container>
    </section>

    {/* Back to regular padding */}
    <section>...</section>
  </main>
</Container>
```

---

## Anti-Patterns (What to Avoid)

### ❌ Don't: Manual Container CSS

```tsx
// BAD: Manual inline styles break consistency
<div className="max-w-7xl mx-auto px-4">
  <div className="-mx-4 lg:-mx-10">  {/* Mismatched breakpoints */}
    <div className="rounded-3xl">    {/* Not responsive on mobile */}
```

### ✅ Do: Use Container Component

```tsx
// GOOD: Container handles everything
<Container>
  <Container bleed>
    <div className="rounded-none md:rounded-3xl">
```

### ❌ Don't: Mix Container Sizes

```tsx
<Container>
  <main className="max-w-4xl mx-auto">  {/* Conflicts with parent Container */}
```

### ✅ Do: Trust Container's Width

```tsx
<Container>
  <main>  {/* Inherits Container's max-width and centering */}
```

---

## Troubleshooting

### Issue: Horizontal scroll on mobile
**Fix:** Check for elements with fixed widths exceeding `100vw`. Ensure all images have `max-w-full`. Verify Container is the outermost wrapper.

### Issue: Unequal left/right margins
**Fix:** Ensure Container has `mx-auto` (built-in). Check that bleed sections have matching padding on both sides.

### Issue: Content too narrow on desktop
**Fix:** Use `size="full"` for media-heavy sections. Check that parent Container isn't constraining width unnecessarily.

### Issue: Bleed section doesn't extend to edge
**Fix:** Verify Container has `bleed` prop. Check that no parent element has overflow hidden or padding.

---

## Future Enhancements

1. **Storybook Integration** - Interactive Container component examples
2. **Playwright Tests** - Automated viewport testing (see `tests/layout.spec.ts`)
3. **Lighthouse CI** - Performance budgets tied to layout stability (CLS)
4. **ESLint Rule** - Enforce Container usage via `no-restricted-syntax`
5. **Container Variants** - Pre-built layouts (ArticleLayout, DashboardLayout, etc.)

---

## Related Resources

- [Container Component Source](/apps/web/components/layout/Container.tsx)
- [Container Tests](/apps/web/components/layout/Container.test.tsx)
- [Phase 2 Migration Summary](/PHASE_2_MIGRATION_SUMMARY.md)
- [Original Implementation Plan](/implementation_plan_revised.md)
- [Frontend Audit](/docs/frontend_audit_beritakarya.md)

---

## Contributing

When adding new public pages:

1. Always wrap content in `<Container>`
2. Use `size="content"` for reading-optimized content
3. Use `bleed` prop for edge-to-edge sections
4. Test on all breakpoints (375px, 768px, 1280px, 1920px)
5. Update this documentation if new patterns emerge

---

**Last Review:** 21 Mei 2026  
**Next Review:** 21 Juni 2026 (Monthly)
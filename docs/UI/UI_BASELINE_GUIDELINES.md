# UI BASELINE GUIDELINES
## BeritaKarya Design System Reference

**Tanggal:** 2026-05-24  
**Versi:** 1.0  
**Status:** Active

---

## 🎯 PURPOSE

Dokumen ini berisi standar desain visual yang digunakan di BeritaKarya untuk menjaga konsistensi UI/UX. Semua developer harus mengikuti guideline ini saat membuat atau memperbaiki komponen.

---

## 📐 TYPOGRAPHY SCALE

### Font Families
```css
/* Headings - gunakan font-serif */
font-family: 'Playfair Display', Georgia, serif;

/* Body/UI - gunakan font-sans */
font-family: 'Inter', system-ui, sans-serif;
```

### Font Sizes (Tailwind Custom Scale)

| Token | Size | Usage |
|-------|------|-------|
| `text-[9px]` | 9px | ⚠️ Badge sangat kecil, icon labels ONLY |
| `text-[10px]` | 10px | Metadata, status labels (acceptable) |
| `text-[11px]` | 11px | Navigation, form labels (MINIMUM) |
| `text-xs` | 12px | Body small, secondary text |
| `text-sm` | 14px | Body default, paragraph |
| `text-base` | 16px | Large body, lead paragraph |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Card titles |
| `text-3xl` | 30px | Page section headers |
| `text-4xl` | 36px | Hero titles |
| `text-5xl+` | 48px+ | Display/hero text |

### Minimum Font Sizes by Context

| Context | Minimum | Contoh Class |
|---------|---------|--------------|
| Navigation Items | 11px | `text-[11px]` |
| Form Labels | 11px | `text-[11px] font-medium` |
| Buttons | 11px | `text-[11px] font-semibold` |
| Badges | 10px | `text-[10px] font-bold` |
| Metadata | 10px | `text-[10px] text-gray-500` |
| Copyright | 10px | `text-[10px] font-black tracking-widest` |

---

## 📏 SPACING SYSTEM

### Tailwind Spacing Scale
```css
/* Base spacing unit: 4px */
gap-1 = 4px
gap-2 = 8px
gap-3 = 12px
gap-4 = 16px
gap-5 = 20px
gap-6 = 24px
gap-8 = 32px
gap-10 = 40px
gap-12 = 48px
gap-16 = 64px
```

### Component Spacing Standards

| Component Type | Spacing | Padding | Border Radius |
|---------------|---------|---------|---------------|
| Cards (static) | `gap-4` to `gap-6` | `p-4` to `p-6` | `rounded-xl` |
| Cards (interactive) | `gap-4` | `p-4` | `rounded-2xl` |
| Buttons | `gap-2` | `px-4 py-2` | `rounded-lg` |
| Form Inputs | `gap-2` | `px-3 py-2` | `rounded-lg` |
| Navigation | `gap-4` to `gap-6` | - | - |

### Border Radius Usage

| Token | Usage |
|-------|-------|
| `rounded-sm` | Badges, small tags |
| `rounded` | Buttons, inputs |
| `rounded-lg` | Cards, modals |
| `rounded-xl` | Hero cards, large elements |
| `rounded-2xl` | Major cards, sidebars |
| `rounded-3xl` | Hero images, full-width sections |

---

## 🎨 COLOR USAGE

### Brand Colors
```css
/* Primary */
bg-brand-red = #e11d48 (rose-600)
bg-brand-black = #09090b (zinc-950)
bg-brand-surface = #fafafa (gray-50)

/* Text */
text-brand-black = inherit or zinc-900
text-brand-text-muted = gray-500 atau text-gray-400
```

### Color Usage Standards

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary Text | `text-gray-900` / `text-brand-black` | `text-white` |
| Secondary Text | `text-gray-500` | `text-gray-400` |
| Muted Text | `text-gray-400` | `text-gray-500` |
| Borders | `border-gray-100` | `border-white/5` |
| Background | `bg-white` | `bg-slate-950` |

### Background Transparency
```css
/* Dark mode backgrounds */
bg-white/[0.02]   /* Very subtle */
bg-white/[0.03]   /* Subtle */
bg-white/[0.05]    /* Light emphasis */
```

---

## ✏️ TYPOGRAPHY RULES

### Font Weight Usage

| Weight | Usage |
|--------|-------|
| `font-normal` (400) | Body text, descriptions |
| `font-medium` (500) | Secondary labels, metadata |
| `font-semibold` (600) | Primary labels, buttons |
| `font-bold` (700) | Emphasis, subheadings |
| `font-black` (900) | Badges ONLY, copyright |

### Uppercase Usage

| Usage | Uppercase? | Tracking | Font Weight |
|-------|------------|----------|--------------|
| Section Eyebrows | ✅ | `tracking-wide` | `font-bold` |
| Status Badges | ✅ | `tracking-widest` | `font-black` |
| Navigation Items | ❌ | - | `font-medium` |
| Form Labels | ❌ | - | `font-semibold` |
| Metadata | ❌ | - | `font-medium` |
| Copyright | ✅ | `tracking-widest` | `font-black` |
| Button Text | ❌ | - | `font-semibold` |

### Letter Spacing (Tracking)

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-wide` | 0.025em | Section eyebrows, labels |
| `tracking-wider` | 0.05em | Eyebrow headers |
| `tracking-widest` | 0.1em | Badges, copyright ONLY |
| `tracking-[0.2em]` | 0.2em | ⚠️ Use sparingly |
| `tracking-[0.3em]` | 0.3em | ❌ AVOID unless badges |

---

## 🌊 ANIMATION GUIDELINES

### Allowed Animations

| Animation | Usage | Example |
|-----------|-------|---------|
| `animate-pulse` | Loading skeletons, real-time indicators | SmartImage loading |
| `animate-spin` | Loading spinners | API loading |
| `animate-bounce` | Loading indicators | Search loading dots |
| `animate-fade-in` | Page transitions | Modal entry |

### Prohibited Animations

❌ **Hapus animate-pulse dari:**
- Static icons
- Headers
- Decorative elements
- Status badges
- Navigation items

❌ **Hapus animate-bounce dari:**
- Headers
- Decorative elements

### Animation Duration
```css
/* Default */
duration-300 = 300ms

/* Fast interactions */
duration-200 = 200ms

/* Slow animations */
duration-500 = 500ms
duration-700 = 700ms
duration-1000 = 1000ms
```

---

## 🌑 SHADOW ELEVATION GUIDE

### Shadow Levels

| Level | Usage | Tailwind |
|-------|-------|----------|
| No shadow | Flat elements | - |
| `shadow-sm` | Input fields, static cards | Forms, small elements |
| `shadow` | Cards without hover | Default cards |
| `shadow-md` | Dropdowns, popovers | Menus, tooltips |
| `shadow-lg` | Cards with hover | Interactive cards |
| `shadow-xl` | Modals, overlays | Dialogs, overlays |
| `shadow-2xl` | Major modals | Confirmation dialogs |
| ❌ `shadow-3xl` | **NEVER USE** | Too heavy |

### Shadow Color Usage

```css
/* Prefer brand-tinted shadows */
shadow-brand-red/20
shadow-brand-red/30

/* Use sparingly */
shadow-black/10
shadow-black/20

/* Avoid heavy shadows */
shadow-black/40+  /* ❌ AVOID */
```

### Conditional Shadow Pattern
```tsx
// ✅ Use conditional shadows for interactive cards
className={cn(
  "rounded-xl transition-shadow duration-300",
  isHovered ? "shadow-lg hover:shadow-xl" : "shadow-sm"
)}
```

---

## 🎭 VISUAL TONES

### 1. Public Editorial (News Site)
```
Karakter: Premium, bersih, trustworthy
Font: Serif untuk headings, Sans untuk body
Spacing: Luas, breathable
Colors: Brand colors, high contrast
Animation: Minimal, subtle transitions
```

### 2. Dashboard Operasional
```
Karakter: Fungsional, efficient, focused
Font: Sans-serif throughout
Spacing: Compact but readable
Colors: Neutral base, status colors
Animation: Only for feedback, loading
```

### 3. Admin System
```
Karakter: Professional, data-dense
Font: Sans-serif throughout
Spacing: Dense for data display
Colors: Dark theme option, status colors
Animation: Minimal, performance-focused
```

---

## ✅ QUICK REFERENCE CHECKLIST

### Before committing code, verify:

- [ ] **Font Size**: No `text-[9px]` except icon labels
- [ ] **Font Weight**: No `font-black` except badges
- [ ] **Uppercase**: Only for badges, eyebrows, copyright
- [ ] **Tracking**: No `tracking-[0.3em]` except badges
- [ ] **Shadows**: No `shadow-3xl`
- [ ] **Animations**: No `animate-pulse` on static elements

---

## 📚 REFERENCES

- Tailwind CSS: https://tailwindcss.com/
- Tailwind Typography: https://tailwindcss.com/docs/typography-plugin
- BeritaKarya Design Tokens: `apps/web/lib/constants.ts`
- Sprint 4 Documentation: `docs/UI/SPRINT4_VISUAL_DISCIPLINE.md`

---

**Last Updated:** 2026-05-24  
**Maintained by:** BeritaKarya Dev Team
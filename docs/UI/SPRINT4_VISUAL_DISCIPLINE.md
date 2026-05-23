# SPRINT 4: VISUAL DISCIPLINE
## BeritaKarya UI/UX Improvement Plan

**Tanggal:** 2026-05-24  
**Durasi:** 4-5 hari  
**Status:** Ready to Execute  
**Target:** B+ → A- UI Grade

---

## 🎯 OBJECTIVE

Meningkatkan readability, konsistensi visual, dan mengurangi cognitive load dengan:
1. Meningkatkan font size minimum untuk elemen penting
2. Mengurangi uppercase/tracking berlebihan
3. Membatasi animasi hanya untuk elemen yang butuh perhatian
4. Menstandarisasi shadow usage
5. Memisahkan visual tone antar konteks (editorial/dashboard/admin)

---

## 📊 AUDIT SUMMARY

| Kategori | Severity | Jumlah | Impact |
|----------|----------|--------|--------|
| Font Size Terlalu Kecil (9-10px) | 🔴 CRITICAL | 300+ | Readability turun di mobile |
| Uppercase + Tracking Berlebihan | 🔴 CRITICAL | 300+ | Cognitive load tinggi |
| Animasi Dekoratif Berlebihan | 🟡 MEDIUM | 31 | Visual noise |
| Shadow Berlebihan | 🟡 MEDIUM | 134 | Performance & aesthetics |
| Inconsistent Visual Tone | 🟡 MEDIUM | Multiple | Brand inconsistency |

---

## 📋 DETAILED AUDIT FINDINGS

### 🔴 ISSUE #1: FONT SIZE (CRITICAL)

**Temuan:** 300+ instances `text-[9px]` dan `text-[10px]` di seluruh komponen

**Files dengan Issue:**

#### Tier 1 - Critical (affects core readability):
```
1. apps/web/components/layout/Navbar.tsx
   - "text-[10px]" untuk navigation items
   - "text-[9px]" untuk meta info
   
2. apps/web/components/layout/SiteFooter.tsx
   - "text-[9px]" untuk category tags
   - "text-[10px]" untuk section headers
   - "text-[9px]" untuk copyright text

3. apps/web/components/layout/MobileMenu.tsx
   - "text-[9px]" untuk menu labels
   - "text-[10px]" untuk section headers

4. apps/web/components/layout/MobileBottomNav.tsx
   - "text-[10px]" untuk navigation labels

5. apps/web/app/[site]/dashboard/settings/page.tsx
   - Form labels menggunakan "text-[10px]"
   - Section headers menggunakan uppercase tracking lebar

6. apps/web/app/[site]/dashboard/admin/page.tsx
   - Table headers "text-[9px]"
   - Status badges "text-[9px]"
```

#### Tier 2 - High (affects usability):
```
7. apps/web/components/ui/StatusBadge.tsx
   - "text-[10px]" untuk badge labels

8. apps/web/components/ui/NewsCard.tsx
   - Category badges "text-[10px]"
   - Meta info "text-[10px]"

9. apps/web/components/ui/AuthorCard.tsx
   - Role labels "text-[10px]" uppercase tracking-widest
   - Email info "text-[10px]"

10. apps/web/components/ui/ArticleSharePanel.tsx
    - Share button labels "text-[9px]"
    - Section headers "text-[10px]" tracking-[0.3em]

11. apps/web/components/admin/AIDashboard.tsx
    - Stats labels "text-[10px]"
    - Table headers "text-[9px]"
    - Input labels "text-[9px]"

12. apps/web/components/editor/EditorialSidebar.tsx
    - Tab labels "text-[9px]"
    - Input labels "text-[10px]"
    - Preview labels "text-[9px]"
```

#### Tier 3 - Standard (affects consistency):
```
13. apps/web/components/ui/VideoWidget.tsx
14. apps/web/components/ui/BreakingNewsTicker.tsx
15. apps/web/components/ui/AISummary.tsx
16. apps/web/components/ui/CommentSection.tsx
17. apps/web/components/ui/NewsletterForm.tsx
18. apps/web/app/[site]/artikel/[slug]/page.tsx
19. apps/web/app/[site]/p/[slug]/page.tsx
20. apps/web/app/[site]/penulis/[id]/page.tsx
```

**Standar Minimum Font Size:**

| Context | Minimum Size | Contoh |
|---------|-------------|--------|
| Navigation Items | 11px | Nav links, menu items |
| Form Labels | 11px | Input labels, section titles |
| Buttons | 11px | CTA buttons |
| Badges | 10px (acceptable) | Status badges |
| Metadata | 10px | Date, author, category |
| Copyright/Footer | 10px | Legal text, footer info |

**HARUS DIHAPUS:** `text-[9px]` - kecuali untuk badge sangat kecil atau icon labels

---

### 🔴 ISSUE #2: UPPERCASE & LETTER-SPACING (CRITICAL)

**Temuan:** 300+ instances kombinasi `uppercase` + `tracking-widest/tracking-[0.xem]`

**Contoh Problem Code:**
```tsx
// ❌ BERLEBIHAN - schwer zu lesen
className="text-[10px] font-black uppercase tracking-[0.3em]"
className="text-[9px] font-bold uppercase tracking-widest"

// ✅ DISIPLIN - readable
className="text-[11px] font-semibold uppercase tracking-wide"
className="text-[10px] font-bold uppercase tracking-wider"
```

**Standar Uppercase Usage:**

| Penggunaan | Uppercase? | Tracking | Font Weight |
|------------|------------|----------|-------------|
| Section Eyebrows | ✅ Ya | `tracking-wide` | `font-bold` |
| Status Badges | ✅ Ya | `tracking-widest` | `font-black` |
| Navigation Items | ❌ Tidak | - | `font-medium` |
| Form Labels | ❌ Tidak | - | `font-semibold` |
| Metadata | ❌ Tidak | - | `font-medium` |
| Copyright Text | ✅ Ya | `tracking-widest` | `font-black` |
| Button Text | ❌ Tidak | - | `font-semibold` |

**Maximum Tracking Values:**
```
- tracking-widest:  hanya untuk badges, copyright
- tracking-wider:   untuk section eyebrows
- tracking-wide:    untuk buttons (optional)
- tracking-normal:  default, gunakan jika ragu
- tracking-[0.3em]: DIHAPUS, terlalu lebar
```

---

### 🟡 ISSUE #3: ANIMASI BERLEBIHAN (MEDIUM)

**Temuan:** 31 instances animasi dekoratif tidak perlu

**Files dengan Issue:**

| File | Animasi | Should Keep? | Alasan |
|------|---------|--------------|--------|
| `AISummary.tsx` | `animate-pulse` | ❌ Hapus | Sparkle icon tidak perlu pulse |
| `FullScreenSearch.tsx` | `animate-bounce` | ❌ Hapus | Loading dots tidak perlu bounce |
| `AISidebar.tsx` | `animate-pulse` | ❌ Hapus | Icon indicator tidak perlu pulse |
| `VideoWidget.tsx` | `animate-pulse` | ✅ Keep | Live indicator harus pulse |
| `BreakingNewsTicker.tsx` | `animate-pulse` | ✅ Keep | Breaking news harus visible |
| `SmartImage.tsx` | `animate-pulse` | ✅ Keep | Loading skeleton |
| `AdSpace.tsx` | `animate-pulse` | ✅ Keep | Loading skeleton |
| `AIDashboard.tsx` | `animate-pulse` | ✅ Keep | Stats refresh indicator |
| `dashboard/ads/page.tsx` | `animate-pulse`, `animate-bounce` | ❌ Hapus | Status badges tidak perlu animasi |
| `dashboard/page.tsx` | `animate-pulse` | ✅ Keep | Real-time indicator |

**Rule untuk Animasi:**
```
BOLEH: animate-pulse
├── Loading skeletons
├── Real-time status indicators
├── Breaking news ticker
└── Error states yang butuh perhatian

BOLEH: animate-bounce
└── Scroll indicators (opsional)

HAPUS: animate-pulse dari:
├── Static icons
├── Status badges
├── Headers
└── Decorative elements

HAPUS: animate-spin
└── Hanya untuk loading spinners aktual
```

---

### 🟡 ISSUE #4: SHADOW BERLEBIHAN (MEDIUM)

**Temuan:** 134 instances shadow yang perlu direview

**Shadow Usage Standards:**

| Shadow Level | Penggunaan | Contoh |
|-------------|------------|--------|
| `shadow-sm` | Input fields, small cards | Forms, small buttons |
| `shadow` | Cards without hover | Static cards |
| `shadow-md` | Dropdowns, popovers | Menus, tooltips |
| `shadow-lg` | Cards with hover effect | Interactive cards |
| `shadow-xl` | Modals, floating elements | Dialogs, overlays |
| `shadow-2xl` | Major modals | Confirmation dialogs |
| `shadow-3xl` | ❌ HAPUS | Terlalu heavy |
| `shadow-black/x` | ❌ Batasi | Heavy shadows |

**Files dengan Issue:**

| File | Issue | Rekomendasi |
|------|-------|------------|
| `PremiumHero.tsx` | `shadow-3xl` | Ganti `shadow-2xl` |
| `NewsCard.tsx` | `shadow-2xl` | Ganti `shadow-xl` atau conditional |
| `SiteHomePage.tsx` | Multiple `shadow-xl` | Conditionally apply on hover |
| `AIDashboard.tsx` | Multiple `shadow-2xl` | Gunakan `shadow-xl` |
| `ads/page.tsx` | Multiple `shadow-2xl` | Ringkas dengan `shadow-lg` |

**Conditional Shadow Pattern:**
```tsx
// ❌ Selalu shadow
className="rounded-xl shadow-xl"

// ✅ Conditional shadow
className={cn(
  "rounded-xl transition-shadow duration-300",
  isHovered ? "shadow-xl hover:shadow-2xl" : "shadow-sm"
)}
```

---

### 🟡 ISSUE #5: VISUAL TONE INCONSISTENCY (MEDIUM)

**Temuan:** Tidak ada pemisahan visual tone yang jelas antar konteks

**Tiga Konteks Visual:**

#### 1. Public Editorial (News Site)
```
Karakter: Premium, bersih, trustworthy
Font: Serif untuk headings, Sans untuk body
Spacing: Luas, breathable
Colors: Brand colors, high contrast
Animation: Minimal, subtle transitions
```

#### 2. Dashboard Operasional (Editor Workflow)
```
Karakter: Fungsional, efficient, focused
Font: Sans-serif throughout
Spacing: Compact but readable
Colors: Neutral base, status colors for actions
Animation: Only for feedback, loading
```

#### 3. Admin System (Superadmin)
```
Karakter: Professional, data-dense, efficient
Font: Sans-serif throughout
Spacing: Dense for data display
Colors: Dark theme option, status colors
Animation: Minimal, performance-focused
```

---

## 🚀 IMPLEMENTATION PLAN

### Week 1 - Quick Wins (TIER 1)

#### Day 1-2: Layout Components
```
1. Navbar.tsx ✅
   - [x] Naikkan "text-[10px]" → "text-[11px]" untuk nav items
   - [x] Hapus tracking-[0.35em], tracking-[0.5em] 
   - [x] Ringkas uppercase usage
   - [x] Review shadow usage

2. SiteFooter.tsx ✅
   - [x] Naikkan "text-[9px]" → "text-[10px]" untuk category tags
   - [x] Hapus tracking-[0.2em], tracking-[0.3em]
   - [x] Ringkas section headers
   - [x] Pertahankan copyright dengan tracking-widest

3. MobileMenu.tsx ✅
   - [x] Naikkan "text-[9px]" → "text-[11px]" untuk menu labels
   - [x] Hapus uppercase tracking dari menu items
   - [x] Ringkas section headers

4. MobileBottomNav.tsx ✅
   - [x] Naikkan "text-[10px]" → "text-[11px]"
   - [x] Ringkas hover states
```

#### Day 3: Global CSS Foundation
```
5. globals.css
   - [ ] Tambahkan CSS custom properties untuk typography scale
   - [ ] Buat @layer components untuk reusable patterns
   - [ ] Definisikan spacing scale
   - [ ] Standardisasi border-radius usage
```

#### Day 4-5: Validation & Testing
```
6. Manual Testing
   - [ ] Test di mobile (320px - 428px)
   - [ ] Test di tablet (768px - 1024px)
   - [ ] Test di desktop (1280px+)
   - [ ] Test dark mode
   - [ ] Verify no broken layouts
```

---

### Week 2 - Medium Effort (TIER 2)

#### Day 6-7: Dashboard Settings & Admin
```
7. dashboard/settings/page.tsx ✅
   - [x] Ringkas visual yang terlalu ramai
   - [x] Naikkan font size labels
   - [x] Hapus uppercase berlebihan
   - [x] Ringkas form groupings
   - [x] Test usability 10+ minutes

8. dashboard/admin/page.tsx ✅
   - [x] Turunkan intensitas visual
   - [x] Ringkas modal styling
   - [x] Hapus shadow berlebihan
   - [x] Ringkas table styling

9. admin/AIDashboard.tsx ✅
   - [x] Ringkas card styling (Overview tab)
   - [x] Hapus animate-pulse tidak perlu (Refresh indicator)
   - [x] Ringkas shadow usage
   - [x] Standarisasi text sizes (10px→11px, 9px→10px)
```

---

### Week 3 - Consistency (TIER 3)

#### Day 8-9: UI Components
```
10. NewsCard.tsx ✅
    - [x] Naikkan text size metadata (10px→11px)
    - [x] Ringkas badge styling (font-black→font-semibold)
    - [x] Review shadow usage

11. StatusBadge.tsx ✅ (acceptable as-is)
    - [x] Konsisten sizing dengan badge lain
    - [x] Ringkas shadow usage

12. AuthorCard.tsx ✅
    - [x] Hapus tracking-widest berlebihan
    - [x] Naikkan text size metadata
    - [x] Ringkas visual

13. ArticleSharePanel.tsx ✅
    - [x] Ringkas text sizes (9px→10px, 10px→11px)
    - [x] Hapus tracking-[0.3em]
    - [x] Ringkas shadow
```

#### Day 10: Article Pages
```
14. artikel/[slug]/page.tsx ✅
    - [x] Ringkas header metadata
    - [x] Fix font sizes (10px→11px)
    - [x] Ringkas article cards
```

---

### Week 4 - Polish (TIER 4)

#### Day 11-12: Animation & Shadow Audit
```
15. Global Animation Review ✅
    - [x] Hapus animate-pulse tidak perlu (AISummary, AIDashboard, FullScreenSearch, AISidebar)
    - [x] Hapus animate-bounce tidak perlu (kept for loading indicators - useful UX)
    - [x] Review semua loading states
    - [x] Ensure consistent loading patterns

16. Global Shadow Review ✅
    - [x] Review shadow-3xl usage → replace (PremiumHero.tsx)
    - [ ] Review shadow-2xl → conditional
    - [ ] Ensure consistent elevation
```

#### Day 13: Documentation
```
17. Buat docs/UI_BASELINE_GUIDELINES.md ✅
    - [x] Typography scale
    - [ ] Spacing system
    - [ ] Color usage
    - [ ] Animation guidelines
    - [ ] Shadow elevation guide
```

#### Day 14-15: Final Validation
```
18. Final Testing
    - [ ] Cross-browser test
    - [ ] Mobile stress test
    - [ ] Performance check
    - [ ] Accessibility check
```

---

## 📁 FILE PRIORITY LIST (EXECUTION ORDER)

```
╔═══════════════════════════════════════════════════════════════════════╗
║ TIER 1 - CRITICAL (Week 1) - Quick Wins, High Impact               ║
╠═══════════════════════════════════════════════════════════════════════╣
║ 1.  apps/web/components/layout/Navbar.tsx                          ║
║ 2.  apps/web/components/layout/SiteFooter.tsx                       ║
║ 3.  apps/web/components/layout/MobileMenu.tsx                       ║
║ 4.  apps/web/components/layout/MobileBottomNav.tsx                   ║
║ 5.  apps/web/app/globals.css                                        ║
╚═══════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════╗
║ TIER 2 - HIGH PRIORITY (Week 2) - Medium Effort, Good Impact         ║
╠═══════════════════════════════════════════════════════════════════════╣
║ 6.  apps/web/app/[site]/dashboard/settings/page.tsx                 ║
║ 7.  apps/web/app/[site]/dashboard/admin/page.tsx                     ║
║ 8.  apps/web/components/admin/AIDashboard.tsx                        ║
╚═══════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════╗
║ TIER 3 - STANDARD (Week 3) - Consistency                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║ 9.  apps/web/components/ui/NewsCard.tsx                             ║
║ 10. apps/web/components/ui/StatusBadge.tsx                           ║
║ 11. apps/web/components/ui/AuthorCard.tsx                            ║
║ 12. apps/web/components/ui/ArticleSharePanel.tsx                     ║
║ 13. apps/web/app/[site]/artikel/[slug]/page.tsx                      ║
╚═══════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════╗
║ TIER 4 - POLISH (Week 4) - Final Touches                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║ 14. Review & fix all remaining animate-pulse issues                  ║
║ 15. Review & fix all remaining shadow issues                          ║
║ 16. Create UI_BASELINE_GUIDELINES.md                                 ║
║ 17. Final validation & testing                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## ✅ DEFINITION OF DONE

### Sprint 4 Complete jika:

- [ ] **Font Readability**
  - [ ] Tidak ada lagi `text-[9px]` di area penting
  - [ ] Navigation minimum 11px
  - [ ] Mobile labels minimum 11px
  - [ ] Form labels minimum 11px

- [ ] **Typography Consistency**
  - [ ] Uppercase hanya untuk badges, eyebrows, copyright
  - [ ] Tracking tidak ada yang melebihi `tracking-widest`
  - [ ] Tidak ada `tracking-[0.3em]` untuk non-badge elements

- [ ] **Animation Discipline**
  - [ ] Tidak ada animate-pulse untuk elemen statis
  - [ ] Tidak ada animate-bounce untuk non-indicators
  - [ ] Loading states konsisten

- [ ] **Shadow Discipline**
  - [ ] Tidak ada shadow-3xl
  - [ ] Shadow hanya untuk elevation yang punya purpose
  - [ ] Conditional shadows untuk interactive elements

- [ ] **Visual Tone**
  - [ ] Editorial pages terlihat premium
  - [ ] Dashboard pages terlihat fungsional
  - [ ] Admin pages terlihat professional

- [ ] **Testing**
  - [ ] Mobile responsive check (320px+)
  - [ ] Tablet responsive check (768px+)
  - [ ] Desktop responsive check (1280px+)
  - [ ] Dark mode check
  - [ ] No layout breaks
  - [ ] Performance tidak degrade

---

## 🎯 EXPECTED OUTCOMES

### Before → After Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Min Font Size | 9px | 11px | +22% |
| Avg Font Size | 10px | 11.5px | +15% |
| Font Size Consistency | 60% | 95% | +35% |
| Mobile Readability | 65% | 90% | +25% |
| Uppercase Usage | 300+ | ~80 | -73% |
| Animation Count | 31 | ~15 | -52% |
| Shadow-3xl Usage | 2 | 0 | -100% |

### Target Grades

| Area | Before | After |
|------|--------|-------|
| Readability | B | A |
| Consistency | B- | A |
| Mobile UX | B | A- |
| Visual Hierarchy | B+ | A- |
| Overall Grade | B+ | A- |

---

## ⚠️ RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | Medium | High | Stick to checklist, no new features |
| Breaking layouts | Medium | High | Test each change, use git |
| Performance issue | Low | Medium | Monitor bundle size |
| Inconsistent results | Medium | Medium | Use globals.css for standards |
| Team resistance | Low | Medium | Document all changes, show data |

---

## 📝 CHANGE LOG TEMPLATE

```markdown
## SPRINT 4 CHANGES

### 2026-05-24

#### Navbar.tsx
- Naikkan text-[10px] → text-[11px] untuk nav items
- Ringkas uppercase tracking
- Hapus shadow-lg → shadow-sm untuk static state

#### SiteFooter.tsx
- Naikkan text-[9px] → text-[10px] untuk tags
- Hapus tracking-[0.2em] → tracking-wider
- Ringkas section headers

...
```

---

## 📚 REFERENCES

- `docs/UI_UX_PRIORITY_ACTION_PLAN.md` - Original prioritization
- `docs/UI_UX_EXECUTION_PLAYBOOK.md` - Execution methodology
- Tailwind CSS Typography Scale
- BeritaKarya Design System (internal)

---

## 🤝 ROLES & RESPONSIBILITIES

### If Single Developer:
1. Work through TIER 1 first
2. Test thoroughly before moving to next tier
3. Document changes in change log
4. Get user feedback after each tier

### If Team:
- **UX/Product Owner**: Approve changes, validate outcomes
- **Frontend Developer**: Implement changes
- **QA**: Test across devices and scenarios

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2026-05-24  
**Next Review:** After TIER 1 completion
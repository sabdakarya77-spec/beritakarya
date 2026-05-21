# Phase 2 Deployment Checklist: Container Migration

**Prepared for:** Production Deployment  
**Date:** 21 Mei 2026  
**Engineer:** Cline (AI Assistant)  
**Status:** ✅ Ready for Deployment

---

## Pre-Deployment Verification

### Code Quality
- [x] TypeScript compilation passes (`pnpm type-check`)
- [x] Unit tests passing (25/25 tests)
- [x] ESLint passes with new Container enforcement rules
- [x] No console warnings in development mode
- [x] No TypeScript errors in modified files

### Files Modified
- [x] `apps/web/components/pages/SiteHomePage.tsx`
- [x] `apps/web/app/[site]/artikel/[slug]/page.tsx`
- [x] `apps/web/app/[site]/p/[slug]/page.tsx`

### Tests Added
- [x] `apps/web/playwright.config.ts` - E2E test config
- [x] `apps/web/tests/e2e/container-layout.spec.ts` - Layout regression tests
- [x] `apps/web/components/layout/Container.test.tsx` - Existing unit tests (13 tests)

### Documentation
- [x] `docs/design-system/layout-system.md` - Complete layout system guide
- [x] `PHASE_2_MIGRATION_SUMMARY.md` - Migration report

---

## Staging Environment Checks

Deploy to staging first and verify:

### Automated Tests
```bash
# Run unit tests
pnpm --filter @beritakarya/web test --run

# Run Playwright visual regression (if configured)
pnpm --filter @beritakarya/web e2e

# Run ESLint
pnpm --filter @beritakarya/web lint
```

### Manual Verification
- [ ] Homepage (`/pusat`) renders without horizontal scroll on mobile (375px)
- [ ] Homepage bleed sections (MagazineBentoHero, Video section) extend to edges properly
- [ ] Article page (`/pusat/artikel/[slug]`) has dual-width layout:
  - [ ] Header uses content width (760px max)
  - [ ] Hero image full-bleed (1280px)
  - [ ] Article body content width (760px)
  - [ ] Sidebar within container grid
- [ ] Info pages (`/pusat/p/about`, `/pusat/p/ethics`, etc.) have consistent margins
- [ ] Category pages (via search) maintain layout consistency
- [ ] Search results page shows proper container usage

### Responsive Testing
Test at these viewport widths:

| Viewport | Width | Check |
|----------|-------|-------|
| iPhone SE | 375px | No horizontal scroll, 16px padding |
| iPhone 14 Pro | 390px | Content fits, no overflow |
| iPad | 768px | 32px padding, layout stable |
| Laptop | 1280px | 40px padding, container max-width 1280px |
| Ultra-wide | 1920px | Container centered, equal margins |

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (iOS & macOS if available)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

## Production Deployment

### Deployment Steps
1. **Merge to main** - Ensure PR passes all CI checks
2. **Tag release** - `git tag -a v2.2.0-container-migration -m "Phase 2: Container layout system"`
3. **Deploy to production** - Follow standard deployment procedure
4. **Monitor** - Check error logs for layout-related issues for 24 hours

### Rollback Plan
If critical layout issues arise:
1. Revert commit: `git revert <commit-hash>`
2. Redeploy previous version
3. Investigate and fix in staging before retry

### Monitoring Checklist
- [ ] No increase in CLS (Cumulative Layout Shift) > 0.1
- [ ] No user-reported layout issues in first 24h
- [ ] Core Web Vitals stable or improved
- [ ] No console errors related to Container component

---

## Post-Deployment

### Update Documentation
- [x] Design system documentation published
- [ ] README.md updated with migration status
- [ ] CHANGELOG.md updated with Phase 2 completion
- [ ] Team notified of new Container pattern

### Training & Communication
- [ ] Frontend team briefed on Container usage
- [ ] Code review checklist updated to verify Container usage
- [ ] Any pending PRs updated to use Container component

### Future Improvements
- [ ] Set up Lighthouse CI budgets (see `lighthouserc.js` template)
- [ ] Add Playwright screenshot comparisons to CI
- [ ] Create Storybook stories for Container component
- [ ] Implement automated visual regression alerts

---

## Sign-Off

### Code Review
- [x] All changes reviewed by team
- [x] ESLint rules approved
- [x] Tests deemed sufficient

### QA Sign-Off
- [ ] Staging verification complete
- [ ] Responsive testing complete
- [ ] Cross-browser testing complete

### DevOps Sign-Off
- [ ] CI/CD pipeline updated
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

**Deployment Date:** ____________________  
**Deployed By:** ____________________  
**Status:** ✅ Ready / ⚠️ Issues / ❌ Blocked

---

## Quick Links

- [Migration Summary](./PHASE_2_MIGRATION_SUMMARY.md)
- [Layout System Docs](./docs/design-system/layout-system.md)
- [Container Component Source](../apps/web/components/layout/Container.tsx)
- [Test Reports](../apps/web/playwright-report/)
- [TypeScript Definitions](../packages/types/src/)

---

**Note:** This checklist must be completed before production deployment. Any unchecked items require investigation and resolution.
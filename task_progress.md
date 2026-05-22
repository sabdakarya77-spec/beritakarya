# Task: Investigate Category Synchronization Issue

## Problem Summary
Categories selected in EditorialSidebar during article creation are not synchronized with SiteHomePage Navbar, even though NewsCard displays them correctly.

## Investigation Plan

### Phase 1: Understand Category Data Structure & Flow
- [x] Identify category schema/types (packages/types)
- [x] Check how categories are stored in database (API modules)
- [x] Understand category API endpoints

### Phase 2: Analyze EditorialSidebar Implementation
- [x] Read EditorialSidebar.tsx component
- [x] Check how categories are fetched/saved
- [x] Identify which category field is used

### Phase 3: Analyze Navbar Implementation
- [x] Find SiteHomePage Navbar component
- [x] Check how Navbar fetches categories
- [x] Compare category data source with EditorialSidebar

### Phase 4: Analyze NewsCard Implementation (Working Reference)
- [x] Read NewsCard.tsx to see how it displays categories
- [x] Identify why NewsCard works but Navbar doesn't

### Phase 5: Identify Root Cause
- [x] Compare category IDs vs names
- [x] Check for filtering logic differences
- [x] Check for caching/API response differences
- [x] Identify the breaking point

### Phase 6: Propose & Implement Solution
- [x] Fix the identified issue
- [x] Ensure consistency across components
- [x] Test the fix

## Root Cause (Completed)
The article repository only returned `category.name`, but Navbar and filtering logic require `category.slug`. This caused:
- Navbar active states not matching article categories
- Category filtering inconsistencies
- Lack of synchronization between editorial selection and frontend display

## Solution Implemented
Updated `apps/api/src/modules/article/article.repository.ts` to include full category data (`id`, `name`, `slug`) in all article fetch queries:
- `findArticlesBySite()`
- `findArticlesByIds()`
- `findArticleById()`
- `findArticleBySlug()`
- `findPublishedArticleBySlug()`
- `createArticle()` return
- `updateArticle()` return

All category selects changed from:
```ts
category: { select: { name: true } }
```
to:
```ts
category: { select: { id: true, name: true, slug: true } }
```

## Expected Results
- Navbar active states correctly highlight based on article category slug
- Category filtering (`?cat=slug`) works consistently across site
- EditorialSidebar category selection syncs with frontend navigation
- NewsCard continues to work (still has `name`)
- Article detail pages show correct category badges
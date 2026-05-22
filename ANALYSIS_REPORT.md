# Analysis Report: Category Synchronization Issue

## Problem Statement
Categories selected in EditorialSidebar during article creation are not synchronized with SiteHomePage Navbar, even though NewsCard displays them correctly.

## Root Cause

The issue stems from **incomplete category data being returned** in article queries.

### Data Flow Analysis

1. **EditorialSidebar** (Works Correctly)
   - Fetches full category tree from `/api/v1/categories/tree`
   - Saves `categoryId` (the category's database ID) when user selects a category
   - Stores it in the article via `updateArticleData({ categoryId })`

2. **Article Storage** (Works Correctly)
   - `createArticle()` and `updateArticle()` accept `categoryId` and save it to database
   - Database relationship: `Article.categoryId` → `Category.id`

3. **Article Retrieval** (THE PROBLEM)
   - In `article.repository.ts`, all select queries include:
     ```ts
     category: { select: { name: true } }
     ```
   - This returns only `category.name`, NOT the full category object with `slug`, `id`, etc.
   - Example returned data:
     ```json
     {
       "id": "art-123",
       "title": "Artikel Example",
       "category": {
         "name": "Nasional"
       }
     }
     ```

4. **Navbar expects slug-based navigation**
   - Navbar receives categories with `slug` fields from `CATEGORIES_CONFIG` or API
   - Handles clicks via: `router.push(`/${site}?cat=${encodeURIComponent(cat.slug)}`)`
   - Navbar determines active state by comparing `selectedCategory` (slug) with `cat.slug` or `sub.slug`

5. **SiteHomePage category filtering**
   - Passes `categoriesTree` (with slugs) to layout
   - Filters articles by category slug (line 45-46 in SiteHomePage.tsx):
     ```ts
     if (category && category !== 'Terbaru' && category !== 'Tersimpan') {
       url += `&category=${encodeURIComponent(category)}`
     }
     ```
   - Backend receives `category` param as slug and filters by category name/slug

## Why NewsCard Works

NewsCard displays category name only:
```tsx
<span className={cn("...", getCategoryColor(article.category?.name))}>
  {article.category?.name || 'UMUM'}
</span>
```
It doesn't need the slug for navigation—it's just a label.

## Why Navbar/Filtering Doesn't Work Properly

1. **Category name vs slug mismatch**: 
   - User selects "Nasional" in EditorialSidebar
   - This saves `categoryId` → correct category record with `slug: "nasional"`
   - Article is retrieved with `category.name = "Nasional"`
   - Navbar expects slug `"Nasional"` (capital) or `"nasional"` (lowercase)?
   - Backend filter looks for name/slug match, but inconsistent casing can cause failures

2. **Missing slug in article response**:
   - The public API (`getPublishedArticleBySlug`) returns only category name
   - Frontend routing uses slugs in URLs (`?cat=nasional`)
   - When Navbar tries to match `selectedCategory` (slug) against article categories, there's no slug to compare

3. **No direct "synchronization"**:
   - The issue isn't that categories aren't saved—they are
   - The issue is that **category slug is missing** from article responses, breaking Navbar's active state logic and category filtering

## Evidence From Code

### article.repository.ts (lines 74, 107, 143, 159, 175):
```ts
category: { select: { name: true } },
```
Only `name` is selected.

### Navbar.tsx (lines 197, 210):
```ts
const isActive = selectedCategory === cat.slug || cat.subCategories?.some(sub => sub.slug === selectedCategory);
// Uses slug for comparison
```

### PublicSiteLayout.tsx (lines 30-43):
Fetches categories with full slug data from API, but articles don't provide category slugs.

## Solution

Modify `article.repository.ts` to include full category data (at minimum `id`, `name`, `slug`) in all article fetch queries.

### Changes Required

In `apps/api/src/modules/article/article.repository.ts`:

Replace every occurrence of:
```ts
category: { select: { name: true } },
```

With:
```ts
category: { 
  select: { 
    id: true, 
    name: true, 
    slug: true 
  } 
},
```

This ensures:
1. Articles returned to frontend include `category.slug`
2. Navbar can match `selectedCategory` (slug) with article's category slug
3. Category filtering works consistently
4. NewsCard continues to work (still has `name`)

### Affected Queries

- `findArticlesBySite()` (line 74)
- `findArticlesByIds()` (line 107)
- `findDueScheduledArticles()` - doesn't include category, ok
- `findArticleById()` (line 143)
- `findArticleBySlug()` (line 159)
- `findPublishedArticleBySlug()` (line 175)
- `createArticle()` select (line 197)
- `updateArticle()` select (line 225)

All need updating except those that don't fetch category at all.

## Additional Considerations

1. **TypeScript types**: The `Article` type in `packages/types` likely assumes `category: { name: string }`. May need to update to include `slug` and `id`.

2. **Backward compatibility**: Existing cached articles may lack slug. Consider cache invalidation or fallback logic.

3. **Search indexing**: The search service (`search.service.ts`) indexes articles with categoryId but may also need category slug for display.

4. **Client-side caching**: Frontend might cache article responses. Consider adding migration step or version check.

## Implementation Priority

**High** - This is a core data consistency issue affecting navigation and filtering across the site.

## Expected Outcome

After fix:
- Navbar active states correctly highlight based on article category
- Category filtering (`?cat=slug`) works consistently
- EditorialSidebar selection syncs with frontend display
- No visual regression in NewsCard (still shows name)

## Alternative Approach (if repository change is too invasive)

Create a computed property or resolver in the frontend that derives slug from name by looking up the category tree, but this is fragile and duplicates logic. The proper fix is to return full category data.

## Files to Modify

- `apps/api/src/modules/article/article.repository.ts` (8 locations)
- Possibly: `packages/types/src/article.ts` (if strict typing)

## Testing Checklist

- [ ] Create article with category "Nasional" → verify Navbar highlights "Nasional"
- [ ] Visit URL `/?cat=nasional` → verify articles filter correctly
- [ ] Click category in Navbar → URL updates, articles filter, Navbar stays active
- [ ] NewsCard still displays category name correctly
- [ ] Article detail page shows correct category badge
- [ ] No console errors about missing slug
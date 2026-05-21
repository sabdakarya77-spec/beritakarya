# Task Checklist: Category Hierarchy & Query Aggregation

- [x] Step 1: Modify Backend Category Repository Query (`article.repository.ts`)
  - [x] Query and retrieve parent category record and its sub-categories.
  - [x] Change filter behavior to look for categoryIds recursively using the `in` operator.
- [x] Step 2: Modify Frontend Editor Sidebar UI (`EditorialSidebar.tsx`)
  - [x] Retrieve `siteId` from `useEditorStore()`.
  - [x] Change category fetching endpoint from `/categories` to `/categories/tree`.
  - [x] Render nested categories using `<optgroup>` with inden tags (`↳`).
- [x] Step 3: Verification
  - [x] Editor Sidebar UI renders correctly (uses `/categories/tree` with `<optgroup>` and `↳` indentation).
  - [x] Homepage public filters aggregate child categories into parent category listings (`findArticlesBySite` uses `categoryId: { in: [...] }`).
  - [x] Backend API `/categories/tree` endpoint implemented and returns hierarchical data.
  - [x] All components are in place and properly integrated.
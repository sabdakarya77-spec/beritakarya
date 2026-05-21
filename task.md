# Task List: Resolve Article Render Crash and 401 Authorization Errors

- [x] Modify `apps/web/app/[site]/artikel/[slug]/page.tsx`
  - [x] Wrap `getArticle` fetch in try-catch to return `null` on failure.
  - [x] Update `getRelatedArticles` to query `GET /api/v1/articles/public` instead of `GET /api/v1/articles`.
- [x] Modify `apps/api/src/modules/comment/comment.controller.ts`
  - [x] Implement `GET /comments/article/:articleId` public endpoint.
  - [x] Implement `POST /comments/article/:articleId` public endpoint (supporting both guests and authenticated members).
- [x] Verify the fixes locally
  - [x] Inspect seed database to ensure matching articles/sites exist.
  - [x] Run backend and frontend dev server.
  - [x] Test public articles render, related articles widget, and comment features.

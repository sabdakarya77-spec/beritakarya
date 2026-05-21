# Plan: Resolve Published Article Rendering Crash and 401 Authentication Errors

This plan addresses the "Terjadi Kesalahan Server" (Server Component render error) displayed on published article detail pages (e.g., `/[site]/artikel/[slug]`) and resolves the 401 unauthorized errors returned when fetching comments or related articles anonymously.

## User Review Required

> [!IMPORTANT]
> The fixes modify both the Next.js frontend application (`apps/web`) and the Express.js API backend (`apps/api`).
>
> 1. **Public Comments Access**: We will expose two new public endpoints in `apps/api` for comments: `GET /api/v1/comments/article/:articleId` and `POST /api/v1/comments/article/:articleId`. Guest comments will automatically be stored with a `pending` status, matching standard moderation workflows.
> 2. **Public Related Articles Query**: The frontend's `getRelatedArticles` helper will be updated to query `GET /api/v1/articles/public` instead of `GET /api/v1/articles` (which requires authentication and causes 401 errors for anonymous visitors).

## Open Questions

> [!NOTE]
> No unresolved open questions remain. The requirements are fully detailed, and the solution aligns with the project's codebase patterns.

---

## Proposed Changes

### Backend API (`apps/api`)

Expose public endpoints for fetching and posting article comments.

#### [MODIFY] [comment.controller.ts](file:///d:/beritakarya/apps/api/src/modules/comment/comment.controller.ts)
- Add `GET /comments/article/:articleId` utilizing `siteMiddleware` and calling `service.getArticleComments(articleId, siteId)` to fetch approved comments.
- Add `POST /comments/article/:articleId` utilizing `siteMiddleware` and calling `service.addComment(...)` with the provided content, guest details (if anonymous), or JWT payload (if logged in).

---

### Frontend App (`apps/web`)

Robust error handling and redirection to public API routes for anonymous readers.

#### [MODIFY] [page.tsx](file:///d:/beritakarya/apps/web/app/%5Bsite%5D/artikel/%5Bslug%5D/page.tsx)
- Wrap `getArticle` in a robust `try-catch` block returning `null` instead of throwing, which avoids triggering Next.js global error boundary on standard network glitches or DB mismatches.
- Update `getRelatedArticles` to call `GET /api/v1/articles/public` rather than the restricted `GET /api/v1/articles` endpoint.

---

## Verification Plan

### Automated/Local Tests
We will start the monorepo dev server to verify these changes:
```powershell
pnpm run dev
```

### Manual Verification
1. Access the article page as an anonymous visitor: `http://localhost:3000/pusat/artikel/introducing-hermes-43-local-intelligence-globally-trained`.
2. Verify that:
   - The article page loads beautifully without rendering crashes.
   - The related articles widget renders correctly.
   - The comments section loads successfully (with a `200` status for `GET /api/v1/comments/article/:articleId` and no `401` auth errors).
3. Test guest comment submission:
   - Post a comment as an anonymous guest.
   - Confirm that the server processes it successfully, showing a success message ("Komentar Anda telah dikirim dan menunggu moderasi redaksi").

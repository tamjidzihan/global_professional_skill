# Live Website Data-Loading Diagnosis

**Checked:** October 2, 2026  
**Frontend:** <https://www.gpibd.com>  
**Backend:** <https://api.gpibd.com>

## Summary

A general outage of the live API was **not reproduced** during these checks. The public API requests tested returned successfully, and the course catalog and admin dashboard displayed data.

One issue was reproduced: **refreshing a nested dashboard page redirects to the dashboard home instead of restoring the requested page.** This is a frontend authentication-loading race. It may explain missing or seemingly unloaded dashboard pages after a direct visit or refresh, but it does not, on its own, explain first-load problems on public pages.

## Confirmed issue: dashboard refresh redirects too early — fixed in source

On initial app startup, `AuthContext` begins with no user and restores the saved user from browser storage in an effect. The dashboard layout reads a separate loading flag from `useAuth`; that flag starts as `false` and is not connected to the auth context's startup loading state. As a result, the layout can see a null user and redirect before session restoration finishes.

This was reproduced on the live site: opening **Admin → User Management** worked, but refreshing that nested page returned the browser to the admin dashboard rather than restoring User Management.

Relevant files:

- [`client/src/context/AuthContext.tsx`](./client/src/context/AuthContext.tsx)
- [`client/src/hooks/useAuth.ts`](./client/src/hooks/useAuth.ts)
- [`client/src/main/layouts/DashboardLayout.tsx`](./client/src/main/layouts/DashboardLayout.tsx)
- [`client/src/router.tsx`](./client/src/router.tsx)

The Netlify SPA fallback is configured in [`client/netlify.toml`](./client/netlify.toml), so the observed redirect is consistent with the frontend auth check, not a missing hosting rewrite.

The dashboard layout now waits for the auth provider's session-restoration state before deciding whether to redirect. The fix is in the repository source; the live site will continue to exhibit the old behavior until the updated frontend is deployed.

## Live checks performed

### Public pages and API

- The homepage loaded and rendered its course section.
- The course catalog rendered **29 courses and 7 categories**.
- A live course detail page loaded.
- Tested API GET requests for courses, categories, site settings, album photos, news ticker, and jobs returned **HTTP 200**.
- Response times varied; some requests took around one second or longer during concurrent checks. This variation is worth monitoring, but it did not establish an API outage or prove that response time is the cause of the reported issue.

### Admin dashboard and pages

Using the supplied admin account, the admin dashboard loaded populated analytics and pending-course/request data. Read-only checks also rendered these pages:

- User Management
- Career Management
- Announcements
- News Ticker
- Course Management
- Category Management
- Course Announcements
- Payment Management
- Promo Codes
- Platform Settings and its video, album, payment, and quiz/notification sections

No create, update, delete, approval, or other write actions were performed.

## Separate route-specific issue: public announcements receive 401 — fixed in source

The frontend defines `/announcements` as a route available outside the protected dashboard. However, the backend announcement list endpoint requires authentication. An unauthenticated GET returned **HTTP 401**, while the authenticated admin GET succeeded.

This is a definite mismatch for visitors who expect to view announcements without signing in. It is separate from the intermittent loading report.

Relevant files:

- [`client/src/router.tsx`](./client/src/router.tsx)
- [`server/apps/core/views.py`](./server/apps/core/views.py)

List and detail reads are now public, while create/update/delete operations remain admin-only. Public results are limited to visible announcements whose start and end dates include the current time, and the public response includes only a safe author display name rather than account details. The fix is in the repository source; the live API will continue to exhibit the old behavior until the backend is deployed.

## Security issue: public site settings exposed the SMS token — fixed in source

The site settings GET endpoint is public and its serializer included the Greenweb SMS token. The serializer now omits that field from unauthenticated and non-admin responses while retaining it for authenticated admins managing settings. This source change cannot undo any previous exposure. **Rotate the production SMS token**, and deploy the backend fix.

## Error and retry behavior

The shared API client retries requests after **401 responses** when it can refresh an access token, but it does not retry network errors or server errors. Several data hooks catch request errors and retain or display empty data rather than retrying. The admin dashboard starts its initial data requests concurrently.

Therefore, a transient backend or network failure could plausibly make data appear after a manual refresh. That scenario was not reproduced in this check; confirming it would require correlated production API/hosting logs and browser request traces from an affected first visit.

## Scope and limitations

Checks covered the public homepage and course browsing, one course detail, the admin dashboard, and the admin sections listed above. This was not an exhaustive test of every dynamic route or role-specific flow. Student and instructor data paths could not be verified using the admin account alone.

The diagnosis was initially read-only. Follow-up fixes have since been made in the repository source; they are not deployed to production by this change.

## Security follow-up

The notification settings screen displayed a saved SMS gateway token in the browser during the read-only check. Its value is intentionally not recorded here. **Rotate that token.** Since the admin password was shared for the live test, changing it after the investigation is also recommended.

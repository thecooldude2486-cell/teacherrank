## Problem

After login/signup, the DET portal sometimes fails to open in a new tab on desktop. Browsers block `window.open(...)` unless it happens **synchronously inside a user gesture** (click/submit). Today the open happens *after* `await supabase.auth.signIn...` resolves — by then the gesture is gone, so Chrome/Safari/Firefox treat it as a popup and block it.

## Fix (single file: `src/pages/Auth.tsx`)

1. **Open the tab synchronously in the submit handler, before any `await`.**
   - At the top of `submit` (after the email check), call `const portalTab = window.open("about:blank", "_blank")`. This reserves a real user-gesture tab.
   - Run sign-in / sign-up as today.
   - On success: `portalTab.location.href = PORTAL_URL`. On failure: `portalTab.close()`.
   - If `portalTab` is null (popup blocker still refused), fall back to navigating the current window: `window.location.href = PORTAL_URL`.

2. **Remove the post-auth `redirectToPortal()` and the `useEffect` that watches `user`.**
   - Those run after the gesture window has already closed, which is why the new tab is being blocked. The synchronous `window.open` in step 1 replaces both.

3. **Drop the unused `redirectToPortal()` / `window.top` logic** — we always want a new tab, no iframe-breakout needed.

No other files change. No backend/auth changes.

## Why this works

Browsers only allow `window.open` when called directly from a click/submit handler in the same tick. Opening `about:blank` first (still inside the gesture) and then setting its `location.href` after the async auth call is the standard pattern for "open a new tab after an async operation" and is not blocked by default popup blockers.

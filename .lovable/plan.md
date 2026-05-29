## Goal
Make the post-auth redirect to `https://student.det.nsw.edu.au/` work even when the app is rendered inside an iframe (e.g. the Lovable preview), where the portal's `X-Frame-Options` causes "refused to connect".

## Changes

**`src/pages/Auth.tsx`**

Add a small helper inside the file and use it in place of both existing `window.location.assign("https://student.det.nsw.edu.au/")` calls (lines 60 and 94):

```ts
const PORTAL_URL = "https://student.det.nsw.edu.au/";

function redirectToPortal() {
  try {
    // Break out of any iframe (works on the published site)
    if (window.top && window.top !== window.self) {
      window.top.location.href = PORTAL_URL;
      return;
    }
  } catch {
    // Cross-origin iframe (Lovable preview) — accessing window.top.location throws.
    // Fall through to opening in a new tab.
  }
  const opened = window.open(PORTAL_URL, "_blank", "noopener");
  if (!opened) window.location.href = PORTAL_URL;
}
```

Then:
- Line 60 becomes: `useEffect(() => { if (user) redirectToPortal(); }, [user]);`
- Line 94 becomes: `redirectToPortal();`

No other files change.

## Result
- Published site: full-page navigation to the DET student portal.
- Lovable preview: portal opens in a new browser tab (preview can't legally navigate to it because of the portal's iframe block).

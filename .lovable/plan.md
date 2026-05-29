## Change

In `src/pages/Auth.tsx`, replace the `PORTAL_URL` constant (line 49) with:

```
https://portal.education.nsw.gov.au/studentPortal/index.html
```

## Why this is better than the current ADFS URL

- The current URL is a one-time ADFS sign-in request containing a `client-request-id` GUID and an `estsrequest` token. Those are session-scoped — reusing them for every user can cause inconsistent behavior or "request expired" errors.
- The student portal URL is the official, stable entry point. If the user already has a DoE session in that browser, they go straight in. If not, the portal itself redirects them through ADFS with a fresh request ID.
- Shorter, readable, and won't rot over time.

## Behavior after change

- Sign-up flow: still enforces `name.surname@education.nsw.gov.au`, then opens the student portal in a new tab.
- Log-in flow: existing accounts skip the email check (per the previous change) and open the student portal in a new tab.

No other files change.
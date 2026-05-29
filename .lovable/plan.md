## Goal
After a successful login or signup, send the user to the NSW Department of Education student portal instead of the in-app `/account` page.

## Changes

**`src/pages/Auth.tsx`**
- Replace the post-auth `nav("/account")` call inside `submit()` with a full-page redirect to `https://student.det.nsw.edu.au/` using `window.location.assign(...)`.
- Replace the `useEffect` that currently runs `nav("/account")` when a session is already detected with the same external redirect, so an already-logged-in visitor landing on `/auth` is also sent to the portal.

No other files need to change — `AuthGate`, `useAuth`, and routing stay the same.

## Note
If you'd prefer a different portal URL (e.g. the staff portal `https://portal.det.nsw.edu.au/` or the parent portal), tell me which and I'll swap it in.

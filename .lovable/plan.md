## Goal

When a logged-in user submits a teacher review, check that the **teacher name + school + year level** exactly match an existing approved teacher record. If they don't match, the user is immediately signed out and blocked from submitting any review (teacher or school) for 1 hour. Browsing still works after they sign back in.

## How matching works

- Lookup against the `teachers` table where `status = 'approved'`.
- Match is case-insensitive and trims whitespace, but otherwise exact (no fuzzy/typo tolerance).
- Fields compared: `name`, school (resolved via `teacher.school_id` → `schools.name`), and `year_level`.
- If zero rows match all three → mismatch → trigger lockout.

## Lockout mechanism

New table `submission_lockouts`:
- `user_id uuid` (PK)
- `locked_until timestamptz`
- `reason text`
- RLS: user can read their own row; only admins can delete.
- A server-side trigger or check function so users can't tamper with it client-side.

Flow on mismatch:
1. Server-side insert/upsert into `submission_lockouts` with `locked_until = now() + 1 hour`.
2. Client calls `supabase.auth.signOut()` and shows a toast: *"That teacher, school, and year level don't match any record. You've been signed out and can't submit reviews for 1 hour."*
3. Redirect to `/auth`.

Flow on every review submission (teacher and school forms):
1. Before the insert, check `submission_lockouts` for current user.
2. If `locked_until > now()`, block submission, show toast with time remaining, and redirect (or just disable the form).

## Files to change

1. **DB migration** — create `submission_lockouts` table with RLS + grants, and a SQL helper function `is_submission_locked(uuid) returns boolean` (security definer) so the client can call it cheaply.
2. **`src/pages/SubmitFeedback.tsx`** (teacher review form):
   - Before insert: call `is_submission_locked` → block if locked.
   - On submit: run the name/school/year match query against `teachers`.
   - If no match → insert lockout row → `signOut()` → toast + redirect.
   - If match → proceed with existing insert.
3. **`src/pages/SubmitSchoolFeedback.tsx`** (school review form): just the lockout check at the top (school reviews aren't validated, but locked users can't submit those either).
4. **`src/hooks/useAuth.tsx`** *(optional)*: expose `lockedUntil` so the UI can show "Submissions disabled until 4:32pm" banners.

## Also in this turn

I'll fix the leftover build error from last turn — `rev?.text` → `rev?.written_feedback` in `src/pages/SchoolProfile.tsx` line 64.

## Notes / things to confirm

- The match is **exact** (after trim + lowercase). A user typing "Mr Smith" when the record is "Mr. Smith" will trigger a lockout. If that feels too harsh in practice, we can switch to fuzzy later — but you picked exact and instant, so this is intentional.
- Lockout is per **user account**, not per IP/device — a determined user can create a new account. That's the normal trade-off for this kind of rule.

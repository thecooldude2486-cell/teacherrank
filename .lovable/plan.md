## Fix: Restrict profiles table SELECT access

**Problem:** The `profiles` table SELECT policy is `USING (true)`, so any logged-in user can read every other user's email and display name.

**Fix (single migration, no app code changes):**

1. Drop the existing policy `"Profiles readable by authenticated"` on `public.profiles`.
2. Add two replacement SELECT policies:
   - **Users see own profile** — `USING (auth.uid() = id)`
   - **Admins see all profiles** — `USING (has_role(auth.uid(), 'admin'))`

**Why this is safe:**
- Admin panel (`Admin.tsx`) keeps working because admins still match the second policy.
- Users editing their own profile (`Account.tsx`) keep working because they match the first.
- No code changes are needed — the existing queries continue to return rows they're allowed to see.
- Reviews already store `display_name` denormalized on the review rows themselves (no join to `profiles`), so public review listings are unaffected.

**Out of scope:** the separate `edu_email_client_only` finding (client-side email check). Tell me if you want that fixed in the same pass.

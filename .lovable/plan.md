## Problem

Reporting a school review fails with `invalid input value for enum report_type: "school"`. The `reports.review_type` column is an enum with exactly two allowed values: `teacher_review` and `school_review`. The frontend is inserting the short forms `"school"` / `"teacher"` instead.

## Fix

Update every `reports` insert on the client to send the full enum values:

- `"school"` → `"school_review"`
- `"teacher"` → `"teacher_review"`

Files to update (all report-submission call sites):
- `src/pages/SchoolProfile.tsx`
- `src/pages/TeacherProfile.tsx`
- `src/components/SchoolCard.tsx`
- `src/components/TeacherCard.tsx`
- any other component inserting into `reports` (quick grep for `.from('reports')` / `review_type:`)

No DB migration needed — the enum already matches the intended schema; only the client strings are wrong.

## Verification

After the change, submit a school report and confirm the POST to `/rest/v1/reports` returns 201 and the row appears in the admin panel's Reports tab.
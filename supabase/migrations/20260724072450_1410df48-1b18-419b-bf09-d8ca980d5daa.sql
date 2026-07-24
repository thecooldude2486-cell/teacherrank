
ALTER TABLE public.teacher_reviews
  ADD COLUMN IF NOT EXISTS school_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int;

CREATE UNIQUE INDEX IF NOT EXISTS teacher_reviews_one_per_user_teacher_year
  ON public.teacher_reviews (user_id, teacher_name, school_year)
  WHERE status IN ('pending'::submission_status, 'approved'::submission_status);

CREATE TABLE public.teacher_grade_corrections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id text NOT NULL,
  school_id text,
  teacher_name text,
  school_name text,
  requested_grade text NOT NULL,
  submitted_by_user_id uuid NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.teacher_grade_corrections TO authenticated;
GRANT ALL ON public.teacher_grade_corrections TO service_role;

ALTER TABLE public.teacher_grade_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed submit corrections"
ON public.teacher_grade_corrections FOR INSERT TO authenticated
WITH CHECK (submitted_by_user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Users see own corrections"
ON public.teacher_grade_corrections FOR SELECT TO authenticated
USING (submitted_by_user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage corrections"
ON public.teacher_grade_corrections FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete corrections"
ON public.teacher_grade_corrections FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_updated_at_corrections
BEFORE UPDATE ON public.teacher_grade_corrections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
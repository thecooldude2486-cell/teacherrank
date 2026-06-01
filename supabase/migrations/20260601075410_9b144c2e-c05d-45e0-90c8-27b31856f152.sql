
-- Verification requests submitted by users for admin review
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_name text NOT NULL,
  doe_identifier text NOT NULL,
  note text,
  confirmed boolean NOT NULL DEFAULT false,
  status submission_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own verification request"
  ON public.verification_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending'::submission_status AND confirmed = true);

CREATE POLICY "Admins manage verification requests"
  ON public.verification_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete verification requests"
  ON public.verification_requests FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_verification_requests_user ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);

-- Helper: is the user admin-approved as verified?
CREATE OR REPLACE FUNCTION public.is_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.verification_requests
    WHERE user_id = _user_id AND status = 'approved'::submission_status
  );
$$;

-- Gate review submission on verified status (admins still permitted)
DROP POLICY IF EXISTS "Authed insert treviews" ON public.teacher_reviews;
CREATE POLICY "Authed insert treviews"
  ON public.teacher_reviews FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'::submission_status
    AND (public.is_verified(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

DROP POLICY IF EXISTS "Authed insert sreviews" ON public.school_reviews;
CREATE POLICY "Authed insert sreviews"
  ON public.school_reviews FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'::submission_status
    AND (public.is_verified(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

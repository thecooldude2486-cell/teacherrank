CREATE TABLE public.submission_lockouts (
  user_id uuid PRIMARY KEY,
  locked_until timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.submission_lockouts TO authenticated;
GRANT ALL ON public.submission_lockouts TO service_role;

ALTER TABLE public.submission_lockouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lockout"
  ON public.submission_lockouts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage lockouts"
  ON public.submission_lockouts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_submission_lockouts_updated
  BEFORE UPDATE ON public.submission_lockouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Security definer function so the app can lock the current user without
-- needing an admin-only INSERT policy. It only ever acts on auth.uid().
CREATE OR REPLACE FUNCTION public.lock_me_out(_minutes int, _reason text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  until timestamptz;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  until := now() + make_interval(mins => greatest(_minutes, 1));
  INSERT INTO public.submission_lockouts (user_id, locked_until, reason)
  VALUES (uid, until, _reason)
  ON CONFLICT (user_id) DO UPDATE
    SET locked_until = EXCLUDED.locked_until,
        reason = EXCLUDED.reason,
        updated_at = now();
  RETURN until;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_lockout()
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT locked_until FROM public.submission_lockouts
  WHERE user_id = auth.uid() AND locked_until > now()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lock_me_out(int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_lockout() TO authenticated;
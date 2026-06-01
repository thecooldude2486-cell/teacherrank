
CREATE OR REPLACE FUNCTION public.mark_self_verified()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  email_addr text := coalesce((auth.jwt() ->> 'email'), '');
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.verification_requests
    WHERE user_id = uid AND status = 'approved'::submission_status
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.verification_requests
    (user_id, school_name, doe_identifier, status, confirmed, note)
  VALUES
    (uid, 'Email verified', email_addr, 'approved'::submission_status, true,
     'Self-verified via email code');
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_self_verified() TO authenticated;

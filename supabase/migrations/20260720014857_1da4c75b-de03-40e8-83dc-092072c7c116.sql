
-- 1) profiles_email_leak: restrict SELECT to self + admin
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;

CREATE POLICY "Profiles select own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles select admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) mark_self_verified_bypass + edu_email_client_only:
-- Enforce @education.nsw.gov.au email server-side before granting verification.
CREATE OR REPLACE FUNCTION public.mark_self_verified()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  email_addr text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  email_verified boolean := coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean,
                                     (auth.jwt() ->> 'email_verified')::boolean,
                                     false);
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Server-side edu-domain enforcement. Pattern matches firstname.lastname[digits]@education.nsw.gov.au
  IF email_addr !~ '^[a-z]+\.[a-z]+[0-9]*@education\.nsw\.gov\.au$' THEN
    RAISE EXCEPTION 'Only NSW Department of Education staff emails may self-verify';
  END IF;

  -- Require that the Supabase auth layer has confirmed the email address
  IF NOT email_verified THEN
    RAISE EXCEPTION 'Email address has not been confirmed';
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
     'Self-verified via confirmed education.nsw.gov.au mailbox');
END;
$function$;

-- 3) Lock down SECURITY DEFINER function EXECUTE privileges.
-- Trigger-only functions: no direct calls needed.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Called via RLS/policy or by authenticated users only.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_verified(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_verified(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.mark_self_verified() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_self_verified() TO authenticated;

REVOKE ALL ON FUNCTION public.my_lockout() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_lockout() TO authenticated;

REVOKE ALL ON FUNCTION public.lock_me_out(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lock_me_out(integer, text) TO authenticated;

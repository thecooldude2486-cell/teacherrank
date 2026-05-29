// Restrict TeacherRank accounts to NSW Department of Education email addresses.
// Allowed: firstname.lastname@education.nsw.gov.au or firstname.lastname<digits>@education.nsw.gov.au
export const EDU_EMAIL_REGEX = /^[a-z]+\.[a-z]+\d*@education\.nsw\.gov\.au$/i;

export const DOE_LOGIN_URL =
  "https://fs.det.nsw.edu.au/adfs/ls/?client-request-id=4c72206b-2e1c-4e14-ad18-0080020000f1&username=&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=estsredirect%3d2%26estsrequest%3drQQIARAA42Kw0skoKSmw0tdPK9ZLSS3Ryysu10tNKdVLLNVPTEkr1i9OLSrLTE4t1i8pKi0uKRLiEshWKPKR0RPxWyvB0MDEwPBxFiMfqsZVjEogM4txG5pTrH-BkfEFI-MtJp7wYrfUlNSixJLM_LxZzCpGliYmpskmJrqGlgbJuiZG5ia6FiaJBrqGSSZGFiYGJqaJiSabmFUMTBMNUs0sE3VNDC0SdU3Mkw11LZONTHUtjS3MjcwMk9IsLQ0vsHC9YuExYLXi4OAS4JdgV2D4wcK4iFWIS-CusI2KQb6Q967ru3-Z8YkMp1j101zcvLNdvZ0i0oxSs5PdC13TfUtyQkpLy5MqotJMLJL9nDwiw5PTCi3cI21NrQwnsPGcYmP4wMbYwc4wi53hACfjAV6GH3w7jj5afmnK-vceGwQYHggwPBBk-CHY0ODQIcQAAA2#";

export function isAllowedEduEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return EDU_EMAIL_REGEX.test(email.trim());
}

export function redirectToDoeLogin() {
  window.location.assign(DOE_LOGIN_URL);
}

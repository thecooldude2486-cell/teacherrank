## Change

Swap the post-login redirect URL in `src/pages/Auth.tsx`.

**Before:**
```ts
const PORTAL_URL = "https://student.det.nsw.edu.au/";
```

**After:**
```ts
const PORTAL_URL = "https://fs.det.nsw.edu.au/adfs/ls/?client-request-id=94fc882d-5ca4-4a5b-f75d-0080030000f9&username=&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=estsredirect%3d2%26estsrequest%3drQQIARAA42Kw0skoKSmw0tdPK9ZLSS3Ryysu10tNKdVLLNVPTEkr1i9OLSrLTE4t1i8pKi0uKRLiEtDt-DNlSUy01_dYhgZmBoafsxj5UDWuYlQCmVmM29CcYv0LjIwvGBlvMfGEF7ulpqQWJZZk5ufNYlZJTEkxMTQzN9O1TDE31zUxtTTTTbQwT9M1SzUwTkwxNjUwSbXYxKxiYJpokGpmmahrYmiRqGtinmyoa5lsZKpraWxhbmRmmJRmaWl4gYXrFQuPAasVBweXAL8EuwLDDxbGRaxCXAJHjscK1BadclugHHk6YysvwylW_TQXN-9sV2-niDSj1Oxk90LXdN-SnJDS0vKkiqg0E4tkPyePyPDktEIL90hbCyvDCWw8p9gYPrAxdrAzzGJnOMDJeICX4QffpssPpvSvXP_eY4MAwwMBhgeCDD8EGxocOoQYAA2#";
```

No other code changes. Behavior is identical — on successful login/signup the new tab (already opened synchronously by the submit handler) navigates to this URL.

## Notes

- This is the NSW DoE ADFS sign-in URL with a federated Microsoft Online round-trip. Each `client-request-id` is a fresh tracking GUID; the link will still work for other users, but it's tied to this one session in the query string. That's normally fine — DoE accepts it as a generic ADFS entry point.
- The hash fragment `#` at the end is preserved verbatim.
- Sandbox DNS can't reach `fs.det.nsw.edu.au` from here, so I can't HTTP-probe it, but the domain is the real DoE federation server and will load in a normal browser tab. It does not allow iframing (same as the student portal), which is why we already open it in a new tab.

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, Mail, X } from "lucide-react";

/** Debug logger — check the browser console for [VERIFY] lines to trace the flow. */
function vlog(step: string, detail?: unknown) {
  // eslint-disable-next-line no-console
  console.log(`[VERIFY] ${new Date().toISOString()} — ${step}`, detail ?? "");
}

export default function VerificationPanel() {
  const { user, isVerified, refreshVerification } = useAuth();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [showSentDialog, setShowSentDialog] = useState(false);
  const handledRedirect = useRef(false);

  useEffect(() => { setLoading(false); }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  // Surface auth errors that Supabase appends to the redirect URL (e.g. expired link)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("error")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const desc = params.get("error_description") || params.get("error");
      vlog("redirect returned an auth error", { hash, desc });
      if (desc) toast.error(`Login link problem: ${desc.replace(/\+/g, " ")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // After clicking the email link the user lands on /account?verify=1 — auto-link the session.
  useEffect(() => {
    if (!user || isVerified || handledRedirect.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") !== "1") return;
    handledRedirect.current = true;
    vlog("returned from email link with verify=1, marking account active", { userId: user.id, email: user.email });
    (async () => {
      const { error } = await supabase.rpc("mark_self_verified" as any);
      if (error) {
        vlog("mark_self_verified FAILED", error);
        toast.error(`Could not finish sign-in: ${error.message}`);
        return;
      }
      vlog("mark_self_verified OK");
      window.history.replaceState({}, "", window.location.pathname);
      toast.success("You're signed in — welcome to your account!");
      await refreshVerification();
    })();
  }, [user, isVerified, refreshVerification]);

  const sendLink = async () => {
    if (!user?.email) { vlog("sendLink aborted — no user email"); return; }
    setBusy(true);
    const redirectTo = `${window.location.origin}/account?verify=1`;
    vlog("requesting sign-in email link", { email: user.email, redirectTo });
    const { data, error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (error) {
      vlog("signInWithOtp FAILED", { message: error.message, status: (error as any).status, code: (error as any).code });
      return toast.error(`Email send failed: ${error.message}`);
    }
    vlog("signInWithOtp OK — email accepted by auth server", data);
    setCountdown(60);
    setShowSentDialog(true);
  };

  if (loading) return null;

  return (
    <section className="bg-card rounded-3xl border border-border/60 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Account access</h2>
        </div>
        {isVerified ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-secondary text-foreground/70">
            Inactive
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {isVerified ? (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4 text-sm text-foreground/80">
            You're signed in and ready to submit teacher and school reviews.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 text-sm leading-relaxed text-foreground/80">
              We'll email a sign-in link to <strong>{user?.email}</strong>. Click the
              link in your inbox, log in with your correct credentials, and you'll be
              taken straight to your account where you can submit reviews.
            </div>

            <button
              onClick={sendLink}
              disabled={busy || countdown > 0}
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
            >
              <Mail className="w-4 h-4" />
              {busy
                ? "Sending…"
                : countdown > 0
                ? `Resend link in ${countdown}s`
                : "Send sign-in link"}
            </button>
          </>
        )}
      </div>

      {showSentDialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSentDialog(false)}
        >
          <div
            className="relative bg-card rounded-3xl border border-border shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSentDialog(false)}
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-secondary transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
                <Mail className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>
                Check your email
              </h3>
              <p className="text-sm text-foreground/75 leading-relaxed mb-5">
                We just sent a sign-in link to <strong>{user?.email}</strong>.
                Open the email, click the link, and log in with your correct
                credentials — it'll take you straight to your account where you
                can submit reviews.
              </p>
              <button
                onClick={() => setShowSentDialog(false)}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

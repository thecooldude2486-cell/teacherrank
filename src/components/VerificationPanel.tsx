import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, Mail, AlertTriangle, RefreshCw } from "lucide-react";

/** Debug logger — check the browser console for [VERIFY] lines to trace the flow. */
function vlog(step: string, detail?: unknown) {
  // eslint-disable-next-line no-console
  console.log(`[VERIFY] ${new Date().toISOString()} — ${step}`, detail ?? "");
}

export default function VerificationPanel() {
  const { user, isVerified, refreshVerification } = useAuth();
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
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
      if (desc) toast.error(`Verification link problem: ${desc.replace(/\+/g, " ")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // After clicking the email link the user lands on /account?verify=1 — auto-verify here.
  useEffect(() => {
    if (!user || isVerified || handledRedirect.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") !== "1") return;
    handledRedirect.current = true;
    vlog("returned from email link with verify=1, marking verified", { userId: user.id, email: user.email });
    (async () => {
      const { error } = await supabase.rpc("mark_self_verified" as any);
      if (error) {
        vlog("mark_self_verified FAILED", error);
        toast.error(`Could not complete verification: ${error.message}`);
        return;
      }
      vlog("mark_self_verified OK");
      window.history.replaceState({}, "", window.location.pathname);
      toast.success("Email confirmed — your account is now verified!");
      await refreshVerification();
    })();
  }, [user, isVerified, refreshVerification]);

  const sendCode = async () => {
    if (!user?.email) { vlog("sendCode aborted — no user email"); return; }
    setBusy(true);
    const redirectTo = `${window.location.origin}/account?verify=1`;
    vlog("requesting verification email", { email: user.email, redirectTo });
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
    setStep("sent");
    setCountdown(60);
    toast.success(`Email sent to ${user.email}. Click the link inside — it brings you straight back here and verifies you.`);
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const token = code.trim();
    if (token.length < 6) return toast.error("Enter the 6-digit code from your email.");
    setBusy(true);
    vlog("verifying typed code", { email: user.email, tokenLength: token.length });
    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token,
      type: "email",
    });
    if (error) {
      setBusy(false);
      vlog("verifyOtp FAILED", { message: error.message, status: (error as any).status, code: (error as any).code });
      return toast.error(error.message);
    }
    vlog("verifyOtp OK");

    const { error: rpcErr } = await supabase.rpc("mark_self_verified" as any);
    setBusy(false);
    if (rpcErr) {
      vlog("mark_self_verified FAILED", rpcErr);
      return toast.error(rpcErr.message);
    }
    vlog("mark_self_verified OK");
    toast.success("Your account is now verified.");
    setCode(""); setStep("idle");
    await refreshVerification();
  };

  if (loading) return null;

  return (
    <section className="bg-card rounded-3xl border border-border/60 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Email verification</h2>
        </div>
        {isVerified ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-secondary text-foreground/70">
            Not verified
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {isVerified ? (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4 text-sm text-foreground/80">
            Your account is verified. You can now submit teacher and school reviews.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--sunny-foreground))] shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  We'll email a verification link to <strong>{user?.email}</strong>.
                  Click it and you'll be brought straight back to this page, verified automatically.
                  If your email also shows a 6-digit code, you can type it below instead.
                </p>
              </div>
            </div>

            {step === "idle" ? (
              <button
                onClick={sendCode}
                disabled={busy}
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
              >
                <Mail className="w-4 h-4" />
                {busy ? "Sending…" : "Send verification email"}
              </button>
            ) : (
              <form onSubmit={confirmCode} className="space-y-3">
                <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-3 text-xs text-foreground/70">
                  Check your inbox and click the verification link — it returns you here automatically.
                  Or, if the email shows a code, enter it below.
                </div>
                <label className="block">
                  <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">
                    6-digit code (optional)
                  </span>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-center text-lg tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </label>
                <button
                  disabled={busy || code.trim().length < 6}
                  type="submit"
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
                >
                  {busy ? "Verifying…" : "Confirm code"}
                </button>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={busy || countdown > 0}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-border bg-secondary/60 text-foreground/80 hover:bg-secondary hover:text-foreground disabled:opacity-40 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
                  {countdown > 0 ? `Resend email in ${countdown}s` : (busy ? "Sending…" : "Resend email")}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, Mail, AlertTriangle } from "lucide-react";

export default function VerificationPanel() {
  const { user, isVerified, refreshVerification } = useAuth();
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, [user]);

  const sendCode = async () => {
    if (!user?.email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setStep("sent");
    toast.success(`Verification code sent to ${user.email}. Check your inbox.`);
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const token = code.trim();
    if (token.length < 6) return toast.error("Enter the 6-digit code from your email.");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token,
      type: "email",
    });
    if (error) { setBusy(false); return toast.error(error.message); }

    const { error: rpcErr } = await supabase.rpc("mark_self_verified" as any);
    setBusy(false);
    if (rpcErr) return toast.error(rpcErr.message);
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
                  We'll email a 6-digit code to <strong>{user?.email}</strong> to confirm you control this education account.
                  Enter the code below to verify your TeacherRank account.
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
                {busy ? "Sending…" : "Send verification code"}
              </button>
            ) : (
              <form onSubmit={confirmCode} className="space-y-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">
                    6-digit code
                  </span>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-center text-lg tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    required
                  />
                </label>
                <button
                  disabled={busy}
                  type="submit"
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
                >
                  {busy ? "Verifying…" : "Confirm code"}
                </button>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={busy}
                  className="w-full py-2 text-sm text-foreground/70 hover:text-foreground transition"
                >
                  Resend code
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}

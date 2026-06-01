import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, ExternalLink, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const PORTAL_URL = "https://portal.education.nsw.gov.au/studentPortal/index.html";

type Request = {
  id: string;
  status: "pending" | "approved" | "rejected";
  school_name: string;
  doe_identifier: string;
  note: string | null;
  created_at: string;
};

export default function VerificationPanel() {
  const { user, isVerified, refreshVerification } = useAuth();
  const [latest, setLatest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  const [schoolName, setSchoolName] = useState("");
  const [doeId, setDoeId] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("verification_requests" as any)
      .select("id,status,school_name,doe_identifier,note,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    setLatest(((data ?? [])[0] as any) ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const openPortal = () => {
    window.open(PORTAL_URL, "_blank", "noopener,noreferrer");
    toast.info(
      "Opening the NSW Student Portal does not automatically verify your account. Please return here and submit your verification details for admin review."
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!schoolName.trim() || !doeId.trim()) {
      toast.error("Please provide your school name and DoE email or username.");
      return;
    }
    if (!confirmed) {
      toast.error("Please confirm the information is truthful and belongs to you.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("verification_requests" as any).insert({
      user_id: user.id,
      school_name: schoolName.trim(),
      doe_identifier: doeId.trim(),
      note: note.trim() || null,
      confirmed: true,
      status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Your verification request has been submitted and is pending admin review.");
    setSchoolName(""); setDoeId(""); setNote(""); setConfirmed(false);
    await load();
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
          <h2 className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>NSW DoE verification</h2>
        </div>
        <StatusPill isVerified={isVerified} latest={latest} />
      </div>

      <div className="p-6 space-y-5">
        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--sunny-foreground))] shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-foreground/80">
              <strong className="font-semibold">TeacherRank is not affiliated with NSW Department of Education.</strong>{" "}
              This verification step helps reduce fake reviews but does not represent official NSW DoE
              authentication or endorsement. Opening the NSW portal does not verify your TeacherRank
              account — only an admin can approve verification.
            </p>
          </div>
          <button
            onClick={openPortal}
            type="button"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Visit NSW Student Portal
          </button>
        </div>

        {isVerified ? (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4 text-sm text-foreground/80">
            Your account is verified. You can now submit teacher and school reviews.
          </div>
        ) : latest?.status === "pending" ? (
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-foreground/80">
            Your verification request has been submitted and is pending admin review.
            You can't submit reviews until an admin approves it.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {latest?.status === "rejected" && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Your previous verification request was rejected. You may submit a new one below.
              </div>
            )}
            <Field label="School name">
              <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputCls} maxLength={120} required />
            </Field>
            <Field label="DoE email or username">
              <input value={doeId} onChange={e => setDoeId(e.target.value)} className={inputCls} maxLength={120} required />
            </Field>
            <Field label="Optional note for the admin">
              <textarea value={note} onChange={e => setNote(e.target.value)} className={inputCls + " min-h-[80px]"} maxLength={500} />
            </Field>
            <label className="flex items-start gap-2 text-sm text-foreground/80 select-none">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
              <span>I confirm this information is truthful and belongs to me.</span>
            </label>
            <button disabled={busy} type="submit" className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm">
              {busy ? "Submitting…" : "Submit verification request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

const inputCls = "w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ isVerified, latest }: { isVerified: boolean; latest: Request | null }) {
  if (isVerified) {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-primary-soft text-primary"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
  }
  if (latest?.status === "pending") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-sunny/30 text-[hsl(var(--sunny-foreground))]"><Clock className="w-3 h-3" /> Pending review</span>;
  }
  if (latest?.status === "rejected") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-destructive/10 text-destructive"><XCircle className="w-3 h-3" /> Rejected</span>;
  }
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-secondary text-foreground/70"><Clock className="w-3 h-3" /> Not verified</span>;
}

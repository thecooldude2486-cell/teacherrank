import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import { LogOut, ShieldCheck, MessageSquareHeart, School as SchoolIcon, GraduationCap, Sparkles, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Row = { id: string; status: string; created_at: string; label: string };

export default function Account() {
  return (
    <AuthGate message="Sign in to see your submissions and reviews.">
      <Inner />
    </AuthGate>
  );
}

function Inner() {
  const { user, isAdmin, signOut } = useAuth();
  const [tReviews, setT] = useState<Row[]>([]);
  const [sReviews, setS] = useState<Row[]>([]);
  const [teachers, setTeachers] = useState<Row[]>([]);
  const [schools, setSchools] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [tr, sr, tt, ss] = await Promise.all([
        supabase.from("teacher_reviews").select("id,status,created_at,written_feedback,teacher_name").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("school_reviews").select("id,status,created_at,written_feedback,school_name").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("teachers").select("id,status,created_at,name").eq("submitted_by_user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("schools").select("id,status,created_at,name").eq("submitted_by_user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setT((tr.data ?? []).map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, label: r.teacher_name || r.written_feedback?.slice(0, 80) || "Teacher review" })));
      setS((sr.data ?? []).map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, label: r.school_name || r.written_feedback?.slice(0, 80) || "School review" })));
      setTeachers((tt.data ?? []).map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, label: r.name })));
      setSchools((ss.data ?? []).map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, label: r.name })));
    })();
  }, [user]);

  const all = [...tReviews, ...sReviews, ...teachers, ...schools];
  const stats = useMemo(() => ({
    total: all.length,
    approved: all.filter(r => r.status === "approved").length,
    pending: all.filter(r => r.status === "pending").length,
    rejected: all.filter(r => r.status === "rejected").length,
  }), [all]);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split("@")[0] || "Friend";
  const initials = displayName.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : null;

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      {/* Profile hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary-soft via-card to-card shadow-card p-6 md:p-10 mb-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-sunny/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
          <div className="flex items-center gap-5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary text-primary-foreground grid place-items-center text-2xl md:text-3xl font-bold shadow-lg" style={{ fontFamily: "Fraunces, serif" }}>
                {initials}
              </div>
              {isAdmin && (
                <span title="Admin" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-sunny text-[hsl(var(--sunny-foreground))] grid place-items-center border-2 border-card shadow">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-card/70 border border-border/60 text-[11px] font-semibold uppercase tracking-wide text-primary mb-2">
                <Sparkles className="w-3 h-3" /> {isAdmin ? "Moderator" : "Community member"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight truncate" style={{ fontFamily: "Fraunces, serif" }}>
                Hi, {displayName}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}{joined ? <> · joined {joined}</> : null}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <ShieldCheck className="w-4 h-4" /> Admin dashboard
              </Link>
            )}
            <button onClick={signOut} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={Sparkles} label="Contributions" value={stats.total} tone="primary" />
          <Stat icon={CheckCircle2} label="Approved" value={stats.approved} tone="success" />
          <Stat icon={Clock} label="Pending" value={stats.pending} tone="warning" />
          <Stat icon={XCircle} label="Rejected" value={stats.rejected} tone="danger" />
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid sm:grid-cols-3 gap-3 mb-8">
        <QuickAction to="/submit" icon={MessageSquareHeart} label="Submit a teacher review" />
        <QuickAction to="/submit-school" icon={SchoolIcon} label="Submit a school review" />
        <QuickAction to="/add-teacher" icon={Plus} label="Suggest a new teacher" />
      </section>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-5">
        <List title="My teacher reviews" icon={MessageSquareHeart} rows={tReviews} empty="No teacher reviews yet. Share one when you're ready." />
        <List title="My school reviews" icon={MessageSquareHeart} rows={sReviews} empty="No school reviews yet." />
        <List title="Teachers I suggested" icon={GraduationCap} rows={teachers} empty="You haven't suggested any teachers yet." />
        <List title="Schools I suggested" icon={SchoolIcon} rows={schools} empty="You haven't suggested any schools yet." />
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "primary" | "success" | "warning" | "danger" }) {
  const tones = {
    primary: "bg-card/80 text-primary border-primary/15",
    success: "bg-card/80 text-primary border-primary/15",
    warning: "bg-card/80 text-[hsl(var(--sunny-foreground))] border-sunny/40",
    danger:  "bg-card/80 text-destructive border-destructive/20",
  } as const;
  return (
    <div className={cn("rounded-2xl border backdrop-blur-sm px-4 py-3 flex items-center gap-3", tones[tone])}>
      <span className="w-9 h-9 rounded-xl bg-background/60 grid place-items-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none" style={{ fontFamily: "Fraunces, serif" }}>{value}</div>
        <div className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 bg-card rounded-2xl border border-border/60 px-4 py-3.5 hover:border-primary/40 hover:bg-secondary/40 transition-all"
    >
      <span className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm font-semibold flex-1">{label}</span>
      <span className="text-muted-foreground group-hover:text-primary text-lg leading-none">→</span>
    </Link>
  );
}

function List({ title, icon: Icon, rows, empty }: { title: string; icon: any; rows: Row[]; empty: string }) {
  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <Icon className="w-4 h-4" />
          </span>
          <h2 className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground italic">{empty}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {rows.map(r => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.label}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: any }> = {
    approved: { cls: "bg-primary-soft text-primary", icon: CheckCircle2 },
    pending:  { cls: "bg-sunny/30 text-[hsl(var(--sunny-foreground))]", icon: Clock },
    rejected: { cls: "bg-destructive/10 text-destructive", icon: XCircle },
  };
  const m = map[status] ?? { cls: "bg-secondary text-foreground/70", icon: Clock };
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full", m.cls)}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import { Check, X, Trash2, Flag, ShieldCheck, GraduationCap, School as SchoolIcon, MessageSquareHeart, ArrowUp, CheckCheck, Users as UsersIcon, Search, BookOpen, ShieldAlert, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addTeacherGrade, teachers as mockTeachers, schoolName as mockSchoolName } from "@/lib/mockData";
import { primarySchools } from "@/lib/schoolsData";


type Tab = "pending-teachers" | "pending-schools" | "pending-treviews" | "pending-sreviews" | "reports" | "grade-corrections" | "verifications" | "suspicious" | "users" | "all-teachers" | "all-schools";
type UserRow = { id: string; email: string | null; display_name: string | null; is_admin: boolean };


export default function Admin() {
  return (
    <AuthGate message="The admin dashboard is restricted to moderators.">
      <AdminInner />
    </AuthGate>
  );
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function AdminInner() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("pending-teachers");
  const [pendingT, setPT] = useState<any[]>([]);
  const [pendingS, setPS] = useState<any[]>([]);
  const [pendingTR, setPTR] = useState<any[]>([]);
  const [pendingSR, setPSR] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [lockouts, setLockouts] = useState<any[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [verifications, setVerifications] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");

  const reload = async () => {
    const [t, s, tr, sr, r, gc, lo, profs, roles, vr, at, asc] = await Promise.all([
      supabase.from("teachers").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("schools").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("teacher_reviews").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("school_reviews").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("reports").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("teacher_grade_corrections" as any).select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("submission_lockouts" as any).select("*").gt("locked_until", new Date().toISOString()).order("locked_until", { ascending: false }),
      supabase.from("profiles").select("id,email,display_name").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
      supabase.from("verification_requests" as any).select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("teachers").select("*").order("created_at", { ascending: false }),
      supabase.from("schools").select("*").order("created_at", { ascending: false }),
    ]);
    setPT(t.data ?? []); setPS(s.data ?? []); setPTR(tr.data ?? []); setPSR(sr.data ?? []); setReports(r.data ?? []);
    setCorrections((gc as any).data ?? []);
    setLockouts((lo as any).data ?? []);
    setVerifications((vr as any).data ?? []);
    setAllTeachers(at.data ?? []);
    setAllSchools(asc.data ?? []);
    const adminIds = new Set((roles.data ?? []).map((x: any) => x.user_id));
    setUsers((profs.data ?? []).map((p: any) => ({ ...p, is_admin: adminIds.has(p.id) })));
  };

  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);


  if (loading) return <div className="container py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <div className="container max-w-xl py-16 text-center">
        <div className="bg-card rounded-3xl border border-border/60 shadow-card p-8">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Admins only</h2>
          <p className="text-sm text-muted-foreground">Your account doesn't have admin permissions.</p>
        </div>
      </div>
    );
  }

  const setStatus = async (table: string, id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from(table as any).update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}.`);
    reload();
  };
  const del = async (table: string, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast("Deleted.");
    reload();
  };

  const setAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin role granted.");
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin role removed.");
    }
    reload();
  };

  const quickReport = async (review_type: "teacher_review" | "school_review", review_id: string) => {
    const reason = window.prompt("Report reason (short label):", "Flagged by admin");
    if (!reason) return;
    const details = window.prompt("Additional details (optional):", "") ?? "";
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").insert({
      review_type, review_id, reason, details, status: "pending",
      reported_by_user_id: user?.id ?? null,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Report filed.");
    reload();
  };

  const quickGradeCorrection = async (teacher_id: string, teacher_name: string, school_name?: string | null) => {
    const requested_grade = window.prompt(`Grade to add for ${teacher_name} (e.g. "Year 3"):`, "");
    if (!requested_grade) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("teacher_grade_corrections" as any).insert({
      teacher_id, teacher_name, school_name: school_name ?? null,
      requested_grade, submitted_by_user_id: user?.id ?? null, status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("Grade correction queued.");
    reload();
  };

  const quickSuspicious = async (user_id: string | null | undefined) => {
    if (!user_id) return toast.error("No user attached to this item.");
    const hoursStr = window.prompt("Lock this user for how many hours?", "1");
    const hours = Number(hoursStr);
    if (!hours || hours <= 0) return;
    const reason = window.prompt("Reason:", "Suspicious activity") ?? "Suspicious activity";
    const locked_until = new Date(Date.now() + hours * 3600_000).toISOString();
    const { error } = await supabase.from("submission_lockouts" as any)
      .upsert({ user_id, locked_until, reason }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success(`User locked for ${hours}h.`);
    reload();
  };

  const resolveCorrection = async (row: any, approve: boolean) => {
    if (approve) {
      addTeacherGrade(row.teacher_id, row.requested_grade);
    }
    const { error } = await supabase.from("teacher_grade_corrections" as any)
      .update({ status: approve ? "approved" : "rejected" })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(approve ? `Added ${row.requested_grade} to ${row.teacher_name}.` : "Rejected.");
    reload();
  };

  const tabs: { id: Tab; label: string; count: number; icon: any; tone?: "danger" }[] = [
    { id: "pending-teachers", label: "Pending teachers", count: pendingT.length, icon: GraduationCap },
    { id: "pending-schools", label: "Pending schools", count: pendingS.length, icon: SchoolIcon },
    { id: "pending-treviews", label: "Pending teacher reviews", count: pendingTR.length, icon: MessageSquareHeart },
    { id: "pending-sreviews", label: "Pending school reviews", count: pendingSR.length, icon: MessageSquareHeart },
    { id: "grade-corrections", label: "Grade corrections", count: corrections.length, icon: BookOpen },
    { id: "verifications", label: "Verifications", count: verifications.length, icon: BadgeCheck },
    { id: "reports", label: "Reports", count: reports.length, icon: Flag, tone: "danger" },
    { id: "suspicious", label: "Suspicious activity", count: lockouts.length, icon: ShieldAlert, tone: "danger" },
    { id: "users", label: "Users", count: users.length, icon: UsersIcon },
    { id: "all-teachers", label: "All teachers", count: allTeachers.length, icon: GraduationCap },
    { id: "all-schools", label: "All schools", count: allSchools.length, icon: SchoolIcon },
  ];


  const panelTitle = tabs.find(t => t.id === tab)?.label ?? "";
  const panelCount = tabs.find(t => t.id === tab)?.count ?? 0;

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      {/* Header */}
      <header className="mb-8 space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/15 text-primary text-[11px] font-semibold uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin dashboard
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>
          Moderation <span className="italic font-light text-primary">&</span> management
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Approve submissions, review flagged content, and keep the community safe.
        </p>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => {
          const active = tab === t.id;
          const danger = t.tone === "danger";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-foreground/80 hover:bg-secondary hover:border-border/80",
              )}
            >
              <t.icon className="w-4 h-4 opacity-80" />
              {t.label}
              <span
                className={cn(
                  "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : danger && t.count > 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary text-foreground/70",
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Content card */}
      <div className="bg-card border border-border/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-center gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>{panelTitle}</h2>
          <div className="text-sm text-muted-foreground">{panelCount} item{panelCount === 1 ? "" : "s"}</div>
        </div>

        <div className="divide-y divide-border/40">
          {tab === "pending-teachers" && (
            pendingT.length === 0 ? <EmptyState label="All caught up. No pending teachers to review." /> :
            pendingT.map(t => (

              <ItemRow
                key={t.id}
                avatar={initials(t.name)}
                title={t.name}
                href={`/teachers/${t.id}`}
                subtitle={[t.year_level, t.class_type, t.location].filter(Boolean).join(" · ")}
                onApprove={() => setStatus("teachers", t.id, "approved")}
                onReject={() => setStatus("teachers", t.id, "rejected")}
                onDelete={() => del("teachers", t.id)}
                onGradeCorrection={() => quickGradeCorrection(t.id, t.name)}
                onSuspicious={() => quickSuspicious(t.submitted_by_user_id)}
              />
            ))
          )}

          {tab === "pending-schools" && (
            pendingS.length === 0 ? <EmptyState label="All caught up. No pending schools to review." /> :
            pendingS.map(s => (
              <ItemRow
                key={s.id}
                avatar={initials(s.name)}
                title={s.name}
                href={`/schools/${s.id}`}
                subtitle={[s.location, s.school_type].filter(Boolean).join(" · ")}
                onApprove={() => setStatus("schools", s.id, "approved")}
                onReject={() => setStatus("schools", s.id, "rejected")}
                onDelete={() => del("schools", s.id)}
                onSuspicious={() => quickSuspicious(s.submitted_by_user_id)}
              />
            ))
          )}

          {tab === "pending-treviews" && (
            pendingTR.length === 0 ? <EmptyState label="No teacher reviews in the queue." /> :
            pendingTR.map(r => (
              <ReviewRow
                key={r.id}
                heading={<>For {r.teacher_id ? (
                  <Link to={`/teachers/${r.teacher_id}`} className="font-semibold text-foreground hover:text-primary underline-offset-2 hover:underline">{r.teacher_name ?? "Unnamed"}</Link>
                ) : (
                  <span className="font-semibold text-foreground">{r.teacher_name ?? "Unnamed"}</span>
                )}{r.school_name ? <> · {r.school_name}</> : null}</>}
                body={r.written_feedback}
                meta={`Overall: ${r.overall_rating ?? "—"} · ${new Date(r.created_at).toLocaleDateString()}`}
                onApprove={() => setStatus("teacher_reviews", r.id, "approved")}
                onReject={() => setStatus("teacher_reviews", r.id, "rejected")}
                onDelete={() => del("teacher_reviews", r.id)}
                onReport={() => quickReport("teacher_review", r.id)}
                onGradeCorrection={() => r.teacher_id && quickGradeCorrection(r.teacher_id, r.teacher_name ?? "Teacher", r.school_name)}
                onSuspicious={() => quickSuspicious(r.user_id)}
              />
            ))
          )}

          {tab === "pending-sreviews" && (
            pendingSR.length === 0 ? <EmptyState label="No school reviews in the queue." /> :
            pendingSR.map(r => (
              <ReviewRow
                key={r.id}
                heading={<>For {r.school_id ? (
                  <Link to={`/schools/${r.school_id}`} className="font-semibold text-foreground hover:text-primary underline-offset-2 hover:underline">{r.school_name ?? "School"}</Link>
                ) : (
                  <span className="font-semibold text-foreground">{r.school_name ?? "School"}</span>
                )}</>}
                body={r.written_feedback}
                meta={`Overall: ${r.overall_rating ?? "—"} · ${new Date(r.created_at).toLocaleDateString()}`}
                onApprove={() => setStatus("school_reviews", r.id, "approved")}
                onReject={() => setStatus("school_reviews", r.id, "rejected")}
                onDelete={() => del("school_reviews", r.id)}
                onReport={() => quickReport("school_review", r.id)}
                onSuspicious={() => quickSuspicious(r.user_id)}
              />
            ))
          )}



          {tab === "grade-corrections" && (
            corrections.length === 0 ? <EmptyState label="No grade correction requests pending." /> :
            corrections.map(c => (
              <div key={c.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">
                    {c.teacher_name ?? "Teacher"} {c.school_name ? <span className="text-muted-foreground font-normal">· {c.school_name}</span> : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Add grade: <span className="font-medium text-foreground">{c.requested_grade}</span>
                    {" · "}{new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => resolveCorrection(c, true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => resolveCorrection(c, false)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}

          {tab === "reports" && (
            reports.length === 0 ? <EmptyState label="No reports right now." /> :
            reports.map(rep => (
              <ReviewRow
                key={rep.id}
                heading={<><span className="font-semibold text-foreground capitalize">{rep.review_type}</span> · {rep.reason}</>}
                body={rep.details}
                meta={`${new Date(rep.created_at).toLocaleDateString()} · status: ${rep.status}`}
                approveLabel="Mark reviewed"
                onApprove={async () => {
                  const { error } = await supabase.from("reports").update({ status: "reviewed" }).eq("id", rep.id);
                  if (error) toast.error(error.message); else { toast.success("Marked reviewed."); reload(); }
                }}
                onDelete={() => del("reports", rep.id)}
              />
            ))
          )}

          {tab === "verifications" && (
            verifications.length === 0 ? <EmptyState label="No verification requests pending." /> :
            verifications.map((v: any) => {
              const u = users.find(x => x.id === v.user_id);
              return (
                <div key={v.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="min-w-0 space-y-1">
                    <div className="font-semibold text-foreground">
                      {u?.display_name || u?.email || v.user_id}
                    </div>
                    <div className="text-sm text-foreground/80">
                      <span className="text-muted-foreground">School:</span> {v.school_name}
                    </div>
                    <div className="text-sm text-foreground/80">
                      <span className="text-muted-foreground">DoE email/username:</span> {v.doe_identifier}
                    </div>
                    {v.note && (
                      <div className="text-sm text-foreground/70 italic">
                        "{v.note}"
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Submitted {new Date(v.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setStatus("verification_requests", v.id, "approved")} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setStatus("verification_requests", v.id, "rejected")} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}


          {tab === "suspicious" && (
            lockouts.length === 0 ? <EmptyState label="No suspicious activity recorded." /> :
            lockouts.map(l => {
              const until = new Date(l.locked_until);
              const active = until.getTime() > Date.now();
              const userLabel = users.find(u => u.id === l.user_id);
              return (
                <div key={l.user_id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {userLabel?.display_name || userLabel?.email || l.user_id}
                      {active ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold uppercase tracking-wide">Locked</span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-foreground/70 text-[10px] font-semibold uppercase tracking-wide">Expired</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {l.reason || "No reason recorded"} · until {until.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from("submission_lockouts" as any).delete().eq("user_id", l.user_id);
                        if (error) toast.error(error.message); else { toast.success("Lockout cleared."); reload(); }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4" /> Clear lockout
                    </button>
                  </div>
                </div>
              );
            })
          )}


          {tab === "users" && (
            <div className="p-5 md:p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              {(() => {
                const q = userQuery.trim().toLowerCase();
                const filtered = q
                  ? users.filter(u => (u.display_name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
                  : users;
                if (filtered.length === 0) return <EmptyState label="No users match your search." />;
                return (
                  <div className="divide-y divide-border/40 border border-border/60 rounded-2xl overflow-hidden">
                    {filtered.map(u => (
                      <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0">
                            {initials(u.display_name || u.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{u.display_name || "(no name)"}</span>
                              {u.is_admin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[10px] font-semibold uppercase tracking-wide">
                                  <ShieldCheck className="w-3 h-3" /> Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                        {u.is_admin ? (
                          <button
                            onClick={() => setAdmin(u.id, false)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-foreground/80 border border-border bg-card hover:bg-secondary transition-colors"
                          >
                            <X className="w-4 h-4" /> Remove admin
                          </button>
                        ) : (
                          <button
                            onClick={() => setAdmin(u.id, true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" /> Make admin
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "all-teachers" && (
            <div className="p-5 md:p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={teacherQuery}
                  onChange={e => setTeacherQuery(e.target.value)}
                  placeholder="Search teachers…"
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              {(() => {
                const q = teacherQuery.trim().toLowerCase();
                const filtered = q
                  ? allTeachers.filter((t: any) => (t.name ?? "").toLowerCase().includes(q) || (t.location ?? "").toLowerCase().includes(q))
                  : allTeachers;
                if (filtered.length === 0) return <EmptyState label="No teachers found." />;
                return (
                  <div className="divide-y divide-border/40 border border-border/60 rounded-2xl overflow-hidden">
                    {filtered.map((t: any) => (
                      <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0">
                            {initials(t.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link to={`/teachers/${t.id}`} className="font-semibold truncate hover:text-primary underline-offset-2 hover:underline">{t.name}</Link>
                              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                                t.status === "approved" ? "bg-primary-soft text-primary" :
                                t.status === "pending" ? "bg-amber-500/10 text-amber-700" :
                                "bg-destructive/10 text-destructive")}>{t.status}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{[t.year_level, t.class_type, t.location].filter(Boolean).join(" · ")}</div>
                          </div>
                        </div>
                        <button onClick={() => del("teachers", t.id)} title="Delete"
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "all-schools" && (
            <div className="p-5 md:p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={schoolQuery}
                  onChange={e => setSchoolQuery(e.target.value)}
                  placeholder="Search schools…"
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              {(() => {
                const q = schoolQuery.trim().toLowerCase();
                const filtered = q
                  ? allSchools.filter((s: any) => (s.name ?? "").toLowerCase().includes(q) || (s.location ?? "").toLowerCase().includes(q))
                  : allSchools;
                if (filtered.length === 0) return <EmptyState label="No schools found." />;
                return (
                  <div className="divide-y divide-border/40 border border-border/60 rounded-2xl overflow-hidden">
                    {filtered.map((s: any) => (
                      <div key={s.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0">
                            {initials(s.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link to={`/schools/${s.id}`} className="font-semibold truncate hover:text-primary underline-offset-2 hover:underline">{s.name}</Link>
                              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                                s.status === "approved" ? "bg-primary-soft text-primary" :
                                s.status === "pending" ? "bg-amber-500/10 text-amber-700" :
                                "bg-destructive/10 text-destructive")}>{s.status}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{[s.location, s.school_type].filter(Boolean).join(" · ")}</div>
                          </div>
                        </div>
                        <button onClick={() => del("schools", s.id)} title="Delete"
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>


        <div className="p-4 bg-secondary/30 border-t border-border/50 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
          >
            <ArrowUp className="w-4 h-4" /> Back to top
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <CheckCheck className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium italic">{label}</p>
    </div>
  );
}

function ItemRow({ avatar, title, subtitle, href, onApprove, onReject, onDelete, onReport, onGradeCorrection, onSuspicious }: {
  avatar: string; title: string; subtitle?: string; href?: string;
  onApprove: () => void; onReject: () => void; onDelete: () => void;
  onReport?: () => void; onGradeCorrection?: () => void; onSuspicious?: () => void;
}) {
  const titleNode = href ? (
    <Link to={href} className="font-semibold text-foreground truncate hover:text-primary underline-offset-2 hover:underline">{title}</Link>
  ) : (
    <h3 className="font-semibold text-foreground truncate">{title}</h3>
  );
  return (
    <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-base shrink-0">
          {avatar}
        </div>
        <div className="min-w-0">
          {titleNode}
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      <RowActions onApprove={onApprove} onReject={onReject} onDelete={onDelete}
        onReport={onReport} onGradeCorrection={onGradeCorrection} onSuspicious={onSuspicious} />
    </div>
  );
}


function ReviewRow({ heading, body, meta, approveLabel, onApprove, onReject, onDelete, onReport, onGradeCorrection, onSuspicious }: {
  heading: React.ReactNode; body?: string | null; meta?: string; approveLabel?: string;
  onApprove: () => void; onReject?: () => void; onDelete: () => void;
  onReport?: () => void; onGradeCorrection?: () => void; onSuspicious?: () => void;
}) {
  return (
    <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-secondary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground mb-1">{heading}</div>
        <p className="text-sm leading-relaxed mb-2 text-foreground/90">
          {body || <em className="text-muted-foreground">(no written feedback)</em>}
        </p>
        {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
      </div>
      <RowActions approveLabel={approveLabel} onApprove={onApprove} onReject={onReject} onDelete={onDelete}
        onReport={onReport} onGradeCorrection={onGradeCorrection} onSuspicious={onSuspicious} />
    </div>
  );
}

function RowActions({ approveLabel = "Approve", onApprove, onReject, onDelete, onReport, onGradeCorrection, onSuspicious }: {
  approveLabel?: string;
  onApprove: () => void; onReject?: () => void; onDelete: () => void;
  onReport?: () => void; onGradeCorrection?: () => void; onSuspicious?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <button
        onClick={onApprove}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
      >
        <Check className="w-4 h-4" /> {approveLabel}
      </button>
      {onReject && (
        <button
          onClick={onReject}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-foreground/80 border border-border bg-card hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      )}
      {onReport && (
        <button onClick={onReport} title="File a report"
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
          <Flag className="w-5 h-5" />
        </button>
      )}
      {onGradeCorrection && (
        <button onClick={onGradeCorrection} title="Request grade correction"
          className="p-2 text-primary hover:bg-primary-soft rounded-lg transition-colors">
          <BookOpen className="w-5 h-5" />
        </button>
      )}
      {onSuspicious && (
        <button onClick={onSuspicious} title="Mark as suspicious / lock user"
          className="p-2 text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors">
          <ShieldAlert className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={onDelete}
        title="Delete"
        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

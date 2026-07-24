import { Link, useParams } from "react-router-dom";
import {
  teachers, reviews, teacherStats, schoolName, teacherGrades,
  TEACHER_RATING_GROUPS, TEACHER_RATING_LABELS,
} from "@/lib/mockData";
import { StarRating } from "@/components/StarRating";
import { Flag, MapPin, MessageSquareHeart, ArrowLeft, BookOpen, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/60 text-center">
      <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: "Fraunces, serif" }}>
        {value ? value.toFixed(1) : "—"}
      </div>
      <StarRating value={value} className="justify-center my-1" />
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
export default function TeacherProfile() {
  const { id } = useParams();
  const { user, isVerified } = useAuth();
  const teacher = teachers.find(t => t.id === id);
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [gcSent, setGcSent] = useState<Record<string, boolean>>({});
  const [susSent, setSusSent] = useState<Record<string, boolean>>({});



  if (!teacher) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl mb-3">Teacher not found</h1>
        <Link to="/teachers" className="text-primary hover:underline">← Back to teachers</Link>
      </div>
    );
  }

  const stats = teacherStats(teacher.id);
  const teacherReviews = reviews.filter(r => r.teacher_id === teacher.id && r.status === "approved");
  const initials = teacher.name.replace(/(Ms\.|Mr\.|Mrs\.)\s*/g, "").split(" ").map(p => p[0]).slice(0,2).join("");
  const report = async (rid: string) => {
    if (!user) { toast.error("Please sign in to report a review."); return; }
    const reason = window.prompt("Why are you reporting this review? (e.g. inappropriate, personal info, false)");
    if (!reason || !reason.trim()) return;
    const rev = teacherReviews.find(r => r.id === rid);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rid);
    const review_id = isUuid ? rid : crypto.randomUUID();
    const details = [
      isUuid ? null : `Mock review id: ${rid}`,
      `Teacher: ${teacher.name}`,
      rev?.written_feedback ? `Excerpt: ${rev.written_feedback.slice(0, 200)}` : null,
    ].filter(Boolean).join("\n");
    const { error } = await supabase.from("reports").insert({
      review_type: "teacher_review" as any,
      review_id,
      reported_by_user_id: user.id,
      reason: reason.trim(),
      details,
    });
    if (error) { toast.error(error.message); return; }
    setReported(p => ({ ...p, [rid]: true }));
    toast.success("You have successfully reported this review.");
  };

  const requestGradeCorrection = async (rid: string) => {
    if (!user) { toast.error("Please sign in to request a grade correction."); return; }
    const requested_grade = window.prompt(`Suggest the correct grade for ${teacher.name} (e.g. "Year 3"):`, "");
    if (!requested_grade || !requested_grade.trim()) return;
    const { error } = await supabase.from("teacher_grade_corrections" as any).insert({
      teacher_id: teacher.id, teacher_name: teacher.name,
      requested_grade: requested_grade.trim(),
      submitted_by_user_id: user.id, status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    setGcSent(p => ({ ...p, [rid]: true }));
    toast.success("You have successfully requested a grade correction.");
  };

  const reportSuspicious = async (rid: string) => {
    if (!user) { toast.error("Please sign in to flag suspicious activity."); return; }
    const reason = window.prompt("Describe the suspicious activity (e.g. fake review, spam, bot):");
    if (!reason || !reason.trim()) return;
    const rev = teacherReviews.find(r => r.id === rid);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rid);
    const review_id = isUuid ? rid : crypto.randomUUID();
    const { error } = await supabase.from("reports").insert({
      review_type: "teacher_review" as any,
      review_id,
      reported_by_user_id: user.id,
      reason: `Suspicious activity: ${reason.trim()}`,
      details: [`Teacher: ${teacher.name}`, rev?.written_feedback ? `Excerpt: ${rev.written_feedback.slice(0,200)}` : null].filter(Boolean).join("\n"),
    });
    if (error) { toast.error(error.message); return; }
    setSusSent(p => ({ ...p, [rid]: true }));
    toast.success("You have successfully flagged suspicious activity.");
  };



  return (
    <div className="container py-10">
      <Link to="/teachers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to teachers
      </Link>

      <header className="bg-gradient-warm rounded-[2rem] p-8 md:p-10 border border-border/60 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {teacher.photo ? (
            <img src={teacher.photo} alt={teacher.name} loading="lazy" width={256} height={256}
              className="w-44 h-44 md:w-60 md:h-60 rounded-3xl object-cover shadow-soft" />
          ) : (
            <div className="w-44 h-44 md:w-60 md:h-60 rounded-3xl grid place-items-center text-white text-6xl font-bold shadow-soft" style={{ backgroundColor: teacher.avatar_color }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl mb-2">{teacher.name}</h1>
            <p className="text-muted-foreground mb-3">{schoolName(teacher.school_id)}</p>
            <div className="flex flex-wrap gap-2">
              {teacherGrades(teacher).map(g => (
                <span key={g} className="text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary">{g}</span>
              ))}
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-card border border-border">{teacher.class_type}</span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-card border border-border inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{teacher.location}</span>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 text-center min-w-[140px] border border-border/60">
            {stats.count >= 3 ? (
              <>
                <div className="text-4xl font-bold tabular-nums" style={{ fontFamily: "Fraunces, serif" }}>{stats.overall || "—"}</div>
                <StarRating value={stats.overall} className="justify-center my-1" />
                <div className="text-xs text-muted-foreground">{stats.count} parent review{stats.count === 1 ? "" : "s"}</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-foreground/80">Not enough reviews yet</div>
                <div className="text-xs text-muted-foreground mt-2">{stats.count}/3 approved reviews needed for a ranking</div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile-level moderation actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => report(teacher.id)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-soft">
          <Flag className="w-4 h-4" /> Report teacher
        </button>
        <button onClick={() => requestGradeCorrection(teacher.id)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft">
          <BookOpen className="w-4 h-4" /> Request grade correction
        </button>
        <button onClick={() => reportSuspicious(teacher.id)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-soft">
          <ShieldAlert className="w-4 h-4" /> Flag suspicious activity
        </button>
      </div>



      {/* Category scores */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Category scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ScoreTile label="Teaching & Learning" value={stats.teaching} />
          <ScoreTile label="Classroom Management" value={stats.classroom} />
          <ScoreTile label="Care & Wellbeing" value={stats.care} />
          <ScoreTile label="Communication" value={stats.communication} />
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl">Rating breakdown</h2>
            <Link to={`/submit?teacher=${teacher.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <MessageSquareHeart className="w-4 h-4" /> Rank Teacher
            </Link>
          </div>

          {TEACHER_RATING_GROUPS.map(group => (
            <div key={group.id} className="bg-card rounded-3xl p-6 border border-border/60 shadow-card">
              <h3 className="text-lg font-semibold mb-4">{group.label}</h3>
              {stats.breakdown ? (
                <ul className="space-y-3">
                  {group.keys.map(k => {
                    const v = stats.breakdown![k];
                    return (
                      <li key={k}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground/80">{TEACHER_RATING_LABELS[k]}</span>
                          <span className="font-semibold tabular-nums">{v.toFixed(1)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(v / 5) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No ratings yet.</p>
              )}
            </div>
          ))}
        </section>

        <aside>
          <div className="sticky top-24 space-y-4">
            <h2 className="text-2xl">Parent feedback</h2>
            {!user || !isVerified ? (
              <div className="bg-card rounded-3xl p-8 text-center border border-border/60">
                <p className="text-sm text-muted-foreground mb-4">
                  {!user
                    ? "Sign in and verify your email to read parent reviews and share your own."
                    : "Verify your email to read parent reviews and share your own."}
                </p>
                <Link to={!user ? "/auth" : "/account"} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {!user ? "Log in or sign up" : "Go to verification"}
                </Link>
              </div>
            ) : teacherReviews.length === 0 ? (

              <div className="bg-card rounded-3xl p-8 text-center border border-border/60 text-muted-foreground">
                No reviews yet. Be the first to share constructive feedback.
              </div>
            ) : teacherReviews.map(r => (
              <article key={r.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-card">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <div className="text-sm font-semibold">{r.parent_name}</div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.overall} />
                    <span className="text-sm font-semibold tabular-nums">{r.overall}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{r.created_at}</div>
                <p className="text-sm leading-relaxed text-foreground/90 mb-3">{r.written_feedback}</p>
                <div className="flex items-center gap-4 pt-1 border-t border-border/40 mt-2">
                  <button onClick={() => report(r.id)} disabled={reported[r.id]} title="Report this review"
                    className="text-xs font-medium inline-flex items-center gap-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed">
                    <Flag className="w-3.5 h-3.5" /> {reported[r.id] ? "Reported" : "Report"}
                  </button>
                  <button onClick={() => requestGradeCorrection(r.id)} disabled={gcSent[r.id]} title="Request grade correction"
                    className="text-xs font-medium inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    <BookOpen className="w-3.5 h-3.5" /> {gcSent[r.id] ? "Sent" : "Grade correction"}
                  </button>
                  <button onClick={() => reportSuspicious(r.id)} disabled={susSent[r.id]} title="Flag suspicious activity"
                    className="text-xs font-medium inline-flex items-center gap-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed">
                    <ShieldAlert className="w-3.5 h-3.5" /> {susSent[r.id] ? "Flagged" : "Suspicious"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

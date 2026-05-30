import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  teachers, schools, schoolName,
  TEACHER_RATING_GROUPS, TEACHER_RATING_LABELS,
  ALL_TEACHER_RATING_KEYS, teacherGrades,
} from "@/lib/mockData";
import { shouldFlagReview } from "@/lib/moderation";
import { StarInput } from "@/components/StarRating";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";

export default function SubmitFeedback() {
  return (
    <AuthGate message="Sign in to submit a teacher review. Reviews are moderated before being published.">
      <SubmitFeedbackForm />
    </AuthGate>
  );
}

function SubmitFeedbackForm() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const preset = params.get("teacher") ?? "";
  const presetTeacher = teachers.find(t => t.id === preset);

  const [teacherId, setTeacherId] = useState(preset);
  const [schoolId, setSchoolId] = useState(presetTeacher?.school_id ?? "");
  const [yearLevel, setYearLevel] = useState(presetTeacher?.year_level ?? "");
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(ALL_TEACHER_RATING_KEYS.map(k => [k, 0]))
  );
  const [text, setText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [wasInClass, setWasInClass] = useState(false);
  const [notBiased, setNotBiased] = useState(false);
  const [blockMsg, setBlockMsg] = useState<string | null>(null);

  const teacherOptions = teachers.filter(t => t.status === "approved");

  // Make sure the selected school + year actually match the chosen teacher's record.
  const chosenTeacher = teachers.find(t => t.id === teacherId);
  const schoolMismatch = !!chosenTeacher && !!schoolId && chosenTeacher.school_id !== schoolId;
  const yearMismatch = !!chosenTeacher && !!yearLevel && chosenTeacher.year_level !== yearLevel;

  const triggerLockout = async (reason: string) => {
    const { data: until } = await (supabase.rpc as any)("lock_me_out", { _minutes: 60, _reason: reason });
    await supabase.auth.signOut();
    const when = until ? new Date(until as string) : null;
    toast.error(
      `That teacher, school, and year level don't match any record. You've been signed out and can't submit reviews for 1 hour${
        when ? ` (until ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""
      }.`,
      { duration: 8000 },
    );
    nav("/auth");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockMsg(null);

    // Lockout check first — blocks even before validation.
    const { data: lockedUntil } = await (supabase.rpc as any)("my_lockout");
    if (lockedUntil) {
      const when = new Date(lockedUntil as string);
      toast.error(`Submissions are disabled until ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
      return;
    }

    if (!teacherId || !schoolId || !yearLevel) return toast.error("Please complete teacher, school, and year level.");
    const missing = ALL_TEACHER_RATING_KEYS.filter(k => !ratings[k] || ratings[k] <= 0);
    if (missing.length) {
      const names = missing.map(k => TEACHER_RATING_LABELS[k]).slice(0, 3).join(", ");
      return toast.error(`Please rate: ${names}${missing.length > 3 ? ` and ${missing.length - 3} more` : ""}.`);
    }

    if (schoolMismatch) { await triggerLockout("Teacher/school mismatch on review submission"); return; }
    if (yearMismatch) { await triggerLockout("Teacher/year-level mismatch on review submission"); return; }

    if (!wasInClass) return toast.error("Please confirm you were actually in this teacher's class.");
    if (!notBiased) return toast.error("Please confirm your review is fair, not biased or based on hearsay.");
    if (!confirmed) return toast.error("Please confirm the feedback pledge.");

    // Pre-submit safety check on the written feedback itself.
    const check = shouldFlagReview(text);
    if (check.block) {
      setBlockMsg(check.reason || "This review can't be submitted. Please reword it.");
      return;
    }


    const num = (k: string) => Number((ratings as any)[k]) || 0;
    const groupAvg = (keys: string[]) => {
      const vs = keys.map(num).filter(v => v > 0);
      return vs.length ? Number((vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2)) : null;
    };
    const teaching_clarity_rating = groupAvg(["teaching_clarity", "lesson_planning", "subject_knowledge", "assessment_feedback"]);
    const homework_rating = groupAvg(["homework_quality"]);
    const classroom_support_rating = groupAvg(["classroom_management", "behaviour_handling"]);
    const engagement_rating = groupAvg(["student_engagement", "motivation"]);
    const wellbeing_rating = groupAvg(["student_wellbeing", "kindness_respect", "inclusiveness", "emotional_support"]);
    const communication_rating = groupAvg(["parent_communication", "responsiveness", "transparency", "parent_meetings"]);

    const vals = ALL_TEACHER_RATING_KEYS.map(k => Number(ratings[k]) || 0);
    const overall = vals.reduce((a, b) => a + b, 0) / vals.length;
    const t = teachers.find(x => x.id === teacherId);

    const { error } = await supabase.from("teacher_reviews").insert({
      user_id: user!.id,
      teacher_name: t?.name ?? null,
      school_name: schoolName(schoolId),
      year_level: yearLevel,
      written_feedback: text.trim(),
      overall_rating: Number(overall.toFixed(2)),
      teaching_clarity_rating,
      homework_rating,
      classroom_support_rating,
      engagement_rating,
      wellbeing_rating,
      communication_rating,
      status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks! Your review was submitted and is pending moderation.");
    nav(`/account`);
  };

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl mb-2">Submit teacher review</h1>
      <p className="text-muted-foreground mb-8">Share constructive, fair feedback about your child's classroom learning experience. All feedback is moderated before publishing.</p>

      <div className="bg-accent-soft border border-accent/30 rounded-2xl p-4 mb-8 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-[hsl(var(--heading))] shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">Please don't include student names, photos, or private information about children or families. Be specific and kind.</p>
      </div>

      <form onSubmit={submit} className="bg-card rounded-3xl border border-border/60 shadow-card p-6 md:p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Teacher">
            <select value={teacherId} onChange={e => {
              setTeacherId(e.target.value);
              const t = teachers.find(x => x.id === e.target.value);
              if (t) { setSchoolId(t.school_id); setYearLevel(t.year_level); }
            }} className={inputCls}>
              <option value="">Select teacher…</option>
              {teacherOptions.map(t => <option key={t.id} value={t.id}>{t.name} — {schoolName(t.school_id)}</option>)}
            </select>
          </Field>
          <Field label="School">
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className={inputCls}>
              <option value="">Select school…</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Year level">
            <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} className={inputCls}>
              <option value="">Select year…</option>
              {["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold mb-1">Rate each area</h2>
            <p className="text-xs text-muted-foreground">1 = needs improvement · 5 = excellent</p>
          </div>
          {TEACHER_RATING_GROUPS.map(group => (
            <div key={group.id} className="bg-secondary/40 rounded-2xl p-4 border border-border/40">
              <h3 className="text-base font-semibold mb-3 text-foreground/90">{group.label}</h3>
              <div className="space-y-3">
                {group.keys.map(k => {
                  const label = TEACHER_RATING_LABELS[k];
                  return (
                    <div
                      key={k}
                      className="bg-card rounded-xl border border-border/40 p-3 flex flex-col gap-2"
                    >
                      <span className="text-sm font-medium text-foreground/90 leading-snug break-words">
                        {label}
                      </span>
                      <StarInput
                        value={ratings[k]}
                        onChange={v => setRatings(r => ({ ...r, [k]: v }))}
                        name={label}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {(schoolMismatch || yearMismatch) && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-sm text-destructive">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Heads up:</strong> {chosenTeacher?.name} is recorded as teaching{" "}
              {chosenTeacher?.year_level} at {schoolName(chosenTeacher!.school_id)}.
              Please pick a teacher you were actually taught by.
            </div>
          </div>
        )}

        <Field label="Written feedback (optional)">
          <textarea value={text} onChange={e => { setText(e.target.value); setBlockMsg(null); }} rows={5}
            placeholder="Optional — what's working well? What could grow? Stay focused on the classroom learning experience."
            className={`${inputCls} resize-none leading-relaxed`} maxLength={1200} />
          <div className="text-xs text-muted-foreground text-right mt-1">{text.length}/1200</div>
          {blockMsg && (
            <div className="mt-2 flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{blockMsg}</span>
            </div>
          )}
        </Field>

        <div className="space-y-2">
          <label className="flex items-start gap-3 bg-secondary/50 rounded-2xl p-4 cursor-pointer">
            <input type="checkbox" checked={wasInClass} onChange={e => setWasInClass(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary" />
            <span className="text-sm">I was actually a student in this teacher's class at the school and year level above.</span>
          </label>
          <label className="flex items-start gap-3 bg-secondary/50 rounded-2xl p-4 cursor-pointer">
            <input type="checkbox" checked={notBiased} onChange={e => setNotBiased(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary" />
            <span className="text-sm">My review is fair and based on real classroom experiences — not gossip, jokes, or because I didn't like a grade.</span>
          </label>
          <label className="flex items-start gap-3 bg-secondary/50 rounded-2xl p-4 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary" />
            <span className="text-sm">I confirm this feedback is respectful, truthful, and based on my own experience.</span>
          </label>
        </div>

        <button type="submit" className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          Submit feedback for review
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

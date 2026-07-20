import { Link } from "react-router-dom";
import { MapPin, MessageSquareHeart, Flag, BookOpen, ShieldAlert } from "lucide-react";
import { Teacher, schoolName, teacherStats } from "@/lib/mockData";
import { StarRating } from "./StarRating";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  const stats = teacherStats(teacher.id);
  const initials = teacher.name.replace(/(Ms\.|Mr\.|Mrs\.)\s*/g, "").split(" ").map(p => p[0]).slice(0,2).join("");
  const { user } = useAuth();
  const [reported, setReported] = useState(false);
  const [gcSent, setGcSent] = useState(false);
  const [susSent, setSusSent] = useState(false);

  const isUuid = (x: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const report = async (e: React.MouseEvent) => {
    stop(e);
    if (!user) { toast.error("Please sign in to report this teacher."); return; }
    const reason = window.prompt(`Why are you reporting ${teacher.name}? (e.g. wrong info, not a real teacher)`);
    if (!reason || !reason.trim()) return;
    const review_id = isUuid(teacher.id) ? teacher.id : crypto.randomUUID();
    const { error } = await supabase.from("reports").insert({
      review_type: "teacher" as any, review_id,
      reported_by_user_id: user.id, reason: reason.trim(),
      details: `Teacher listing: ${teacher.name} (${schoolName(teacher.school_id)})`,
    });
    if (error) { toast.error(error.message); return; }
    setReported(true);
    toast.success("You have successfully reported this teacher.");
  };

  const requestGradeCorrection = async (e: React.MouseEvent) => {
    stop(e);
    if (!user) { toast.error("Please sign in to request a grade correction."); return; }
    const requested_grade = window.prompt(`Suggest the correct grade for ${teacher.name} (e.g. "Year 3"):`, "");
    if (!requested_grade || !requested_grade.trim()) return;
    const { error } = await supabase.from("teacher_grade_corrections" as any).insert({
      teacher_id: teacher.id, teacher_name: teacher.name,
      requested_grade: requested_grade.trim(),
      submitted_by_user_id: user.id, status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    setGcSent(true);
    toast.success("You have successfully requested a grade correction.");
  };

  const reportSuspicious = async (e: React.MouseEvent) => {
    stop(e);
    if (!user) { toast.error("Please sign in to flag suspicious activity."); return; }
    const reason = window.prompt("Describe the suspicious activity (e.g. fake profile, spam):");
    if (!reason || !reason.trim()) return;
    const review_id = isUuid(teacher.id) ? teacher.id : crypto.randomUUID();
    const { error } = await supabase.from("reports").insert({
      review_type: "teacher" as any, review_id,
      reported_by_user_id: user.id,
      reason: `Suspicious activity: ${reason.trim()}`,
      details: `Teacher listing: ${teacher.name} (${schoolName(teacher.school_id)})`,
    });
    if (error) { toast.error(error.message); return; }
    setSusSent(true);
    toast.success("You have successfully flagged suspicious activity.");
  };

  return (
    <Link to={`/teachers/${teacher.id}`} className="group block">
      <article className="h-full bg-card rounded-3xl p-6 shadow-card border border-border/60 hover:shadow-soft hover:-translate-y-0.5 transition-all">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl grid place-items-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: teacher.avatar_color }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-tight truncate">{teacher.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{schoolName(teacher.school_id)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary">{teacher.year_level}</span>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{teacher.class_type}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          {stats.count >= 3 ? (
            <>
              <div className="flex items-center gap-2">
                <StarRating value={stats.overall} />
                <span className="text-sm font-semibold tabular-nums">{stats.overall || "—"}</span>
              </div>
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <MessageSquareHeart className="w-3.5 h-3.5" />{stats.count} review{stats.count === 1 ? "" : "s"}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              Not enough reviews yet ({stats.count}/3)
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />{teacher.location}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={report} disabled={reported} title="Report"
              className="text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed">
              <Flag className="w-3.5 h-3.5" />
            </button>
            <button onClick={requestGradeCorrection} disabled={gcSent} title="Request grade correction"
              className="text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed">
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button onClick={reportSuspicious} disabled={susSent} title="Flag suspicious activity"
              className="text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed">
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

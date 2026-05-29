import { Link } from "react-router-dom";
import { MapPin, MessageSquareHeart } from "lucide-react";
import { Teacher, schoolName, teacherStats } from "@/lib/mockData";
import { StarRating } from "./StarRating";

export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  const stats = teacherStats(teacher.id);
  const initials = teacher.name.replace(/(Ms\.|Mr\.|Mrs\.)\s*/g, "").split(" ").map(p => p[0]).slice(0,2).join("");
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
          <div className="flex items-center gap-2">
            <StarRating value={stats.overall} />
            <span className="text-sm font-semibold tabular-nums">{stats.overall || "—"}</span>
          </div>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <MessageSquareHeart className="w-3.5 h-3.5" />{stats.count} review{stats.count === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />{teacher.location}
        </div>
      </article>
    </Link>
  );
}

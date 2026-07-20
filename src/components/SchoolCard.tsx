import { Link } from "react-router-dom";
import { MapPin, Users, Flag, ShieldAlert } from "lucide-react";
import { PrimarySchool, schoolStats } from "@/lib/schoolsData";
import { StarRating } from "@/components/StarRating";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary/60 px-3 py-2 text-center">
      <div className="text-sm font-semibold tabular-nums">{value ? value.toFixed(1) : "—"}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export default function SchoolCard({ school }: { school: PrimarySchool }) {
  const stats = schoolStats(school.id);
  const { user } = useAuth();
  const [reported, setReported] = useState(false);
  const [susSent, setSusSent] = useState(false);

  const isUuid = (x: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);

  const flag = async (kind: "report" | "suspicious") => {
    if (!user) { toast.error("Please sign in to flag this school."); return; }
    const prompt = kind === "report"
      ? `Why are you reporting ${school.name}?`
      : "Describe the suspicious activity (e.g. fake school, spam):";
    const reason = window.prompt(prompt);
    if (!reason || !reason.trim()) return;
    const review_id = isUuid(school.id) ? school.id : crypto.randomUUID();
    const { error } = await supabase.from("reports").insert({
      review_type: "school_review" as any, review_id,
      reported_by_user_id: user.id,
      reason: kind === "suspicious" ? `Suspicious activity: ${reason.trim()}` : reason.trim(),
      details: `School listing: ${school.name} (${school.suburb}, ${school.state})`,
    });
    if (error) { toast.error(error.message); return; }
    if (kind === "report") { setReported(true); toast.success("You have successfully reported this school."); }
    else { setSusSent(true); toast.success("You have successfully flagged suspicious activity."); }
  };
  return (
    <article className="bg-card rounded-3xl border border-border/60 shadow-card overflow-hidden flex flex-col">
      <div className="h-36 relative overflow-hidden" style={{ backgroundColor: school.cover_color }}>
        <img
          src={school.cover_image}
          alt={`${school.name} campus`}
          loading="lazy"
          width={1024}
          height={640}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-card/90 text-foreground shadow-card">
          {school.school_type}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold leading-tight mb-1">{school.name}</h3>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" /> {school.suburb}, {school.state}
        </p>

        {stats.count >= 3 ? (
          <div className="flex items-center gap-2 mb-4">
            <StarRating value={stats.overall} />
            <span className="text-sm font-semibold tabular-nums">{stats.overall || "—"}</span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Users className="w-3 h-3" /> {stats.count} review{stats.count === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <div className="mb-4 text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> Not enough reviews yet ({stats.count}/3)
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-5">
          <MiniStat label="Clean" value={stats.breakdown?.cleanliness ?? 0} />
          <MiniStat label="Space" value={stats.breakdown?.school_space ?? 0} />
          <MiniStat label="Location" value={stats.breakdown?.location_convenience ?? 0} />
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link to={`/schools/${school.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            View School Profile
          </Link>
          <button onClick={() => flag("report")} disabled={reported} title="Report this school"
            className="p-2.5 rounded-full border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-40 disabled:cursor-not-allowed">
            <Flag className="w-4 h-4" />
          </button>
          <button onClick={() => flag("suspicious")} disabled={susSent} title="Flag suspicious activity"
            className="p-2.5 rounded-full border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-40 disabled:cursor-not-allowed">
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

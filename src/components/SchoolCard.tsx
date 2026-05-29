import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { PrimarySchool, schoolStats } from "@/lib/schoolsData";
import { StarRating } from "@/components/StarRating";

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

        <div className="flex items-center gap-2 mb-4">
          <StarRating value={stats.overall} />
          <span className="text-sm font-semibold tabular-nums">{stats.overall || "—"}</span>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> {stats.count} review{stats.count === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <MiniStat label="Clean" value={stats.breakdown?.cleanliness ?? 0} />
          <MiniStat label="Space" value={stats.breakdown?.school_space ?? 0} />
          <MiniStat label="Location" value={stats.breakdown?.location_convenience ?? 0} />
        </div>

        <Link to={`/schools/${school.id}`}
          className="mt-auto inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          View School Profile
        </Link>
      </div>
    </article>
  );
}

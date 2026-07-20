import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flag, MapPin, MessageSquareHeart, GraduationCap, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  findSchool, schoolReviews, schoolStats,
  RATING_GROUPS, RATING_LABELS,
} from "@/lib/schoolsData";
import { teachers as allTeachers, schools as mockSchools } from "@/lib/mockData";
import { StarRating } from "@/components/StarRating";
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

export default function SchoolProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const school = findSchool(id || "");
  const [reported, setReported] = useState<Record<string, boolean>>({});


  if (!school) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl mb-3">School not found</h1>
        <Link to="/schools" className="text-primary hover:underline">← Back to schools</Link>
      </div>
    );
  }

  const stats = schoolStats(school.id);
  const reviews = schoolReviews.filter(r => r.school_id === school.id && r.status === "approved");

  // Match teachers to this school via shared first word of the school name (the two mock data sets use different IDs)
  const firstWord = school.name.split(" ")[0].toLowerCase();
  const schoolTeachers = allTeachers.filter(t => {
    if (t.status !== "approved") return false;
    const mockSchool = mockSchools.find(s => s.id === t.school_id);
    return mockSchool ? mockSchool.name.toLowerCase().startsWith(firstWord) : false;
  });
  const report = async (rid: string) => {
    if (!user) { toast.error("Please sign in to report a review."); return; }
    const reason = window.prompt("Why are you reporting this review? (e.g. inappropriate, personal info, false)");
    if (!reason || !reason.trim()) return;
    const rev = reviews.find(r => r.id === rid);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rid);
    const review_id = isUuid ? rid : crypto.randomUUID();
    const details = [
      isUuid ? null : `Mock review id: ${rid}`,
      `School: ${school.name}`,
      rev?.written_feedback ? `Excerpt: ${rev.written_feedback.slice(0, 200)}` : null,

    ].filter(Boolean).join("\n");
    const { error } = await supabase.from("reports").insert({
      review_type: "school" as any,
      review_id,
      reported_by_user_id: user.id,
      reason: reason.trim(),
      details,
    });
    if (error) { toast.error(error.message); return; }
    setReported(p => ({ ...p, [rid]: true }));
    toast.success("Thanks — this review has been flagged for moderator review.");
  };



  return (
    <div className="container py-10">
      <Link to="/schools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to schools
      </Link>

      <div className="rounded-[2rem] overflow-hidden mb-6 border border-border/60 shadow-card">
        <img
          src={school.cover_image}
          alt={`${school.name} campus`}
          loading="lazy"
          width={1536}
          height={768}
          className="w-full h-48 md:h-72 object-cover"
        />
      </div>

      <header className="bg-gradient-warm rounded-[2rem] p-8 md:p-10 border border-border/60 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl grid place-items-center text-white text-3xl font-bold shadow-soft"
            style={{ backgroundColor: school.cover_color }}>
            {school.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl mb-2">{school.name}</h1>
            <p className="text-muted-foreground inline-flex items-center gap-1 mb-3">
              <MapPin className="w-4 h-4" /> {school.suburb}, {school.state}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary">{school.school_type}</span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-card border border-border">
                {stats.count} parent review{stats.count === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-sm text-foreground/80 mt-4 max-w-2xl">{school.blurb}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 text-center min-w-[140px] border border-border/60">
            {stats.count >= 3 ? (
              <>
                <div className="text-4xl font-bold tabular-nums" style={{ fontFamily: "Fraunces, serif" }}>
                  {stats.overall || "—"}
                </div>
                <StarRating value={stats.overall} className="justify-center my-1" />
                <div className="text-xs text-muted-foreground">Overall</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-foreground/80">Not enough reviews yet</div>
                <div className="text-xs text-muted-foreground mt-2">{stats.count}/3 approved reviews needed</div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Teachers at this school */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Teachers at this school
        </h2>
        {schoolTeachers.length === 0 ? (
          <div className="bg-card rounded-3xl p-6 border border-border/60 text-sm text-muted-foreground">
            No teacher profiles yet. <Link to="/add-teacher" className="text-primary hover:underline">Add a teacher</Link>.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolTeachers.map(t => (
              <Link key={t.id} to={`/teachers/${t.id}`}
                className="bg-card rounded-3xl p-4 border border-border/60 shadow-card flex items-center gap-4 hover:shadow-soft hover:-translate-y-0.5 transition-all">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} loading="lazy" width={64} height={64}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl grid place-items-center text-white font-bold shrink-0"
                    style={{ backgroundColor: t.avatar_color }}>
                    {t.name.split(" ").slice(-1)[0][0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.year_level} · {t.class_type}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Category scores */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Category scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ScoreTile label="Learning" value={stats.learning} />
          <ScoreTile label="Environment" value={stats.environment} />
          <ScoreTile label="Location & convenience" value={stats.location} />
          <ScoreTile label="Community" value={stats.community} />
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8">
        {/* Grouped breakdown */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl">Rating breakdown</h2>
            <Link to={`/submit-school?school=${school.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <MessageSquareHeart className="w-4 h-4" /> Rank School
            </Link>
          </div>

          {RATING_GROUPS.map(group => (
            <div key={group.id} className="bg-card rounded-3xl p-6 border border-border/60 shadow-card">
              <h3 className="text-lg font-semibold mb-4">{group.label}</h3>
              {stats.breakdown ? (
                <ul className="space-y-3">
                  {group.keys.map(k => {
                    const v = stats.breakdown![k];
                    return (
                      <li key={k}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground/80">{RATING_LABELS[k]}</span>
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

        {/* Parent feedback */}
        <aside>
          <div className="sticky top-24 space-y-4">
            <h2 className="text-2xl">Student reviews</h2>
            {!user ? (
              <div className="bg-card rounded-3xl p-8 text-center border border-border/60">
                <p className="text-sm text-muted-foreground mb-4">Sign in to read student reviews and share your own.</p>
                <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Log in or sign up
                </Link>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-card rounded-3xl p-8 text-center border border-border/60 text-muted-foreground">
                No reviews yet.
              </div>
            ) : reviews.map(r => (
              <article key={r.id} className="bg-card rounded-3xl p-5 border border-border/60 shadow-card">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <div className="text-sm font-semibold">{r.parent_name}</div>
                  <div className="flex items-center gap-2">
                    <StarRating value={
                      +(Object.values(r.ratings).reduce((a, b) => a + b, 0) /
                        Object.values(r.ratings).length).toFixed(1)
                    } />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{r.created_at}</div>
                <p className="text-sm leading-relaxed text-foreground/90 mb-3">{r.written_feedback}</p>
                <button onClick={() => report(r.id)} disabled={reported[r.id]}
                  className="text-xs font-medium inline-flex items-center gap-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed">
                  <Flag className="w-3.5 h-3.5" /> {reported[r.id] ? "Reported" : "Report Review"}
                </button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

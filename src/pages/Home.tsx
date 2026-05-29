import { Link, useNavigate } from "react-router-dom";
import { Search, Users, MessageSquareHeart, PlusCircle, ShieldCheck, Heart, Sparkles, BookOpen, GraduationCap, School as SchoolIcon } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { teachers, teacherStats, schoolName } from "@/lib/mockData";
import { primarySchools } from "@/lib/schoolsData";
import TeacherCard from "@/components/TeacherCard";

export default function Home() {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"schools" | "teachers">("schools");
  const [openSuggest, setOpenSuggest] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenSuggest(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [] as { id: string; label: string; sub: string; href: string }[];
    if (scope === "schools") {
      return primarySchools
        .filter(s =>
          s.name.toLowerCase().includes(term) ||
          s.suburb.toLowerCase().includes(term) ||
          s.state.toLowerCase().includes(term)
        )
        .slice(0, 6)
        .map(s => ({ id: s.id, label: s.name, sub: `${s.suburb}, ${s.state} · ${s.school_type}`, href: `/schools/${s.id}` }));
    }
    return teachers
      .filter(t => t.status === "approved")
      .filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.year_level.toLowerCase().includes(term) ||
        t.location.toLowerCase().includes(term) ||
        schoolName(t.school_id).toLowerCase().includes(term)
      )
      .slice(0, 6)
      .map(t => ({ id: t.id, label: t.name, sub: `${t.year_level} · ${schoolName(t.school_id)}`, href: `/teachers/${t.id}` }));
  }, [q, scope]);

  const topRated = useMemo(() => {
    return [...teachers]
      .filter(t => t.status === "approved")
      .map(t => ({ t, s: teacherStats(t.id) }))
      .sort((a, b) => b.s.overall - a.s.overall)
      .slice(0, 3)
      .map(({ t }) => t);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/${scope}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-x-clip bg-gradient-hero">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur text-sm font-medium text-primary border border-border/60 mb-6">
              <Sparkles className="w-4 h-4" /> For the students and parents of primary schools
            </span>
            <h1 className="text-4xl md:text-6xl leading-[1.05] mb-5">
              Respectful teacher feedback <br className="hidden md:block" />for better primary school learning.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Share fair, constructive feedback about classroom learning experiences — and help your school community grow together.
            </p>

            <div className="max-w-2xl mx-auto mb-6" ref={wrapRef}>
              <div className="inline-flex p-1 bg-card/80 backdrop-blur border border-border/60 rounded-full mb-3 shadow-card">
                {(["schools", "teachers"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setScope(s); setOpenSuggest(true); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${scope === s ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <form onSubmit={onSearch} className="bg-card rounded-full shadow-soft border border-border/60 flex items-center p-2">
                  <Search className="w-5 h-5 text-muted-foreground ml-4 mr-2 shrink-0" />
                  <input
                    value={q}
                    onChange={e => { setQ(e.target.value); setOpenSuggest(true); }}
                    onFocus={() => setOpenSuggest(true)}
                    placeholder={scope === "schools" ? "Search a school by name, suburb, or state" : "Search a teacher by name, year level, or school"}
                    className="flex-1 bg-transparent outline-none py-3 text-sm placeholder:text-muted-foreground"
                  />
                  <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">Search</button>
                </form>

                {openSuggest && q.trim() && (
                  <div className="absolute left-0 right-0 mt-2 bg-card rounded-3xl border border-border/60 shadow-soft overflow-hidden z-50 text-left animate-fade-in max-h-[min(70vh,420px)] flex flex-col">
                    {suggestions.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-muted-foreground">
                        No matching {scope} — press Search to see the full list.
                      </div>
                    ) : (
                      <ul className="max-h-80 overflow-auto">
                        {suggestions.map(item => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => { setOpenSuggest(false); nav(item.href); }}
                              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors"
                            >
                              <span className="w-9 h-9 rounded-2xl grid place-items-center bg-primary-soft text-[hsl(var(--heading))] shrink-0">
                                {scope === "schools" ? <SchoolIcon className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold truncate">{item.label}</span>
                                <span className="block text-xs text-muted-foreground truncate">{item.sub}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/teachers" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-card hover:bg-primary/90 transition-colors">
                <Users className="w-4 h-4" /> Browse Teachers
              </Link>
              <Link to="/submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-sunny text-[hsl(var(--sunny-foreground))] font-semibold text-sm shadow-card hover:opacity-90 transition-opacity">
                <MessageSquareHeart className="w-4 h-4" /> Submit Student Reviews
              </Link>
              <Link to="/add-teacher" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm shadow-card hover:opacity-90 transition-opacity">
                <PlusCircle className="w-4 h-4" /> Add Teacher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highly rated */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2">Highly rated teachers</h2>
            <p className="text-muted-foreground">Recognised by their parent community for care, clarity, and consistency.</p>
          </div>
          <Link to="/teachers" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topRated.map(t => <TeacherCard key={t.id} teacher={t} />)}
        </div>
      </section>

      {/* Rules */}
      <section className="bg-secondary/40 border-y border-border/60">
        <div className="container py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl mb-3">How feedback works here</h2>
            <p className="text-muted-foreground">TeacherRank is a constructive feedback platform — not a complaint or gossip site. Every review is moderated before it appears publicly.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Heart, title: "Be respectful & fair", body: "Focus on the learning experience. Use neutral, kind language — the kind you'd appreciate receiving.", iconBg: "bg-primary-soft", iconText: "text-[hsl(var(--heading))]" },
              { icon: BookOpen, title: "Stay specific & truthful", body: "Share what you've personally observed as a parent or guardian. Avoid hearsay, accusations, or speculation.", iconBg: "bg-accent", iconText: "text-accent-foreground" },
              { icon: ShieldCheck, title: "Protect children's privacy", body: "Never include student names, photos, or private personal information about children or families.", iconBg: "bg-sunny/30", iconText: "text-[hsl(var(--sunny-foreground))]" },
            ].map(({ icon: Icon, title, body, iconBg, iconText }) => (
              <div key={title} className="bg-card rounded-3xl p-7 border border-border/60 shadow-card">
                <span className={`inline-grid place-items-center w-12 h-12 rounded-2xl mb-4 ${iconBg} ${iconText}`}><Icon className="w-5 h-5" /></span>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Constructive promise */}
      <section className="container py-20">
        <div className="bg-gradient-warm rounded-[2rem] p-10 md:p-14 border border-border/60 grid md:grid-cols-[1.4fr,1fr] gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl mb-4">Built for school communities, not complaints.</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              TeacherRank exists so parents and guardians can recognise great teachers and share constructive observations that help every classroom thrive. Reviews that bully, accuse, or share private information are never published.
            </p>
            <Link to="/submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              <MessageSquareHeart className="w-4 h-4" /> Share constructive feedback
            </Link>
          </div>
          <ul className="space-y-3">
            {["Moderated by humans before publishing", "Report button on every review", "Year-level and class-type context", "Average across 6 fair rating dimensions"].map(item => (
              <li key={item} className="flex items-start gap-3 bg-card/70 rounded-2xl p-4 border border-border/40">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

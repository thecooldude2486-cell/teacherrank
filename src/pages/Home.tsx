import { Link, useNavigate } from "react-router-dom";
import { Search, Users, MessageSquareHeart, PlusCircle, Sparkles, GraduationCap, School as SchoolIcon } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { teachers, schoolName } from "@/lib/mockData";
import { primarySchools } from "@/lib/schoolsData";

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
    </>
  );
}

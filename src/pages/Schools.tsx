import { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, MessageSquareHeart } from "lucide-react";
import { primarySchools, schoolStats } from "@/lib/schoolsData";
import { rankingScore } from "@/lib/ranking";
import SchoolCard from "@/components/SchoolCard";
import { useAuth } from "@/hooks/useAuth";

export default function Schools() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  const ranked = useMemo(() => {
    return primarySchools
      .filter(s => type === "all" || s.school_type === type)
      .filter(s => {
        const t = q.trim().toLowerCase();
        if (!t) return true;
        return (
          s.name.toLowerCase().includes(t) ||
          s.suburb.toLowerCase().includes(t) ||
          s.state.toLowerCase().includes(t)
        );
      })
      .map(s => ({ s, stats: schoolStats(s.id) }))
      .sort((a, b) => rankingScore(b.stats.overall, b.stats.count) - rankingScore(a.stats.overall, a.stats.count));
  }, [q, type]);

  return (
    <div className="container py-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl mb-2">Primary school rankings</h1>
          <p className="text-muted-foreground">Overall scores based on parent feedback across learning, environment, location and community.</p>
        </div>
        <Link to={user ? "/submit-school" : "/auth"}
          onClick={(e) => {
            if (!user) return;
            e.preventDefault();
            const el = document.getElementById("submit-school");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            else navigate("/submit-school");
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity self-start">
          <MessageSquareHeart className="w-4 h-4" /> Rank School
        </Link>
      </header>


      <div className="bg-card rounded-3xl border border-border/60 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 inline-flex items-center gap-2 bg-secondary/60 rounded-full px-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search school or suburb"
            className="flex-1 bg-transparent outline-none py-2.5 text-sm" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-secondary/60 rounded-full px-4 py-2.5 text-sm outline-none">
          <option value="all">All school types</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
          <option value="Catholic">Catholic</option>
          <option value="Independent">Independent</option>
        </select>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-card rounded-3xl p-10 text-center border border-border/60 text-muted-foreground">
          No schools match those filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ranked.map(({ s }) => <SchoolCard key={s.id} school={s} />)}
        </div>
      )}
    </div>
  );
}

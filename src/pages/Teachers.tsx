import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { teachers, schools, teacherStats, schoolName } from "@/lib/mockData";
import TeacherCard from "@/components/TeacherCard";
import { SlidersHorizontal, Search } from "lucide-react";

export default function Teachers() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [school, setSchool] = useState("all");
  const [year, setYear] = useState("all");
  const [classType, setClassType] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("all");
  const [sort, setSort] = useState<"rating" | "reviews" | "newest">("rating");

  const yearLevels = Array.from(new Set(teachers.map(t => t.year_level)));
  const classTypes = Array.from(new Set(teachers.map(t => t.class_type)));
  const locations = Array.from(new Set(teachers.map(t => t.location)));

  const list = useMemo(() => {
    const filtered = teachers
      .filter(t => t.status === "approved")
      .filter(t => {
        const query = q.trim().toLowerCase();
        if (!query) return true;
        const hay = `${t.name} ${schoolName(t.school_id)} ${t.year_level} ${t.class_type} ${t.location}`.toLowerCase();
        const tokens = query.split(/\s+/).filter(Boolean);
        return tokens.every(tok => hay.includes(tok));
      })
      .filter(t => school === "all" || t.school_id === school)
      .filter(t => year === "all" || t.year_level === year)
      .filter(t => classType === "all" || t.class_type === classType)
      .filter(t => location === "all" || t.location === location)
      .map(t => ({ t, s: teacherStats(t.id) }))
      .filter(({ s }) => s.overall >= minRating);

    filtered.sort((a, b) => {
      if (sort === "rating") return b.s.overall - a.s.overall;
      if (sort === "reviews") return b.s.count - a.s.count;
      return b.t.created_at.localeCompare(a.t.created_at);
    });
    return filtered.map(({ t }) => t);
  }, [q, school, year, classType, location, minRating, sort]);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl mb-2">Browse teachers</h1>
        <p className="text-muted-foreground">Explore teachers in your community. All ratings are averaged from moderated parent feedback.</p>
      </div>

      <div className="bg-card rounded-3xl p-5 md:p-6 border border-border/60 shadow-card mb-8">
        <div className="flex items-center gap-3 bg-secondary/60 rounded-full px-4 py-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search teacher, school, location…"
            className="flex-1 bg-transparent outline-none py-2 text-sm placeholder:text-muted-foreground" />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select label="School" value={school} onChange={setSchool} options={[["all", "All schools"], ...schools.map(s => [s.id, s.name] as [string, string])]} />
          <Select label="Year level" value={year} onChange={setYear} options={[["all", "All years"], ...yearLevels.map(y => [y, y] as [string, string])]} />
          <Select label="Class type" value={classType} onChange={setClassType} options={[["all", "All types"], ...classTypes.map(c => [c, c] as [string, string])]} />
          <Select label="Location" value={location} onChange={setLocation} options={[["all", "All locations"], ...locations.map(l => [l, l] as [string, string])]} />
          <Select label="Min rating" value={String(minRating)} onChange={v => setMinRating(Number(v))} options={[["0", "Any"], ["1", "1+ stars"], ["2", "2+ stars"], ["3", "3+ stars"], ["4", "4+ stars"], ["5", "5 stars"]]} />
          <Select label="Sort by" value={sort} onChange={v => setSort(v as typeof sort)} options={[["rating", "Highest rated"], ["reviews", "Most reviewed"], ["newest", "Newest added"]]} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
        <SlidersHorizontal className="w-4 h-4" />
        Showing <span className="font-semibold text-foreground">{list.length}</span> teacher{list.length === 1 ? "" : "s"}
      </div>

      {list.length === 0 ? (
        <div className="bg-card rounded-3xl p-12 text-center border border-border/60">
          <p className="text-muted-foreground">No teachers match your filters yet. Try broadening your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(t => <TeacherCard key={t.id} teacher={t} />)}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-secondary/60 border border-border rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

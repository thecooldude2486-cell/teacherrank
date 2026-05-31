import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import {
  primarySchools,
  ALL_RATING_KEYS, RATING_LABELS, RATING_GROUPS, Ratings,
} from "@/lib/schoolsData";
import { StarInput } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";

const emptyRatings = (): Ratings => {
  const o = {} as Ratings;
  ALL_RATING_KEYS.forEach(k => { o[k] = 0; });
  return o;
};

// Map UI rating keys (from schoolsData) -> DB column names (from school_reviews).
const COL: Record<string, string> = {
  teaching_quality: "teaching_quality_rating",
  academic_support: "academic_support_rating",
  homework_load: "homework_rating",
  student_wellbeing: "wellbeing_rating",
  safety_behaviour: "safety_rating",
  cleanliness: "cleanliness_rating",
  school_space: "school_space_rating",
  playground: "playground_rating",
  facilities: "facilities_rating",
  toilets_hygiene: "toilets_hygiene_rating",
  canteen: "canteen_rating",
  sports_facilities: "sports_facilities_rating",
  library_resources: "library_resources_rating",
  location_convenience: "location_convenience_rating",
  parking: "parking_rating",
  public_transport: "public_transport_rating",
  dropoff_pickup: "dropoff_pickup_rating",
  walking_biking: "walking_biking_rating",
  traffic_safety: "traffic_safety_rating",
  nearby_facilities: "nearby_facilities_rating",
  communication_parents: "communication_rating",
  extracurricular: "extracurricular_rating",
  inclusiveness: "inclusiveness_rating",
  parent_community: "parent_community_rating",
  school_culture: "school_culture_rating",
};
const LEARNING_UI = ["teaching_quality","academic_support","homework_load","student_wellbeing"] as const;
const ENVIRONMENT_UI = ["safety_behaviour","cleanliness","school_space","playground","facilities","toilets_hygiene","canteen","sports_facilities","library_resources"] as const;
const LOCATION_UI = ["location_convenience","parking","public_transport","dropoff_pickup","walking_biking","traffic_safety","nearby_facilities"] as const;
const COMMUNITY_UI = ["communication_parents","extracurricular","inclusiveness","parent_community","school_culture"] as const;

const avg = (r: Ratings, keys: readonly string[]) => {
  const vals = keys.map(k => Number((r as any)[k]) || 0).filter(v => v > 0);
  return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : null;
};

export default function SubmitSchoolFeedback() {
  return (
    <AuthGate message="Sign in to submit a school review. Reviews are moderated before being published.">
      <SubmitSchoolFeedbackForm />
    </AuthGate>
  );
}

function SubmitSchoolFeedbackForm() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [schoolId, setSchoolId] = useState(params.get("school") || "");
  const [parentName, setParentName] = useState("");
  const [text, setText] = useState("");
  const [ratings, setRatings] = useState<Ratings>(emptyRatings());
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const setOne = (k: keyof Ratings, v: number) => setRatings(r => ({ ...r, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const { data: lockedUntil } = await (supabase.rpc as any)("my_lockout");
    if (lockedUntil) {
      const when = new Date(lockedUntil as string);
      toast.error(`Submissions are disabled until ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
      return;
    }

    if (!schoolId) return toast.error("Please choose a school.");

    // One review per school rule.
    if (user) {
      const school = primarySchools.find(s => s.id === schoolId);
      const labelName = school ? `${school.name} — ${school.suburb}, ${school.state}` : null;
      if (labelName) {
        const { data: existing } = await supabase
          .from("school_reviews")
          .select("id,status")
          .eq("user_id", user.id)
          .eq("school_name", labelName)
          .in("status", ["pending", "approved"])
          .limit(1);
        if (existing && existing.length > 0) {
          toast.error("You have already submitted feedback. You can edit your existing feedback or wait for admin review.");
          nav("/account");
          return;
        }
      }
    }

    if (!parentName.trim()) return toast.error("Please add a display name (e.g. 'A parent').");
    if (ALL_RATING_KEYS.some(k => ratings[k] === 0)) return toast.error("Please rate every category.");
    if (!agree) return toast.error("Please confirm the community guidelines.");

    const school = primarySchools.find(s => s.id === schoolId);
    const payload: any = {
      user_id: user!.id,
      school_name: school ? `${school.name} — ${school.suburb}, ${school.state}` : null,
      written_feedback: text.trim(),
      status: "pending",
      overall_rating: avg(ratings, ALL_RATING_KEYS as any),
      learning_score: avg(ratings, LEARNING_UI),
      environment_score: avg(ratings, ENVIRONMENT_UI),
      location_score: avg(ratings, LOCATION_UI),
      community_score: avg(ratings, COMMUNITY_UI),
    };
    for (const k of ALL_RATING_KEYS) {
      const col = COL[k];
      if (col) payload[col] = Number((ratings as any)[k]) || null;
    }

    setBusy(true);
    const { error } = await supabase.from("school_reviews").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks! Your school review was submitted and is pending moderation.");
    nav(`/account`);
  };


  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl mb-2">Submit school feedback</h1>
      <p className="text-muted-foreground mb-8">
        Share constructive, respectful feedback about your child's primary school. All reviews are moderated before publishing.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <div className="bg-card rounded-3xl p-6 border border-border/60 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">School</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)}
              className="w-full bg-secondary/60 rounded-2xl px-4 py-3 text-sm outline-none">
              <option value="">Choose a school…</option>
              {primarySchools.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.suburb}, {s.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Your display name</label>
            <input value={parentName} onChange={e => setParentName(e.target.value)}
              placeholder='e.g. "A parent"'
              className="w-full bg-secondary/60 rounded-2xl px-4 py-3 text-sm outline-none" />
          </div>
        </div>

        {RATING_GROUPS.map(group => (
          <div key={group.id} className="bg-card rounded-3xl p-6 border border-border/60 shadow-card">
            <h2 className="text-lg font-semibold mb-4">{group.label}</h2>
            <div className="space-y-3">
              {group.keys.map(k => (
                <div key={k} className="flex items-center justify-between gap-3 flex-wrap py-1.5">
                  <span className="text-sm text-foreground/90">{RATING_LABELS[k]}</span>
                  <StarInput value={ratings[k]} onChange={v => setOne(k, v)} name={RATING_LABELS[k]} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-card rounded-3xl p-6 border border-border/60 shadow-card">
          <label className="block text-sm font-semibold mb-2">Written feedback</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
            placeholder="Share what works well and constructive suggestions. Avoid naming children, staff or families."
            className="w-full bg-secondary/60 rounded-2xl px-4 py-3 text-sm outline-none resize-y" />
          <p className="text-xs text-muted-foreground mt-2">{text.trim().length} / 30 characters minimum</p>
        </div>

        <label className="flex items-start gap-3 bg-primary-soft/60 rounded-3xl p-5 border border-border/60 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary" />
          <span className="text-sm leading-relaxed">
            <ShieldCheck className="w-4 h-4 inline mr-1 text-primary" />
            I'm a parent or guardian. My feedback is truthful, respectful, and contains no
            children's names, private information, accusations, or offensive language.
          </span>
        </label>

        <div className="flex justify-end">
          <button type="submit"
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Submit for moderation
          </button>
        </div>
      </form>
    </div>
  );
}

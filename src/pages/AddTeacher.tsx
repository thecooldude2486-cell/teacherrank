import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { schools } from "@/lib/mockData";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";

export default function AddTeacher() {
  return (
    <AuthGate message="Sign in to suggest a teacher. Suggestions are reviewed before they appear publicly.">
      <AddTeacherForm />
    </AuthGate>
  );
}

function AddTeacherForm() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [classType, setClassType] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !schoolId || !yearLevel || !classType.trim() || !location.trim()) {
      return toast.error("Please complete every field.");
    }
    setBusy(true);
    const { error } = await supabase.from("teachers").insert({
      name: name.trim(),
      year_level: yearLevel,
      class_type: classType.trim(),
      location: location.trim(),
      status: "pending",
      submitted_by_user_id: user!.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks! Your teacher suggestion is pending admin approval.");
    nav("/account");
  };

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl md:text-4xl mb-2">Suggest a teacher</h1>
      <p className="text-muted-foreground mb-8">Don't see a teacher listed? Add them here. An admin will review and approve before they appear publicly.</p>

      <div className="bg-primary-soft border border-primary/20 rounded-2xl p-4 mb-8 flex gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">New listings are kept <strong>pending</strong> until a moderator confirms the teacher and school details.</p>
      </div>

      <form onSubmit={submit} className="bg-card rounded-3xl border border-border/60 shadow-card p-6 md:p-8 space-y-5">
        <Field label="Teacher name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ms. Eleanor Hayes" className={inputCls} maxLength={80} />
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="School">
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className={selectCls}>
              <option value="">Select school…</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Year level taught">
            <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} className={selectCls}>
              <option value="">Select year…</option>
              {["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Subject or class type">
          <input value={classType} onChange={e => setClassType(e.target.value)} placeholder="e.g. General Classroom, Arts & Music, PE" className={inputCls} maxLength={60} />
        </Field>
        <Field label="Location">
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" className={inputCls} maxLength={60} />
        </Field>

        <button type="submit" disabled={busy} className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
          {busy ? "Submitting…" : "Submit for approval"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

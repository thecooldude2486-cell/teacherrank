import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { GraduationCap, ChevronLeft, ChevronRight, Quote, ShieldCheck, Sparkles, Users } from "lucide-react";
import { isAllowedEduEmail, redirectToDoeLogin } from "@/lib/authPolicy";
import classroom from "@/assets/auth-classroom.jpg";
import notebook from "@/assets/auth-notebook.jpg";
import books from "@/assets/auth-books.jpg";
import students from "@/assets/auth-students.jpg";


const slides = [
  {
    image: classroom,
    kicker: "Built for school communities",
    title: "Feedback that helps teachers grow",
    body: "Share thoughtful experiences from real classrooms — moderated for kindness and truth.",
    icon: Sparkles,
    accent: "from-primary/30 to-transparent",
  },
  {
    image: notebook,
    kicker: "Five gentle dimensions",
    title: "Rate what actually matters",
    body: "Clarity, helpfulness, fairness, engagement and homework — never personal attacks.",
    icon: Quote,
    accent: "from-accent/30 to-transparent",
  },
  {
    image: books,
    kicker: "Reviewed by humans",
    title: "Every word is moderated",
    body: "Our admins read each submission before it goes public. No bullying, ever.",
    icon: ShieldCheck,
    accent: "from-primary/25 to-transparent",
  },
  {
    image: students,
    kicker: "Students & parents together",
    title: "A community that listens",
    body: "Join thousands giving teachers the constructive feedback they deserve.",
    icon: Users,
    accent: "from-accent/25 to-transparent",
  },
];

const PORTAL_URL = "https://student.det.nsw.edu.au/";


export default function Auth() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  const go = (dir: number) => setSlide(s => (s + dir + slides.length) % slides.length);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedEduEmail(email)) {
      toast.error("Use your name.surname@education.nsw.gov.au address to continue.");
      return;
    }
    // Open the new tab synchronously inside the user gesture so popup blockers allow it.
    const portalTab = window.open("about:blank", "_blank");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      if (portalTab && !portalTab.closed) {
        portalTab.location.href = PORTAL_URL;
      } else {
        window.location.href = PORTAL_URL;
      }
    } catch (err: any) {
      if (portalTab && !portalTab.closed) portalTab.close();
      toast.error(err.message || "Authentication failed");
    } finally { setBusy(false); }
  };



  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 gap-0">
      {/* Slides panel */}
      <div
        className="relative overflow-hidden bg-secondary/40 min-h-[340px] lg:min-h-full order-1 lg:order-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${i === slide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            aria-hidden={i !== slide}
          >
            <img
              src={s.image}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              width={1024}
              height={1280}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${s.accent}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
          </div>
        ))}

        {/* Top brand */}
        <div className="relative z-10 p-6 lg:p-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-background">
            <span className="w-10 h-10 rounded-2xl bg-background/15 backdrop-blur-md border border-background/20 grid place-items-center">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>TeacherRank</span>
          </Link>
          <span className="hidden sm:inline-flex text-xs uppercase tracking-[0.18em] text-background/80 bg-background/10 backdrop-blur-md border border-background/20 rounded-full px-3 py-1.5">
            {String(slide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 lg:p-10 text-background">
          <div key={slide} className="animate-fade-in max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-background/90 mb-4">
              <Icon className="w-3.5 h-3.5" />
              {current.kicker}
            </div>
            <h2 className="text-3xl lg:text-5xl leading-[1.05] font-medium mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              {current.title}
            </h2>
            <p className="text-background/85 max-w-md leading-relaxed">{current.body}</p>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? "w-10 bg-background" : "w-4 bg-background/40 hover:bg-background/70"}`}
                />
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full border border-background/30 bg-background/10 backdrop-blur-md text-background grid place-items-center hover:bg-background/20 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full border border-background/30 bg-background/10 backdrop-blur-md text-background grid place-items-center hover:bg-background/20 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>TeacherRank</span>
            </Link>
          </div>

          <div className="inline-flex p-1 bg-secondary/60 rounded-full mb-8">
            {(["login", "signup"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="text-4xl lg:text-5xl font-medium leading-tight mb-2" style={{ fontFamily: "Fraunces, serif" }}>
            {mode === "login" ? (
              <>Welcome <em className="italic text-primary">back</em>.</>
            ) : (
              <>Join the <em className="italic text-primary">conversation</em>.</>
            )}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login"
              ? "Sign in to submit reviews and track your contributions."
              : "Create your account to share constructive teacher feedback."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Display name">
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputCls} placeholder="A parent or student" maxLength={60} />
              </Field>
            )}
            <Field label="Email">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} autoComplete="email" placeholder="you@school.edu" />
            </Field>
            <Field label="Password">
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 6 characters" />
            </Field>

            <button disabled={busy} type="submit" className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
              {busy ? "Please wait…" : mode === "login" ? "Log in to TeacherRank" : "Create my account"}
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center leading-relaxed">
            By continuing you agree to keep feedback respectful, truthful and based on your own experience.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80 mb-1.5 ml-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

import { Link } from "react-router-dom";
import { LogIn, ArrowRight, ShieldCheck, MessageSquareHeart, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGate({ children, message }: { children: React.ReactNode; message?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container py-16 text-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) {
    return (
      <div className="container max-w-3xl py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-card">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative grid md:grid-cols-[1.1fr_0.9fr] gap-0">
            {/* Left: copy + CTA */}
            <div className="p-8 md:p-12">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Members only
              </span>
              <h2
                className="text-4xl md:text-5xl leading-[1.05] font-medium mb-4"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Sign in to <em className="italic text-primary">join the conversation</em>.
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {message ?? "Create a free account to submit reviews, suggest teachers and track everything you've shared with the community."}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" /> Log in or sign up
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/teachers"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-background/60 backdrop-blur font-semibold text-sm hover:bg-secondary/60 transition-colors"
                >
                  Keep browsing
                </Link>
              </div>
            </div>

            {/* Right: feature cards */}
            <div className="relative bg-secondary/40 p-8 md:p-10 border-t md:border-t-0 md:border-l border-border/60">
              <div className="space-y-4">
                <FeatureRow
                  icon={MessageSquareHeart}
                  title="Share your experience"
                  body="Rate teachers across five gentle dimensions."
                />
                <FeatureRow
                  icon={ShieldCheck}
                  title="Always moderated"
                  body="Every review is reviewed by humans before going live."
                />
                <FeatureRow
                  icon={Sparkles}
                  title="Track your contributions"
                  body="See approvals and pending submissions in one place."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function FeatureRow({ icon: Icon, title, body }: { icon: typeof LogIn; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/70 backdrop-blur border border-border/40 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
      <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-primary-soft text-primary">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <div className="font-semibold text-sm mb-0.5">{title}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

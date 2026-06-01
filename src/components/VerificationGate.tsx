import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function VerificationGate({ children }: { children: React.ReactNode }) {
  const { isVerified, isAdmin, loading } = useAuth();
  if (loading) return <div className="container py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  if (isVerified || isAdmin) return <>{children}</>;
  return (
    <div className="container max-w-2xl py-16">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card p-8 text-center">
        <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-primary-soft text-primary mb-4">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>Verification required</h2>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          Only verified accounts can submit reviews. Please submit your verification details on your account page — an admin will review them.
        </p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          TeacherRank is not affiliated with NSW Department of Education. Opening the NSW portal does not verify your account.
        </p>
        <Link
          to="/account"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
        >
          Go to verification <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

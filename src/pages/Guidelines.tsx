import { ShieldCheck, BookOpen, Heart, AlertTriangle, Info, MessageSquareHeart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Guidelines() {
  return (
    <div className="container max-w-3xl py-12">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/15 text-primary text-[11px] font-semibold uppercase tracking-wide mb-3">
        <ShieldCheck className="w-3.5 h-3.5" /> Community guidelines
      </span>
      <h1 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: "Fraunces, serif" }}>
        Respectful, moderated feedback
      </h1>
      <p className="text-muted-foreground mb-8">
        TeacherRank exists so parents and guardians can share constructive,
        respectful feedback about their child's primary school experience. Please
        read these guidelines before submitting a review.
      </p>

      <div className="space-y-4">
        <Card icon={Heart} title="What TeacherRank is for">
          Honest, respectful parent and guardian feedback that helps families and
          improves primary school communities. Focus on the classroom learning
          experience.
        </Card>

        <Card icon={AlertTriangle} title="Please do not include" tone="danger">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Children's names or any private information about students or families.</li>
            <li>Bullying, harassment, or personal attacks against staff, parents, or children.</li>
            <li>Offensive language, slurs, or insults.</li>
            <li>Unsupported accusations of serious misconduct.</li>
          </ul>
        </Card>

        <Card icon={ShieldCheck} title="All reviews are moderated">
          Every teacher and school review is saved as pending and reviewed by a
          moderator before it appears publicly or affects rankings. Rankings are
          only shown once a teacher or school has at least 3 approved reviews.
        </Card>

        <Card icon={BookOpen} title="One review per teacher or school">
          You can submit one active review per teacher and one per school. If you
          need to update your feedback, edit your existing review from your
          account.
        </Card>

        <Card icon={Info} title="Independence">
          TeacherRank is an independent community platform. It is not affiliated
          with the NSW Department of Education or any school.
        </Card>
      </div>

      {/* How feedback works here */}
      <section className="mt-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl mb-3">How feedback works here</h2>
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
      </section>

      {/* Constructive promise */}
      <section className="mt-12">
        <div className="bg-gradient-warm rounded-[2rem] p-8 md:p-12 border border-border/60 grid md:grid-cols-[1.4fr,1fr] gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl mb-4">Built for school communities, not complaints.</h2>
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
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  tone,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <section
      className={
        "bg-card rounded-3xl border shadow-card p-5 md:p-6 " +
        (tone === "danger" ? "border-destructive/30" : "border-border/60")
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            "w-10 h-10 rounded-2xl grid place-items-center shrink-0 " +
            (tone === "danger"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary-soft text-primary")
          }
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold mb-1">{title}</h2>
          <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
        </div>
      </div>
    </section>
  );
}

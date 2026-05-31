import { ShieldCheck, BookOpen, Heart, AlertTriangle, Info } from "lucide-react";

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

import { Link, Outlet, useLocation } from "react-router-dom";
import { GraduationCap, Home, Menu, X, Undo2, Redo2, LogIn, UserCircle2, Users, Building2, MessageSquarePlus, UserPlus, ShieldCheck, ArrowRight, LogOut, BookOpen } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/teachers", label: "Browse Teachers", icon: Users },
  { to: "/schools", label: "School Rankings", icon: Building2 },
  { to: "/submit", label: "Rank Teacher", icon: MessageSquarePlus },
  { to: "/add-teacher", label: "Add Teacher", icon: UserPlus },
  { to: "/guidelines", label: "Community Guidelines", icon: BookOpen },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

function pathToSectionId(path: string) {
  if (path.startsWith("/teachers/")) return "teacher-profile";
  if (path.startsWith("/schools/")) return "school-profile";
  return path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
}

function scrollToSectionSmooth(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}


export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleMenuClick = (to: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (to === location.pathname) {
      e.preventDefault();
      const id = pathToSectionId(to);
      setTimeout(() => scrollToSectionSmooth(id), 80);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="container flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-1">
              <button
                onClick={() => window.history.back()}
                aria-label="Undo (go back)"
                title="Undo — go to previous page"
                className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-primary-soft text-foreground/80 hover:text-[hsl(var(--heading))] transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.history.forward()}
                aria-label="Redo (go forward)"
                title="Redo — go to next page"
                className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-primary-soft text-foreground/80 hover:text-[hsl(var(--heading))] transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-soft group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>TeacherRank</span>
            </Link>
          </div>
          <button
            className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-secondary hover:bg-primary-soft border border-border/50 text-sm font-medium transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
        {open && (
          <nav className="border-t border-border bg-background animate-fade-in">

            <div className="container py-3 flex flex-col gap-1">
              {links.map(l => {
                const Icon = l.icon;
                return (
                  <Link key={l.to} to={l.to}
                    onClick={handleMenuClick(l.to)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-secondary transition-colors">
                    <span className="w-8 h-8 rounded-xl bg-secondary grid place-items-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    {l.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  <Link to="/account" onClick={handleMenuClick("/account")} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-secondary">
                    <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                      {(user.email ?? "?").charAt(0).toUpperCase()}
                    </span>
                    Account
                  </Link>
                  <button onClick={() => { setOpen(false); signOut(); }} className="flex items-center gap-3 text-left px-4 py-3 rounded-2xl text-sm font-medium hover:bg-secondary">
                    <span className="w-8 h-8 rounded-xl bg-secondary grid place-items-center"><LogOut className="w-4 h-4" /></span>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground">
                    <span className="w-8 h-8 rounded-xl bg-secondary grid place-items-center">
                      <UserCircle2 className="w-4 h-4" />
                    </span>
                    You don't have an account
                  </div>
                  <Link to="/auth" onClick={handleMenuClick("/auth")} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-primary text-primary-foreground">
                    <span className="inline-flex items-center gap-3"><LogIn className="w-4 h-4" /> Log in / Sign up</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-border bg-secondary/50 mt-16">
        <div className="container py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>TeacherRank</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">Respectful, moderated feedback from parents — for stronger primary school communities.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base">Community guidelines</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Be kind, fair, and specific.</li>
              <li>No children's names or private details.</li>
              <li>Every review is moderated.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base">Explore</h4>
            <ul className="space-y-2 text-muted-foreground">
              {links.map(l => <li key={l.to}><Link to={l.to} onClick={handleMenuClick(l.to)} className="hover:text-foreground transition-colors">{l.label}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="container py-4 border-t border-border text-xs text-muted-foreground">© {new Date().getFullYear()} TeacherRank. For parents and guardians of primary school students.</div>
      </footer>
    </div>
  );
}

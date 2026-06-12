import { useEffect } from "react";
import { useLocation, useMatch } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Home from "./Home";
import Teachers from "./Teachers";
import Schools from "./Schools";
import SubmitFeedback from "./SubmitFeedback";
import SubmitSchoolFeedback from "./SubmitSchoolFeedback";
import AddTeacher from "./AddTeacher";
import Admin from "./Admin";
import Account from "./Account";
import Auth from "./Auth";
import TeacherProfile from "./TeacherProfile";
import SchoolProfile from "./SchoolProfile";
import Guidelines from "./Guidelines";


type Section = { id: string; path: string; label: string; Component: React.ComponentType; when?: boolean };

function TeacherProfileSlot() {
  const match = useMatch("/teachers/:id");
  if (!match) return null;
  return (
    <section id="teacher-profile" aria-label="Teacher profile" className="scroll-mt-20">
      <TeacherProfile />
    </section>
  );
}

function SchoolProfileSlot() {
  const match = useMatch("/schools/:id");
  if (!match) return null;
  return (
    <section id="school-profile" aria-label="School profile" className="scroll-mt-20">
      <SchoolProfile />
    </section>
  );
}

const sections: Section[] = [
  { id: "home", path: "/", label: "Home", Component: Home },
  { id: "teachers", path: "/teachers", label: "Browse Teachers", Component: Teachers },
  { id: "schools", path: "/schools", label: "School Rankings", Component: Schools },
  { id: "submit", path: "/submit", label: "Submit Feedback", Component: SubmitFeedback },
  { id: "submit-school", path: "/submit-school", label: "Submit School Feedback", Component: SubmitSchoolFeedback },
  { id: "add-teacher", path: "/add-teacher", label: "Add Teacher", Component: AddTeacher },
  { id: "admin", path: "/admin", label: "Admin", Component: Admin },
  { id: "guidelines", path: "/guidelines", label: "Community Guidelines", Component: Guidelines },
  { id: "account", path: "/account", label: "My account", Component: Account },
  { id: "auth", path: "/auth", label: "Log in / Sign up", Component: Auth },
];

export default function OnePage() {
  const { hash, pathname } = useLocation();
  const { user } = useAuth();
  const gatedIds = new Set(["submit", "submit-school", "add-teacher", "admin"]);
  const visibleSections = sections.filter(s => {
    if (s.id === "auth") return !user;
    if (s.id === "account") return !!user;
    if (gatedIds.has(s.id)) return !!user;
    return true;
  });
  const teacherMatch = useMatch("/teachers/:id");
  const schoolMatch = useMatch("/schools/:id");


  useEffect(() => {
    const fromHash = hash.replace("#", "");
    let fromPath: string | undefined;
    if (teacherMatch) fromPath = "teacher-profile";
    else if (schoolMatch) fromPath = "school-profile";
    else fromPath = sections.find(s => s.path === pathname)?.id;

    const id = fromHash || fromPath || "home";

    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Fallback: scroll to top if target section isn't found
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Allow the DOM to fully settle before scrolling
    const timer = setTimeout(scroll, 100);
    return () => clearTimeout(timer);
  }, [hash, pathname, teacherMatch, schoolMatch]);

  const scrollToSectionTop = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render only the section that matches the current route (one page per URL).
  if (teacherMatch) {
    return (
      <section id="teacher-profile" aria-label="Teacher profile" className="scroll-mt-20">
        <TeacherProfile />
      </section>
    );
  }
  if (schoolMatch) {
    return (
      <section id="school-profile" aria-label="School profile" className="scroll-mt-20">
        <SchoolProfile />
      </section>
    );
  }

  const activeId = sections.find(s => s.path === pathname)?.id ?? "home";
  const active = visibleSections.find(s => s.id === activeId) ?? visibleSections[0];
  const ActiveComponent = active.Component;

  return (
    <section id={active.id} aria-label={active.label} className="scroll-mt-20 relative">
      <ActiveComponent />
      {active.id !== "home" && (
        <div className="container flex justify-center pb-12">
          <button
            type="button"
            onClick={() => scrollToSectionTop(active.id)}
            aria-label={`Back to top of ${active.label}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-sm font-medium"
          >
            <ArrowUp className="w-4 h-4" />
            Back to top of {active.label}
          </button>
        </div>
      )}
    </section>
  );
}

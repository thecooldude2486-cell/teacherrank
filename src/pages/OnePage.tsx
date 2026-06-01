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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (id === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }, [hash, pathname, teacherMatch, schoolMatch]);

  const scrollToSectionTop = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {visibleSections.map(({ id, label, Component }, idx) => (
        <section
          key={id}
          id={id}
          aria-label={label}
          className="scroll-mt-20 relative"
        >
          <Component />
          {idx > 0 && (
            <div className="container flex justify-center pb-12">
              <button
                type="button"
                onClick={() => scrollToSectionTop(id)}
                aria-label={`Back to top of ${label}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-sm font-medium"
              >
                <ArrowUp className="w-4 h-4" />
                Back to top of {label}
              </button>
            </div>
          )}
        </section>
      ))}
      <TeacherProfileSlot />
      <SchoolProfileSlot />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";

const AppShell = lazy(() => import("@/AppShell"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeacherRank" },
      { name: "description", content: "Respectful, moderated feedback from parents — for stronger primary school communities." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-background" />;
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AppShell />
    </Suspense>
  );
}

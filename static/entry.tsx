// Client-only entry point for the static (GitHub Pages) build.
// No SSR, no server functions — everything talks to Supabase from the browser.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppShell from "@/AppShell";
import "@/styles.css";

const queryClient = new QueryClient();

// GitHub Pages serves 404.html for unknown paths; restore the requested route.
const redirect = new URLSearchParams(window.location.search).get("redirect");
if (redirect) {
  window.history.replaceState(null, "", redirect);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  </StrictMode>,
);

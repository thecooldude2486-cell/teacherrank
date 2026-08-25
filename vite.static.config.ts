import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Static, fully client-side build for GitHub Pages.
// Usage: npm run build:static  (set BASE_PATH=/<repo>/ for project pages)
export default defineConfig({
  root: "static",
  base: process.env.BASE_PATH ?? "/",
  publicDir: "../public",
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../.output/public",
    emptyOutDir: true,
  },
});

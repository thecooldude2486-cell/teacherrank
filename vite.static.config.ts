import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Static, fully client-side build for GitHub Pages.
// Usage: npm run build:static  (set BASE_PATH=/<repo>/ for project pages)
export default defineConfig({
  root: "static",
  base: process.env.BASE_PATH ?? "/",
  publicDir: "../public",
  plugins: [tsconfigPaths({ root: "." }), react(), tailwindcss()],
  build: {
    outDir: "../.output/public",
    emptyOutDir: true,
  },
});

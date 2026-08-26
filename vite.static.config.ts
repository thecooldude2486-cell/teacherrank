import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  root: "static",
  base: process.env.BASE_PATH ?? "/",

  // Allow the static browser build to read the Supabase public variables
  envPrefix: ["VITE_", "SUPABASE_"],

  publicDir: "../public",

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },

  plugins: [react(), tailwindcss()],

  build: {
    outDir: "../.output/public",
    emptyOutDir: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false, // allows Vite to serve files outside root
    },
  },
  build: {
    rollupOptions: {
      input: "/index.html", // ensures SPA fallback works
    },
  },
});

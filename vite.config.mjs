import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "github-pages"
    ? `${(process.env.VITE_BASE_PATH || "/vao-dev-portfolio").replace(/\/$/, "")}/`
    : "/",
  define: {
    "import.meta.env.VITE_STATIC_HOST": JSON.stringify(mode === "github-pages"),
  },
  build: {
    emptyOutDir: true,
    outDir: mode === "github-pages" ? "dist/pages" : "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
}));

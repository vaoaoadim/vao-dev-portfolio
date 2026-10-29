import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

const embeddedGameDev = {
  name: "embedded-game-dev",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url?.startsWith("/games/beautybomb/")) {
        request.url = request.url
          .replace("/games/beautybomb/assets/", "/embedded/beautybomb/public/assets/")
          .replace("/games/beautybomb/", "/embedded/beautybomb/");
      }
      next();
    });
  },
  transformIndexHtml(html, context) {
    if (!context.filename.replaceAll("\\", "/").endsWith("/embedded/beautybomb/index.html")) return html;
    return [{
      tag: "style",
      children: readFileSync(new URL("./embedded/beautybomb/src/styles.css", import.meta.url), "utf8"),
      injectTo: "head",
    }];
  },
};

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
  plugins: [react(), embeddedGameDev],
}));

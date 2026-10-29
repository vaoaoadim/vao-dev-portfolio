import { build } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../embedded/beautybomb/", import.meta.url));
const output = path.resolve(process.argv[2] || "dist/pages", "games/beautybomb");

await build({
  configFile: false,
  envFile: false,
  root,
  base: "./",
  plugins: [{
    name: "inline-game-shell",
    transformIndexHtml() {
      return [{ tag: "style", children: readFileSync(path.join(root, "src/styles.css"), "utf8"), injectTo: "head" }];
    },
  }],
  build: {
    target: "es2022",
    outDir: output,
    emptyOutDir: true,
  },
});

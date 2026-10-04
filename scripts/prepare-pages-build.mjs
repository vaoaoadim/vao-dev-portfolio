import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { caseSlugs } from "../src/caseStudyRoutes.js";

const output = fileURLToPath(new URL("../dist/pages/", import.meta.url));
for (const slug of Object.values(caseSlugs)) {
  const directory = path.join(output, "work", slug);
  mkdirSync(directory, { recursive: true });
  copyFileSync(path.join(output, "index.html"), path.join(directory, "index.html"));
}
writeFileSync(path.join(output, ".nojekyll"), "");
console.log("Prepared GitHub Pages case routes");

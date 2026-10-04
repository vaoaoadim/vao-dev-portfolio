import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { caseSlugs } from "../src/caseStudyRoutes.js";

const output = new URL("../dist/pages/", import.meta.url);
const base = `${(process.env.VITE_BASE_PATH || "/vao-dev-portfolio").replace(/\/$/, "")}/`;

test("Pages serves every case directly with the same application shell", async () => {
  const home = await readFile(new URL("index.html", output), "utf8");
  assert.ok(home.includes(`${base}assets/`));
  await access(new URL(".nojekyll", output));
  for (const slug of Object.values(caseSlugs)) {
    assert.equal(await readFile(new URL(`work/${slug}/index.html`, output), "utf8"), home);
  }
});

test("Pages HTML, CSS and chunks resolve their static asset references", async () => {
  const walk = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => {
      const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
      return entry.isDirectory() ? walk(url) : [url];
    }))).flat();
  };
  const files = await walk(output);
  let references = 0;
  for (const file of files.filter((url) => /\.(html|css|js)$/.test(url.pathname))) {
    const source = await readFile(file, "utf8");
    for (const [, url] of source.matchAll(/["'(`]([^"'`()\s]+\.(?:avif|css|js|png|svg|webp|woff2?|mp4)(?:\?[^"'`()\s]*)?)["')`]/g)) {
      if (url.includes("${") || /^(?:https?:|data:)/.test(url)) continue;
      if (file.pathname.endsWith(".js") && url.startsWith("/") && !url.startsWith(base)) continue;
      if (url.startsWith("/")) {
        assert.ok(url.startsWith(base), `Asset escapes Pages base: ${url}`);
        await access(new URL(url.slice(base.length).split("?")[0], output));
      } else if (url.startsWith("assets/")) {
        await access(new URL(url.split("?")[0], output));
      } else if (url.startsWith("./") || /-[\w-]{8,}\.(?:css|js|woff2?)$/.test(url)) {
        await access(new URL(url.split("?")[0], file));
      } else continue;
      references++;
    }
  }
  assert.ok(references > 30, "Expected emitted asset references");
});

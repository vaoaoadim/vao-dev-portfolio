import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Editable vector layout; the existing portfolio character stays unchanged.
// Requires Liberation Sans and Liberation Mono (or the SVG fallback fonts).
const source = new URL("../public/assets/social/portfolio-cover-v3.svg", import.meta.url);
const output = new URL("../public/assets/social/portfolio-cover-v3.png", import.meta.url);
const avatar = await readFile(new URL("../public/assets/footer/avatar-head-v1.png", import.meta.url));
const svg = (await readFile(source, "utf8")).replace(
  'href="../footer/avatar-head-v1.png"',
  `href="data:image/png;base64,${avatar.toString("base64")}"`,
);
await writeFile(output, await sharp(Buffer.from(svg)).png().toBuffer());
console.log("Rendered social preview: 1200×630 PNG");

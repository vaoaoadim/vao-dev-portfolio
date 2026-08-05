import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const sourceDir = resolve(process.cwd(), "assets-source");
const outputDir = resolve(process.cwd(), "public", "assets");

const assets = [
  "office-light-landscape",
  "office-dark-landscape",
  "office-light-portrait",
  "office-dark-portrait",
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  const input = resolve(sourceDir, `${asset}.png`);

  await Promise.all([
    copyFile(input, resolve(outputDir, `${asset}.png`)),
    sharp(input)
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(resolve(outputDir, `${asset}.webp`)),
    sharp(input)
      .avif({ quality: 75, effort: 7, chromaSubsampling: "4:4:4" })
      .toFile(resolve(outputDir, `${asset}.avif`)),
  ]);
}

console.log(`Prepared ${assets.length} source assets as PNG, WebP, and AVIF.`);

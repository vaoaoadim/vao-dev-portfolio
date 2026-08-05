#!/usr/bin/env node

import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const variants = [
  ["landscape", 1672, 941],
  ["portrait", 941, 1672],
];

for (const [orientation, width, height] of variants) {
  const input = path.join(
    root,
    "assets-source",
    `office-dark-${orientation}-generated.png`,
  );
  const output = path.join(root, "assets-source", `office-dark-${orientation}.png`);
  const metadata = await sharp(input).metadata();
  const right = Math.max(0, width - (metadata.width ?? 0));
  const bottom = Math.max(0, height - (metadata.height ?? 0));

  if ((metadata.width ?? 0) > width || (metadata.height ?? 0) > height) {
    throw new Error(`Generated ${orientation} image exceeds ${width}x${height}`);
  }

  await sharp(input)
    .extend({ right, bottom, background: { r: 27, g: 30, b: 37 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);

  const finalMetadata = await sharp(output).metadata();
  console.log(`${orientation}: ${finalMetadata.width}x${finalMetadata.height}`);
}

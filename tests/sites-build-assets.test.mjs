import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDirectory = path.join(root, "dist", "client");
const assetsDirectory = path.join(clientDirectory, "assets");

async function listFiles(directory, relativeTo = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(absolutePath, relativeTo)
        : [path.relative(relativeTo, absolutePath)];
    }),
  );
  return files.flat();
}

test("keeps every transitive Vite asset required by the deployed application", async () => {
  const assetNames = await listFiles(assetsDirectory);
  const emittedAssets = new Set(assetNames);
  const referencedAssets = new Set();
  const inspectableFiles = [
    path.join(clientDirectory, "index.html"),
    ...assetNames
      .filter((name) => /\.(?:css|js)$/.test(name))
      .map((name) => path.join(assetsDirectory, name)),
  ];

  for (const file of inspectableFiles) {
    const contents = await readFile(file, "utf8");
    for (const match of contents.matchAll(
      /(?:\/assets\/|\.\/)([^\s"'`()]+\.(?:avif|css|gif|jpe?g|js|png|svg|webp|woff2?))/g,
    )) {
      if (!match[1].includes("${")) referencedAssets.add(match[1]);
    }
  }

  assert.ok(referencedAssets.size > 0);
  for (const assetName of referencedAssets) {
    assert.ok(
      emittedAssets.has(assetName),
      `Missing transitive build asset: ${assetName}`,
    );
    await access(path.join(assetsDirectory, assetName));
  }
});

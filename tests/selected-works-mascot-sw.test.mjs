import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const origin = "https://portfolio.test";
const assetPath = "/assets/selected-works/selected-work-mascot-v1.mp4";

const keyPath = (key) => {
  if (typeof key === "string") return new URL(key, origin).pathname;
  return new URL(key.url).pathname;
};

test("pre-caches mascot media and serves cached MP4 range requests", async () => {
  const handlers = new Map();
  const cachedResponses = new Map();
  const cache = {
    match: async (key) => cachedResponses.get(keyPath(key))?.clone(),
    put: async (key, response) => {
      cachedResponses.set(keyPath(key), response.clone());
    },
  };
  const caches = {
    open: async () => cache,
    keys: async () => ["selected-works-mascot-media-v1"],
    delete: async () => true,
  };
  const self = {
    location: { origin },
    addEventListener: (name, handler) => handlers.set(name, handler),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const context = vm.createContext({
    Response,
    URL,
    caches,
    fetch: async (request) => {
      const path = keyPath(request);
      const type = path.endsWith(".mp4") ? "video/mp4" : "image/png";
      return new Response(new Uint8Array(64), {
        headers: { "content-type": type },
      });
    },
    self,
  });
  const source = await readFile(
    new URL("../public/selected-works-mascot-sw.js", import.meta.url),
    "utf8",
  );

  vm.runInContext(source, context);

  let installPromise;
  handlers.get("install")({
    waitUntil: (promise) => {
      installPromise = promise;
    },
  });
  await installPromise;

  assert.equal(cachedResponses.size, 3);
  assert.ok(cachedResponses.has(assetPath));

  let responsePromise;
  handlers.get("fetch")({
    request: new Request(origin + assetPath, {
      headers: { range: "bytes=0-31" },
    }),
    respondWith: (promise) => {
      responsePromise = promise;
    },
  });

  const response = await responsePromise;
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-31/64");
  assert.equal(response.headers.get("content-length"), "32");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal((await response.arrayBuffer()).byteLength, 32);
});

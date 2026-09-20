import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("returns same-origin country data without touching static assets", async () => {
  let assetCalls = 0;
  const response = await worker.fetch(
    new Request("https://example.test/api/locale", {
      headers: { "cf-ipcountry": "RU" },
    }),
    {
      ASSETS: {
        fetch: async () => {
          assetCalls += 1;
          return new Response("unexpected");
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { country: "RU" });
  assert.equal(assetCalls, 0);
});

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("caches only fingerprinted build assets for repeat visits", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/assets/index-C7d9xQ2a.js"),
    {
      ASSETS: { fetch: async () => new Response("asset", { status: 200 }) },
    },
  );

  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("caches versioned selected works video media for repeat visits", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/assets/selected-works/selected-work-mascot-v1.mp4"),
    {
      ASSETS: { fetch: async () => new Response("video", { status: 200 }) },
    },
  );

  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("embeds the country language before the application starts rendering", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/", {
      headers: { accept: "text/html", "cf-ipcountry": "RU" },
    }),
    {
      ASSETS: {
        fetch: async () =>
          new Response("<!doctype html><html lang=\"en\"><body></body></html>", {
            headers: { "content-type": "text/html; charset=utf-8" },
          }),
      },
    },
  );

  assert.match(await response.text(), /<html data-country-language="ru" lang="en">/);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

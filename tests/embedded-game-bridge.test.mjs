import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { transformWithEsbuild } from "vite";

test("self-hosted game communicates only with its own parent origin, including without a referrer", async () => {
  const source = await readFile(new URL("../embedded/beautybomb/src/integration/portfolioEmbed.ts", import.meta.url), "utf8");
  const { code } = await transformWithEsbuild(source, "portfolioEmbed.ts", {
    loader: "ts",
    define: { "import.meta.env.VITE_PORTFOLIO_PARENT_ORIGIN": "undefined" },
  });
  const bridgeModule = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  const origin = "https://portfolio.example";
  const handlers = new Map(), messages = [], activity = [];
  const parent = { postMessage: (message, target) => messages.push({ message, target }) };
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  globalThis.window = {
    location: { origin, search: "?embed=portfolio" }, parent,
    addEventListener: (name, handler) => handlers.set(name, handler),
    removeEventListener: (name) => handlers.delete(name),
  };
  globalThis.document = { referrer: "" };
  try {
    const bridge = bridgeModule.installPortfolioEmbedBridge({ onHostActivityChange: active => activity.push(active) });
    const message = { source: "portfolio-host", version: 1, type: "set-game-active", active: false };
    handlers.get("message")({ origin: "https://untrusted.example", source: parent, data: message });
    handlers.get("message")({ origin, source: {}, data: message });
    assert.deepEqual(activity, []);
    handlers.get("message")({ origin, source: parent, data: message });
    assert.deepEqual(activity, [false]);
    assert.equal(bridgeModule.requestPortfolioEmbedClose(), true);
    assert.equal(bridgeModule.requestPortfolioEmbedClose(), false);
    assert.deepEqual(messages, [{ message: bridgeModule.PORTFOLIO_CLOSE_REQUEST, target: origin }]);
    bridge.dispose();
    assert.equal(handlers.size, 0);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
